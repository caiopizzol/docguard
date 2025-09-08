import fs from 'fs'
import yaml from 'yaml'

export async function loadConfig(configPath: string): Promise<any> {
  if (!fs.existsSync(configPath)) {
    return null
  }

  const content = fs.readFileSync(configPath, 'utf-8')
  const config = yaml.parse(content)

  // Validate config
  if (!config.questions) {
    throw new Error('Config missing "questions" section')
  }

  return config
}
