import fs from 'fs'

const TEMPLATES = {
  default: `# DocWorks Configuration
# Point to your documentation URL or local folder
source: https://docs.example.com  # or ./docs for local

journeys:
  getting_started:
    - How do I install this?
    - How do I get started?
    - Where are examples?
    
  development:
    - How do I run tests?
    - How do I debug issues?
    - Where can I get help?

provider: openai
model: gpt-4o-mini`,

  mintlify: `# DocWorks Configuration - Mintlify
source: https://docs.yourcompany.com  # Your Mintlify docs URL

journeys:
  api_reference:
    - Where is the API reference?
    - Are all endpoints documented?
    - Do examples work?
    
  getting_started:
    - Is there a quickstart guide?
    - How do I authenticate?
    - What SDKs are available?

provider: openai
model: gpt-4o-mini`,

  readme: `# DocWorks Configuration - ReadMe
source: https://docs.yourcompany.com  # Your ReadMe docs URL

journeys:
  developer_experience:
    - Can I try the API interactively?
    - Are there code examples?
    - Is versioning documented?

provider: openai
model: gpt-4o-mini`,

  gitbook: `# DocWorks Configuration - GitBook
source: https://docs.yourcompany.com  # Your GitBook URL

journeys:
  knowledge_base:
    - Is content organized logically?
    - Can I search effectively?
    - Are guides comprehensive?

provider: openai
model: gpt-4o-mini`,

  local: `# DocWorks Configuration - Local Documentation
source: ./docs  # Path to your documentation folder

journeys:
  getting_started:
    - How do I get started?
    - Where are examples?
    - What are the prerequisites?

provider: openai
model: gpt-4o-mini`,
}

export async function init(options: {
  template?: string
  platform?: string
}): Promise<void> {
  console.log('🚀 Initializing DocWorks...\n')

  // Check existing config
  if (fs.existsSync('docworks.yml')) {
    console.log('⚠️  docworks.yml already exists')
    process.exit(1)
  }

  // Select template
  const templateName = options.platform || options.template || 'default'
  const template = TEMPLATES[templateName as keyof typeof TEMPLATES]

  if (!template) {
    console.error(`Unknown template: ${templateName}`)
    console.log('Available: default, mintlify, readme, gitbook, local')
    process.exit(1)
  }

  // Write config
  fs.writeFileSync('docworks.yml', template)
  console.log('✅ Created docworks.yml\n')

  // Next steps
  console.log('Next steps:')
  console.log('1. Update the source URL to your documentation')
  console.log('2. Customize the journeys for your needs')
  console.log('3. Set your API key:')
  console.log('   export OPENAI_API_KEY=sk-...')
  console.log('4. Run validation:')
  console.log('   docworks check')
}
