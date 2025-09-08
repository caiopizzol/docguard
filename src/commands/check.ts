import { loadConfig } from '../utils/config.js'
import { findDocs, readDocs } from '../utils/docs.js'
import { validateQuestions } from '../core/validator.js'
import { report } from '../utils/reporter.js'

export async function check(options: {
  config: string
  cache: boolean
  verbose: boolean
  format?: string
}): Promise<void> {
  try {
    // Load configuration
    const config = await loadConfig(options.config)
    if (!config) {
      console.error('❌ No docguard.yml found. Run "docguard init" first.')
      process.exit(1)
    }

    // Check API key
    const apiKey = process.env.OPENAI_API_KEY || config.api_key
    if (!apiKey) {
      console.error('❌ OpenAI API key not found.')
      console.error(
        'Set OPENAI_API_KEY environment variable or add to docguard.yml'
      )
      process.exit(1)
    }

    console.log('📚 Reading documentation...\n')

    // Find and read all documentation
    const docFiles = await findDocs(config.docs_path || '.')
    const docs = await readDocs(docFiles)

    if (!docs || docs.length === 0) {
      console.error('❌ No documentation files found')
      process.exit(1)
    }

    console.log(`Found ${docFiles.length} documentation files\n`)
    console.log('🤔 Checking if questions are answerable...\n')

    // Validate each question
    const results = await validateQuestions(
      config.questions,
      docs,
      apiKey,
      options.cache !== false
    )

    // Handle JSON output format
    if (options.format === 'json') {
      const allQuestions = [
        ...(results.critical || []),
        ...(results.important || []),
        ...(results.nice_to_have || []),
      ]

      const exitCode = results.critical?.some((r: any) => r.answerable === 'NO')
        ? 1
        : 0

      const output = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        summary: {
          total: allQuestions.length,
          passing: allQuestions.filter((q: any) => q.answerable === 'YES')
            .length,
          failing: allQuestions.filter((q: any) => q.answerable === 'NO')
            .length,
          partial: allQuestions.filter((q: any) => q.answerable === 'PARTIAL')
            .length,
        },
        results: {
          critical: results.critical || [],
          important: results.important || [],
          nice_to_have: results.nice_to_have || [],
        },
        exitCode,
      }

      console.log(JSON.stringify(output, null, 2))
      process.exit(exitCode)
    }

    // Report results
    const exitCode = report(results, options.verbose)
    process.exit(exitCode)
  } catch (error) {
    console.error('❌ Error:', (error as Error).message)
    if (options.verbose) {
      console.error((error as Error).stack)
    }
    process.exit(1)
  }
}
