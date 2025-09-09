import { exec } from 'child_process'
import { promisify } from 'util'
import { DocSource } from '../types/config.js'

const execAsync = promisify(exec)

export class MCPSource implements DocSource {
  name: string

  constructor(private server: string) {
    this.name = `MCP: ${server}`
  }

  async fetch(): Promise<string> {
    try {
      // For MVP, execute MCP server command
      // Future: Use proper MCP SDK
      const { stdout } = await execAsync(
        `npx ${this.server} --list-docs`,
        { maxBuffer: 10 * 1024 * 1024 } // 10MB buffer
      )
      return stdout
    } catch (error) {
      throw new Error(
        `Failed to connect to MCP server: ${this.server}\n` +
          `Ensure the server package is installed and accessible.`
      )
    }
  }

  async search(query: string): Promise<string> {
    try {
      const { stdout } = await execAsync(
        `npx ${this.server} --search "${query}"`,
        { maxBuffer: 10 * 1024 * 1024 }
      )
      return stdout
    } catch {
      // Fallback to full fetch if search not supported
      return this.fetch()
    }
  }
}
