// Configuration loader for DocGuard CLI
import { readFileSync, existsSync } from 'fs'
import yaml from 'js-yaml'

export interface Config {
  watch?: Record<string, { terms: string[]; severity?: string }>
  ignore?: string[]
}

export async function loadConfig(
  path: string = 'docguard.yml'
): Promise<Record<string, any> | null> {
  if (!existsSync(path)) return null

  try {
    const config = yaml.load(readFileSync(path, 'utf8')) as Config

    if (!config.watch) return null

    const patterns: Record<string, any> = {}
    for (const [category, def] of Object.entries(config.watch)) {
      patterns[category] = [
        {
          terms: def.terms,
          severity: (def.severity as any) || 'warning',
        },
      ]
    }

    return patterns
  } catch {
    return null
  }
}
