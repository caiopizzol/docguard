import Anthropic from '@anthropic-ai/sdk'
import { AIProvider, ValidationResult } from './base.js'

export class AnthropicProvider implements AIProvider {
  name = 'anthropic'
  private client: Anthropic
  private model: string

  constructor(apiKey: string, model = 'claude-3-5-sonnet-20241022') {
    this.client = new Anthropic({ apiKey })
    this.model = model
  }

  async checkAnswerability(
    question: string,
    docs: string
  ): Promise<ValidationResult> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 150,
      temperature: 0.1,
      messages: [
        {
          role: 'user',
          content: `Given this documentation, can it answer: "${question}"?

Documentation:
${docs.substring(0, 50000)}

Reply with:
ANSWER: [YES/PARTIAL/NO]
REASON: [One sentence]
LOCATION: [Where found, or "Not found"]`,
        },
      ],
    })

    const content =
      response.content[0].type === 'text' ? response.content[0].text : ''

    return {
      answerable: (content.match(/ANSWER:\s*(YES|PARTIAL|NO)/)?.[1] ||
        'NO') as any,
      reason: content.match(/REASON:\s*(.+)/)?.[1] || 'Could not determine',
      location: content.match(/LOCATION:\s*(.+)/)?.[1] || 'Not found',
    }
  }

  async complete(prompt: string): Promise<string> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 2000,
      temperature: 0.3,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    return response.content[0].type === 'text' ? response.content[0].text : ''
  }
}
