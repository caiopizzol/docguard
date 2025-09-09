import fs from 'fs'
import yaml from 'yaml'
import { DocGuardConfig } from '../types/config.js'

export async function loadConfig(configPath: string): Promise<DocGuardConfig> {
  if (!fs.existsSync(configPath)) {
    throw new Error(`Config file not found: ${configPath}`)
  }

  const content = fs.readFileSync(configPath, 'utf-8')
  const config = yaml.parse(content)

  // Validate config
  if (!config.source) {
    throw new Error('Config missing "source" section')
  }

  if (!config.journeys) {
    throw new Error('Config missing "journeys" section')
  }

  return config as DocGuardConfig
}
