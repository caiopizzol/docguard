import { DocWorksConfig, JourneyResults } from '../types/config.js'
import { loadConfig } from '../utils/config.js'
import { createSource } from '../sources/base.js'
import { validateJourneys, validateQuestions } from '../core/validator.js'
import { formatReport, formatJSON } from '../utils/reporter.js'

export async function check(options: {
  config: string
  journey?: string
  cache?: boolean
  format?: 'terminal' | 'json' | 'github'
}): Promise<void> {
  try {
    // Load config
    const config = await loadConfig(options.config || 'docworks.yml')

    // Validate API key
    const apiKey =
      process.env.OPENAI_API_KEY ||
      process.env.ANTHROPIC_API_KEY ||
      config.api_key

    if (!apiKey) {
      console.error('❌ No API key found\n')
      console.error('Set one of:')
      console.error('  export OPENAI_API_KEY=sk-...')
      console.error('  export ANTHROPIC_API_KEY=sk-ant-...')
      process.exit(1)
    }

    // Load documentation
    console.log('📚 Loading documentation...')
    const source = await createSource(config)
    console.log(`Source: ${source.name}\n`)

    const docs = await source.fetch()

    // Validate journeys
    console.log('🔍 Validating journeys...\n')

    let results: JourneyResults

    if (options.journey) {
      // Validate single journey
      const questions = config.journeys[options.journey]
      if (!questions) {
        console.error(`Journey "${options.journey}" not found`)
        process.exit(1)
      }

      console.log(`Journey: ${options.journey}`)
      console.log('─'.repeat(40))

      results = {
        [options.journey]: await validateQuestions(
          questions,
          docs,
          apiKey,
          options.cache !== false
        ),
      }
    } else {
      // Validate all journeys
      results = await validateJourneys(
        config.journeys,
        docs,
        apiKey,
        options.cache !== false
      )
    }

    // Format output
    if (options.format === 'json') {
      console.log(formatJSON(results, source.name))
      const hasFailures = Object.values(results).some((questions) =>
        questions.some((q) => q.answerable === 'NO')
      )
      process.exit(hasFailures ? 1 : 0)
    } else {
      const exitCode = formatReport(results, options.format === 'github')
      process.exit(exitCode)
    }
  } catch (error) {
    console.error('❌ Error:', (error as Error).message)
    process.exit(1)
  }
}
