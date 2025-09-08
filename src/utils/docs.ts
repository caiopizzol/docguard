import fs from 'fs'
import path from 'path'
import { glob } from 'glob'

export async function findDocs(basePath: string): Promise<string[]> {
  // Common documentation patterns
  const patterns = [
    'README.md',
    'readme.md',
    'docs/**/*.md',
    'documentation/**/*.md',
    '*.md',
    'wiki/**/*.md',
  ]

  const files = new Set<string>()

  for (const pattern of patterns) {
    const matches = await glob(pattern, {
      cwd: basePath,
      ignore: ['node_modules/**', '.git/**'],
    })
    matches.forEach((file) => files.add(file))
  }

  // Also check for llms.txt
  if (fs.existsSync(path.join(basePath, 'llms.txt'))) {
    files.add('llms.txt')
  }

  return Array.from(files)
}

export async function readDocs(files: string[]): Promise<string> {
  const contents: string[] = []

  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf-8')
      contents.push(`\n--- File: ${file} ---\n${content}`)
    } catch (error) {
      console.warn(`Warning: Could not read ${file}`)
    }
  }

  return contents.join('\n\n')
}
