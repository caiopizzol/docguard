import OpenAI from 'openai'
import { AIProvider, ValidationResult } from './base.js'

export class OpenAIProvider implements AIProvider {
  name = 'openai'
  private client: OpenAI
  private model: string

  constructor(apiKey: string, model = 'gpt-5-nano-2025-08-07') {
    this.client = new OpenAI({ apiKey })
    this.model = model
  }

  async checkAnswerability(
    question: string,
    docs: string
  ): Promise<ValidationResult> {
    const prompt = `Given this documentation, can it answer: "${question}"?

Documentation:
${docs.substring(0, 50000)}

Reply with:
ANSWER: [YES/PARTIAL/NO]
REASON: [One sentence]
LOCATION: [Where found, or "Not found"]`

    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 150,
    })

    const content = response.choices[0].message.content || ''

    return {
      answerable: (content.match(/ANSWER:\s*(YES|PARTIAL|NO)/)?.[1] ||
        'NO') as any,
      reason: content.match(/REASON:\s*(.+)/)?.[1] || 'Could not determine',
      location: content.match(/LOCATION:\s*(.+)/)?.[1] || 'Not found',
    }
  }
}
//**
