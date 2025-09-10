import fs from 'fs'
import path from 'path'
import { glob } from 'glob'
import { DocSource } from '../types/config.js'

export class LocalSource implements DocSource {
  name: string

  constructor(private directory: string) {
    this.name = `Local: ${directory}`
  }

  async fetch(): Promise<string> {
    if (!fs.existsSync(this.directory)) {
      throw new Error(`Directory not found: ${this.directory}`)
    }

    // Find all markdown files
    const patterns = ['**/*.md', '**/*.mdx']

    const files: string[] = []
    for (const pattern of patterns) {
      const matches = await glob(pattern, {
        cwd: this.directory,
        ignore: ['node_modules/**', '.git/**'],
      })
      files.push(...matches)
    }

    if (files.length === 0) {
      throw new Error(`No markdown files found in ${this.directory}`)
    }

    console.log(`Found ${files.length} documentation files`)

    // Read all files
    const docs: string[] = []
    for (const file of files) {
      const filepath = path.join(this.directory, file)
      const content = fs.readFileSync(filepath, 'utf-8')
      docs.push(`\n=== ${file} ===\n${content}`)
    }

    return docs.join('\n\n')
  }
}
