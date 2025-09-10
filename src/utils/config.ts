import fs from 'fs'
import yaml from 'yaml'
import { DocWorksConfig } from '../types/config.js'

export async function loadConfig(configPath: string): Promise<DocWorksConfig> {
  if (!fs.existsSync(configPath)) {
    throw new Error(`Config file not found: ${configPath}`)
  }

  let content = fs.readFileSync(configPath, 'utf-8')

  // Replace environment variables (${VAR:-default} syntax)
  content = content.replace(/\$\{([^}]+)\}/g, (match, expr) => {
    const [varName, defaultValue] = expr.split(':-')
    return process.env[varName] || defaultValue || match
  })

  const config = yaml.parse(content)

  // Validate config
  if (!config.source) {
    throw new Error('Config missing "source" section')
  }

  if (!config.journeys && !config.questions) {
    throw new Error('Config must have either "questions" or "journeys" section')
  }

  if (
    config.threshold !== undefined &&
    (config.threshold < 0 || config.threshold > 100)
  ) {
    throw new Error('Threshold must be between 0 and 100')
  }

  return config as DocWorksConfig
}

export function getJourneyThreshold(
  journey: string,
  config: DocWorksConfig
): number {
  const journeyConfig = config.journeys?.[journey]
  if (
    journeyConfig &&
    !Array.isArray(journeyConfig) &&
    journeyConfig.threshold !== undefined
  ) {
    return journeyConfig.threshold
  }
  return config.threshold ?? 100
}
