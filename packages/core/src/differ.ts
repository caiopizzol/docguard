// Git diff analysis for DocGuard
import { execSync } from 'child_process'
import { existsSync, readFileSync } from 'fs'
import { readdir, stat } from 'fs/promises'
import path from 'path'
import { FileChange } from './types'

export class GitDiffer {
  constructor(private basePath: string) {}

  /**
   * Get file changes between git commits
   */
  async getChangedFiles(
    baseCommit: string = 'HEAD',
    targetCommit?: string
  ): Promise<FileChange[]> {
    if (!this.isGitRepository()) {
      throw new Error(
        'Not a git repository. DocGuard needs a git repository to compare changes.'
      )
    }

    const changes: FileChange[] = []
    const diffCommand = targetCommit
      ? `git diff ${baseCommit}..${targetCommit} --name-only`
      : `git diff ${baseCommit} --name-only`

    try {
      const changedFiles = execSync(diffCommand, {
        cwd: this.basePath,
        encoding: 'utf8',
      })
        .trim()
        .split('\n')
        .filter(Boolean)

      for (const file of changedFiles) {
        if (this.isDocumentationFile(file)) {
          const change = await this.getFileChange(
            file,
            baseCommit,
            targetCommit
          )
          if (change) {
            changes.push(change)
          }
        }
      }
    } catch (error) {
      throw new Error(`Failed to get git diff: ${error}`)
    }

    return changes
  }

  /**
   * Get before/after content for a specific file
   */
  private async getFileChange(
    file: string,
    baseCommit: string,
    _targetCommit?: string
  ): Promise<FileChange | null> {
    const filePath = path.join(this.basePath, file)

    try {
      // Get current content (after)
      const after = existsSync(filePath) ? readFileSync(filePath, 'utf8') : ''

      // Get previous content (before)
      const beforeCommand = `git show ${baseCommit}:${file}`
      let before = ''

      try {
        before = execSync(beforeCommand, {
          cwd: this.basePath,
          encoding: 'utf8',
        })
      } catch {
        // File might be new or deleted
        before = ''
      }

      // Only return if there are actual changes
      if (before !== after) {
        return {
          path: file,
          before,
          after,
        }
      }
    } catch (error) {
      console.warn(`Warning: Could not process ${file}: ${error}`)
    }

    return null
  }

  /**
   * Check if directory is a git repository
   */
  private isGitRepository(): boolean {
    try {
      execSync('git rev-parse --git-dir', {
        cwd: this.basePath,
        stdio: 'ignore',
      })
      return true
    } catch {
      return false
    }
  }

  /**
   * Determine if file is documentation based on extension
   */
  private isDocumentationFile(file: string): boolean {
    const docExtensions = ['.md', '.mdx', '.rst', '.txt', '.adoc']
    const ext = path.extname(file).toLowerCase()
    return docExtensions.includes(ext)
  }

  /**
   * Get all documentation files in directory (for non-git mode)
   */
  async getAllDocFiles(): Promise<FileChange[]> {
    const changes: FileChange[] = []

    try {
      const files = await this.findDocFiles(this.basePath)

      for (const file of files) {
        const relativePath = path.relative(this.basePath, file)
        const content = readFileSync(file, 'utf8')

        changes.push({
          path: relativePath,
          before: content, // Same content for both - we're just checking current state
          after: content,
        })
      }
    } catch (error) {
      throw new Error(`Failed to read documentation files: ${error}`)
    }

    return changes
  }

  /**
   * Recursively find documentation files
   */
  private async findDocFiles(dir: string): Promise<string[]> {
    const files: string[] = []

    try {
      const entries = await readdir(dir)

      // Use Promise.all for parallel processing
      const stats = await Promise.all(
        entries.map(async (entry) => {
          const fullPath = path.join(dir, entry)
          const fileStat = await stat(fullPath)
          return { entry, fullPath, isDirectory: fileStat.isDirectory() }
        })
      )

      for (const { entry, fullPath, isDirectory } of stats) {
        if (isDirectory && !this.shouldIgnoreDirectory(entry)) {
          files.push(...(await this.findDocFiles(fullPath)))
        } else if (!isDirectory && this.isDocumentationFile(entry)) {
          files.push(fullPath)
        }
      }
    } catch {
      // Ignore errors for individual directories
    }

    return files
  }

  /**
   * Check if directory should be ignored
   */
  private shouldIgnoreDirectory(dirName: string): boolean {
    const ignoreDirs = [
      'node_modules',
      '.git',
      'dist',
      'build',
      '.next',
      'coverage',
    ]
    return ignoreDirs.includes(dirName) || dirName.startsWith('.')
  }
}
