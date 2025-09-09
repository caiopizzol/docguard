import fs from 'fs'
import path from 'path'
import { DocSource } from '../types/config.js'

export class LLMSTxtSource implements DocSource {
  name = 'llms.txt'
  private filepath = './llms.txt'

  async fetch(): Promise<string> {
    if (!fs.existsSync(this.filepath)) {
      throw new Error(
        'llms.txt not found. Create it with:\n' +
          '  docworks init\n\n' +
          'Or create manually listing your documentation files.'
      )
    }

    const content = fs.readFileSync(this.filepath, 'utf-8')
    const sources = content
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))

    if (sources.length === 0) {
      throw new Error('llms.txt is empty. Add your documentation files.')
    }

    const docs: string[] = []

    for (const source of sources) {
      // Handle URLs (future feature)
      if (source.startsWith('http')) {
        console.log(`⚠️  URL sources not yet supported: ${source}`)
        continue
      }

      // Handle local files
      if (fs.existsSync(source)) {
        const content = fs.readFileSync(source, 'utf-8')
        docs.push(`\n=== ${source} ===\n${content}`)
      } else {
        console.warn(`⚠️  File not found: ${source}`)
      }
    }

    if (docs.length === 0) {
      throw new Error('No valid documentation sources found in llms.txt')
    }

    return docs.join('\n\n')
  }
}
