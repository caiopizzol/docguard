import fs from 'fs'

const TEMPLATES = {
  simple: `# DocWorks Configuration
source: https://docs.example.com

# Simple list of questions to validate
questions:
  - How do I authenticate?
  - What are the rate limits?
  - How do I get started?
  - Where can I find examples?
  - How do I handle errors?

# Provider configuration (supports environment variables)
provider: \${PROVIDER:-openai}
model: \${MODEL:-gpt-4o-mini}`,

  journeys: `# DocWorks Configuration
source: https://docs.example.com

# Group questions by user journey
journeys:
  authentication:
    - How do I get API keys?
    - How do I authenticate requests?
    - What auth methods are supported?
    
  error_handling:
    - What error codes exist?
    - How should I handle rate limits?
    - Where are error examples?

# Provider configuration (supports environment variables)
provider: \${PROVIDER:-openai}
model: \${MODEL:-gpt-4o-mini}`,
}

export async function init(options: { template?: string }): Promise<void> {
  console.log('🚀 Initializing DocWorks...\n')

  // Check existing config
  if (fs.existsSync('docworks.yml')) {
    console.log('⚠️  docworks.yml already exists')
    process.exit(1)
  }

  // Select template
  const templateName = options.template || 'simple'
  const template = TEMPLATES[templateName as keyof typeof TEMPLATES]

  if (!template) {
    console.error(`Unknown template: ${templateName}`)
    console.log('Available: simple, journeys')
    process.exit(1)
  }

  // Write config
  fs.writeFileSync('docworks.yml', template)
  console.log('✅ Created docworks.yml\n')

  // Next steps
  console.log('Next steps:')
  console.log('1. Update the source URL to your documentation')
  console.log('2. Customize the questions for your needs')
  console.log('3. Set your API key:')
  console.log('   export OPENAI_API_KEY=sk-...')
  console.log('   # or for Anthropic:')
  console.log('   export ANTHROPIC_API_KEY=sk-ant-...')
  console.log('4. Run validation:')
  console.log('   docworks check')
}
