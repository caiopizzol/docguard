import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export async function init(options: { template: string }): Promise<void> {
  console.log('🚀 Initializing DocGuard...\n')

  // Check if config already exists
  if (fs.existsSync('docguard.yml')) {
    console.log('⚠️  docguard.yml already exists')
    return
  }

  // Load template
  const templatePath = path.join(
    __dirname,
    '../../templates',
    `${options.template}.yml`
  )
  const template = fs.readFileSync(templatePath, 'utf-8')

  // Write config
  fs.writeFileSync('docguard.yml', template)

  console.log('✅ Created docguard.yml')
  console.log('\nNext steps:')
  console.log('1. Review and customize the questions in docguard.yml')
  console.log('2. Set your OpenAI API key: export OPENAI_API_KEY=sk-...')
  console.log('3. Run: docguard check')
}
