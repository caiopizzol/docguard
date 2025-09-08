// Init command for DocGuard CLI
import { writeFileSync } from 'fs'

const DEFAULT_CONFIG = `# DocGuard configuration
version: 1

watch:
  authentication:
    terms: ["API key", "Bearer token", "Authorization"]
    severity: critical
    
  rate_limits:
    terms: ["rate limit", "requests per"]
    severity: warning
    
  errors:
    terms: ["error code", "status code"]
    severity: warning

# ignore:
#   - CHANGELOG.md
`

export class InitCommand {
  execute(): void {
    writeFileSync('docguard.yml', DEFAULT_CONFIG)
    console.log('Created docguard.yml')
  }
}
