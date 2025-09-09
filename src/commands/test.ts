import { loadConfig } from '../utils/config.js'
import { createSource } from '../sources/base.js'
import { createProvider } from '../providers/base.js'

export async function test(options: {
  config: string
  ai?: string
}): Promise<void> {
  if (!options.ai) {
    console.error('Specify a task: docworks test --ai "build hello world"')
    process.exit(1)
  }

  try {
    const config = await loadConfig(options.config || 'docworks.yml')
    const apiKey = process.env.OPENAI_API_KEY || config.api_key

    if (!apiKey) {
      console.error('❌ No API key found')
      process.exit(1)
    }

    // Load docs
    console.log('📚 Loading documentation...')
    const source = await createSource(config)
    const docs = await source.fetch()

    // Ask AI to complete task
    console.log(`\n🤖 Testing: "${options.ai}"\n`)

    const provider = createProvider(config.provider || 'openai', apiKey)
    const prompt = `
Using ONLY this documentation, ${options.ai}.
Provide working code.

Documentation:
${docs.substring(0, 30000)}

Provide ONLY the code, no explanation.`

    const response = await provider.complete(prompt)

    console.log('Generated code:')
    console.log('─'.repeat(40))
    console.log(response)
    console.log('─'.repeat(40))

    // Future: Actually execute and validate the code
    console.log('\n✅ AI successfully generated code from documentation')
    console.log('⚠️  Code execution validation coming soon')
  } catch (error) {
    console.error('❌ Error:', (error as Error).message)
    process.exit(1)
  }
}
