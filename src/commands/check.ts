import { DocWorksConfig, JourneyResults } from '../types/config.js'
import { loadConfig } from '../utils/config.js'
import { fetchDocumentation } from '../sources/source.js'
import { validateJourneys, validateQuestions } from '../core/validator.js'
import { formatReport, formatJSON } from '../utils/reporter.js'

export async function check(options: {
  config: string
  journey?: string
  format?: 'terminal' | 'json'
  provider?: string
  model?: string
}): Promise<void> {
  try {
    // Load config
    const config = await loadConfig(options.config || 'docworks.yml')

    // Apply overrides
    if (options.provider) config.provider = options.provider
    if (options.model) config.model = options.model

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
    const { content: docs, name: sourceName } = await fetchDocumentation(
      config.source
    )
    console.log(`Source: ${sourceName}\n`)

    // Prepare all validations
    const allValidations: Record<string, string[]> = {}

    // Add standalone questions as implicit "general" journey
    if (config.questions) {
      allValidations.general = config.questions
    }

    // Add explicit journeys
    if (config.journeys) {
      Object.assign(allValidations, config.journeys)
    }

    // Check if we have anything to validate
    if (Object.keys(allValidations).length === 0) {
      console.error('❌ No questions or journeys found in config')
      process.exit(1)
    }

    // Validate
    console.log('🔍 Validating documentation...\n')

    let results: JourneyResults

    if (options.journey) {
      // Validate single journey
      const questions = allValidations[options.journey]
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
          config
        ),
      }
    } else {
      // Validate all
      results = await validateJourneys(allValidations, docs, apiKey, config)
    }

    // Format output
    if (options.format === 'json') {
      console.log(formatJSON(results, sourceName))
      const hasFailures = Object.values(results).some((questions) =>
        questions.some((q) => q.answerable === 'NO')
      )
      process.exit(hasFailures ? 1 : 0)
    } else {
      const exitCode = formatReport(results)
      process.exit(exitCode)
    }
  } catch (error) {
    console.error('❌ Error:', (error as Error).message)
    process.exit(1)
  }
}
