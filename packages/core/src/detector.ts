// Main detection engine for DocGuard
import {
  DetectionResult,
  Term,
  Context,
  PatternSet,
  FileChange,
  DetectorOptions,
} from './types'
import { getDefaultPatterns } from './patterns'

export class Detector {
  private patterns: PatternSet
  private contextLines: number

  constructor(options: DetectorOptions = {}) {
    this.patterns = options.patterns || getDefaultPatterns()
    this.contextLines = options.contextLines || 3
  }

  /**
   * Detect documentation regressions in file changes
   */
  detect(changes: FileChange[]): DetectionResult[] {
    const results: DetectionResult[] = []

    for (const change of changes) {
      const fileResults = this.detectInFile(change)
      results.push(...fileResults)
    }

    return results
  }

  /**
   * Detect changes in a single file
   */
  private detectInFile(change: FileChange): DetectionResult[] {
    const results: DetectionResult[] = []

    // Split content into lines for analysis
    const beforeLines = change.before.split('\n')
    const afterLines = change.after.split('\n')

    // Check each pattern category
    for (const [category, patterns] of Object.entries(this.patterns)) {
      for (const pattern of patterns) {
        const result = this.detectPattern(
          change.path,
          category,
          pattern,
          beforeLines,
          afterLines
        )
        if (
          result &&
          (result.removals.length > 0 || result.additions.length > 0)
        ) {
          results.push(result)
        }
      }
    }

    return results
  }

  /**
   * Detect a specific pattern in before/after content
   */
  private detectPattern(
    file: string,
    category: string,
    pattern: any,
    beforeLines: string[],
    afterLines: string[]
  ): DetectionResult | null {
    const removals: Term[] = []
    const additions: Term[] = []

    // Find terms that existed in 'before' but not in 'after'
    const beforeTerms = this.findTermsInLines(beforeLines, pattern)
    const afterTerms = this.findTermsInLines(afterLines, pattern)

    // Detect removals
    for (const beforeTerm of beforeTerms) {
      const stillExists = afterTerms.some((afterTerm) =>
        this.termsMatch(beforeTerm.value, afterTerm.value)
      )

      if (!stillExists) {
        removals.push(beforeTerm)
      }
    }

    // Detect additions
    for (const afterTerm of afterTerms) {
      const existedBefore = beforeTerms.some((beforeTerm) =>
        this.termsMatch(beforeTerm.value, afterTerm.value)
      )

      if (!existedBefore) {
        additions.push(afterTerm)
      }
    }

    // Only return result if there are significant changes
    if (removals.length === 0 && additions.length === 0) {
      return null
    }

    // Get context for the first removal or addition
    const contextTerm = removals[0] || additions[0]
    const contextLines = removals.length > 0 ? beforeLines : afterLines
    const context = this.getContext(contextLines, contextTerm.line)

    return {
      file,
      category,
      severity: pattern.severity,
      removals,
      additions,
      context,
    }
  }

  /**
   * Find pattern terms in lines of text
   */
  private findTermsInLines(lines: string[], pattern: any): Term[] {
    const terms: Term[] = []

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex]

      // Check regular terms
      for (const term of pattern.terms) {
        const matches = this.findTermInLine(line, term, lineIndex)
        terms.push(...matches)
      }

      // Check regex pattern if provided
      if (pattern.regex) {
        const regexMatches = this.findRegexInLine(
          line,
          pattern.regex,
          lineIndex
        )
        terms.push(...regexMatches)
      }
    }

    return terms
  }

  /**
   * Find term occurrences in a single line
   */
  private findTermInLine(
    line: string,
    term: string,
    lineNumber: number
  ): Term[] {
    const terms: Term[] = []
    const lowerLine = line.toLowerCase()
    const lowerTerm = term.toLowerCase()

    let startIndex = 0
    while (true) {
      const index = lowerLine.indexOf(lowerTerm, startIndex)
      if (index === -1) break

      terms.push({
        value: line.substring(index, index + term.length),
        line: lineNumber + 1, // 1-indexed for display
        column: index + 1, // 1-indexed for display
      })

      startIndex = index + 1
    }

    return terms
  }

  /**
   * Find regex matches in a single line
   */
  private findRegexInLine(
    line: string,
    regex: RegExp,
    lineNumber: number
  ): Term[] {
    const terms: Term[] = []
    const matches = line.matchAll(new RegExp(regex.source, regex.flags + 'g'))

    for (const match of matches) {
      if (match.index !== undefined) {
        terms.push({
          value: match[0],
          line: lineNumber + 1,
          column: match.index + 1,
        })
      }
    }

    return terms
  }

  /**
   * Check if two terms should be considered the same
   */
  private termsMatch(term1: string, term2: string): boolean {
    // Handle null/undefined inputs safely
    if (!term1 || !term2) {
      return false
    }
    return term1.toLowerCase().trim() === term2.toLowerCase().trim()
  }

  /**
   * Get context lines around a term
   */
  private getContext(lines: string[], termLine: number): Context {
    const lineIndex = termLine - 1 // Convert to 0-indexed
    const startIndex = Math.max(0, lineIndex - this.contextLines)
    const endIndex = Math.min(lines.length - 1, lineIndex + this.contextLines)

    return {
      before: lines.slice(startIndex, lineIndex),
      after: lines.slice(lineIndex + 1, endIndex + 1),
      changeType: 'removal', // This could be enhanced to detect modification vs removal
    }
  }
}
