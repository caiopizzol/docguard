// Terminal output formatter for DocGuard CLI
import { DetectionResult } from '@docguard/core'

export class TerminalFormatter {
  format(results: DetectionResult[]): string {
    if (results.length === 0) {
      return 'No documentation regressions detected\n'
    }

    const output: string[] = []

    for (const result of results) {
      // Simple, direct format - no emojis
      output.push(
        `✗ ${this.formatCategory(result.category)} removed from ${result.file}:${result.removals[0]?.line || '?'}`
      )

      if (result.removals.length > 0) {
        const removal = result.removals[0]
        const addition = result.additions[0]

        if (addition) {
          output.push(`  "${removal.value}" → "${addition.value}"`)
        } else {
          output.push(`  "${removal.value}"`)
        }
      }
    }

    output.push('')
    output.push(
      `This change removed critical terms. Verify this is intentional.`
    )

    return output.join('\n') + '\n'
  }

  private formatCategory(category: string): string {
    const formatted = category.replace(/_/g, ' ')
    return formatted.charAt(0).toUpperCase() + formatted.slice(1)
  }
}
