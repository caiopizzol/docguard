import { loadConfig } from '../utils/config.js'
import { findDocs, readDocs } from '../utils/docs.js'
import { validateQuestions } from '../core/validator.js'
import { report } from '../utils/reporter.js'

export async function check(options: {
  config: string
  cache: boolean
  verbose: boolean
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
