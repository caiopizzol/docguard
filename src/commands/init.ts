import fs from 'fs'
import path from 'path'
import { glob } from 'glob'

const TEMPLATES = {
  default: `# DocGuard Configuration
source: ./llms.txt

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

  api: `# DocGuard Configuration - API Documentation
source: ./llms.txt

journeys:
  authentication:
    - How do I authenticate?
    - Where do I get API keys?
    - What auth methods are supported?
    
  integration:
    - What are the endpoints?
    - How do I handle errors?
    - What are the rate limits?
    
  production:
    - How do I monitor usage?
    - Where are status pages?
    - How do I get support?

provider: openai
model: gpt-4o-mini`,

  library: `# DocGuard Configuration - Library/Package
source: ./llms.txt

journeys:
  setup:
    - How do I install this package?
    - How do I import it?
    - What are the requirements?
    
  basic_usage:
    - What's a hello world example?
    - What are the main functions?
    - How do I configure options?
    
  typescript:
    - Does it have TypeScript support?
    - Where are the type definitions?
    - How do I use with TypeScript?

provider: openai
model: gpt-4o-mini`,

  mintlify: `# DocGuard Configuration - Mintlify
source:
  type: mcp
  server: "@mintlify/mcp-server"

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

  readme: `# DocGuard Configuration - ReadMe
source:
  type: mcp
  server: "@readme/mcp-server"

journeys:
  developer_experience:
    - Can I try the API interactively?
    - Are there code examples?
    - Is versioning documented?

provider: openai
model: gpt-4o-mini`,

  gitbook: `# DocGuard Configuration - GitBook
source:
  type: mcp
  server: "@gitbook/mcp-server"

journeys:
  knowledge_base:
    - Is content organized logically?
    - Can I search effectively?
    - Are guides comprehensive?

provider: openai
model: gpt-4o-mini`,
}

export async function init(options: {
  template?: string
  platform?: string
}): Promise<void> {
  console.log('🚀 Initializing DocGuard...\n')

  // Check existing config
  if (fs.existsSync('docguard.yml')) {
    console.log('⚠️  docguard.yml already exists')
    process.exit(1)
  }

  // Select template
  const templateName = options.platform || options.template || 'default'
  const template = TEMPLATES[templateName as keyof typeof TEMPLATES]

  if (!template) {
    console.error(`Unknown template: ${templateName}`)
    console.log('Available: default, api, library, mintlify, readme, gitbook')
    process.exit(1)
  }

  // Create llms.txt if needed (not for MCP platforms)
  if (!options.platform && !fs.existsSync('llms.txt')) {
    await createLLMSTxt()
  }

  // Write config
  fs.writeFileSync('docguard.yml', template)
  console.log('✅ Created docguard.yml\n')

  // Next steps
  console.log('Next steps:')
  if (!options.platform) {
    console.log('1. Review llms.txt - ensure all docs are listed')
  }
  console.log('2. Set your API key:')
  console.log('   export OPENAI_API_KEY=sk-...')
  console.log('3. Run validation:')
  console.log('   docguard check')
}

async function createLLMSTxt(): Promise<void> {
  console.log('📝 Creating llms.txt...')

  // Find common documentation files
  const patterns = ['README.md', 'readme.md', 'docs/**/*.md', '*.md']

  const files = new Set<string>()
  for (const pattern of patterns) {
    const matches = await glob(pattern, {
      ignore: ['node_modules/**', '.git/**', 'CHANGELOG.md'],
    })
    matches.forEach((file) => files.add(file))
  }

  const content = [
    '# Documentation sources for DocGuard',
    '# Add your documentation files below, one per line',
    '# Lines starting with # are comments',
    '',
    ...Array.from(files).slice(0, 20), // Limit initial list
    '',
    '# Add more files as needed:',
    '# docs/api/authentication.md',
    '# examples/quickstart.js',
    '# https://api.example.com/openapi.json',
  ].join('\n')

  fs.writeFileSync('llms.txt', content)
  console.log(`✅ Created llms.txt with ${files.size} documentation files\n`)
}
