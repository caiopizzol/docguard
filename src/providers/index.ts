import OpenAI from 'openai'

export interface ValidationResult {
  answerable: 'YES' | 'PARTIAL' | 'NO'
  reason: string
  location?: string
}

export async function callProvider(
  provider: string,
  model: string,
  apiKey: string,
  question: string,
  docs: string
): Promise<ValidationResult> {
  const prompt = `You have access to documentation via this llms.txt index:

${docs}

Can the documentation answer this question: "${question}"?

Based on the titles and structure, determine if this information is likely available.

Reply with:
ANSWER: [YES/PARTIAL/NO]
REASON: [One sentence explaining why]
LOCATION: [Which document(s) would contain this, or "Not found"]`

  switch (provider) {
    case 'openai': {
      const client = new OpenAI({ apiKey })
      const response = await client.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 500,
      })

      const content = response.choices[0].message.content || ''

      return {
        answerable: (content.match(/ANSWER:\s*(YES|PARTIAL|NO)/)?.[1] ||
          'NO') as any,
        reason: content.match(/REASON:\s*(.+)/)?.[1] || 'Could not determine',
        location: content.match(/LOCATION:\s*(.+)/)?.[1] || undefined,
      }
    }

    case 'anthropic': {
      // TODO: Add Anthropic support when needed
      throw new Error('Anthropic provider not yet implemented')
    }

    default:
      throw new Error(`Unknown provider: ${provider}`)
  }
}
