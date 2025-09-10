import OpenAI from 'openai'
import { ValidationResult } from '../types/config.js'

const VALIDATION_SCHEMA = {
  type: 'json_schema' as const,
  name: 'doc_validation',
  schema: {
    type: 'object',
    properties: {
      answerable: {
        type: 'string',
        enum: ['YES', 'PARTIAL', 'NO'],
      },
      confidence: {
        type: 'number',
        description: '0-1 confidence score',
      },
      path: {
        type: 'array',
        items: { type: 'string' },
        description: 'URLs visited to find answer',
      },
      reason: {
        type: 'string',
        description: 'Brief explanation',
      },
      missing: {
        type: ['array', 'null'],
        items: { type: 'string' },
        description: 'What info is missing (null if nothing is missing)',
      },
    },
    required: ['answerable', 'confidence', 'path', 'reason', 'missing'],
    additionalProperties: false,
  },
}

export async function callProvider(
  provider: string,
  model: string,
  apiKey: string,
  question: string,
  docs: string
): Promise<ValidationResult> {
  const prompt = `Documentation URLs available:
${docs}

Task: Search these docs to answer: "${question}"

Instructions:
1. Use web_search to explore the documentation
2. Track which pages you visit
3. Determine if docs can answer the question
4. Note what's missing if incomplete`

  switch (provider) {
    case 'openai': {
      const client = new OpenAI({ apiKey })

      try {
        const response = await client.responses.create({
          model,
          input: prompt,
          tools: [
            {
              type: 'web_search_preview',
            },
          ],
          tool_choice: 'required',
          text: {
            format: VALIDATION_SCHEMA,
          },
        })

        const content = response.output_text
        if (!content) {
          throw new Error('No response content from OpenAI')
        }

        const result = JSON.parse(content)

        return {
          question,
          ...result,
        }
      } catch (error) {
        console.error('OpenAI API error:', error)
        // Fallback response
        return {
          question,
          answerable: 'NO',
          confidence: 0,
          path: [],
          reason: 'Failed to validate due to API error',
          missing: ['Unable to complete validation'],
        }
      }
    }

    // Future providers - PRs welcome!
    case 'anthropic':
    case 'google':
      throw new Error(
        `${provider} provider coming soon. Currently only 'openai' is supported.`
      )

    default:
      throw new Error(`Unknown provider: ${provider}`)
  }
}
