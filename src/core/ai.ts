import { createProvider } from '../providers/base.js'

export async function checkAnswerability(
  question: string,
  docs: string,
  apiKey: string,
  provider = 'openai',
  model?: string
) {
  const aiProvider = createProvider(provider, apiKey, model)

  // Pass the llms.txt content directly to the AI
  const prompt = `You have access to documentation via this llms.txt index:

${docs}

Can the documentation answer this question: "${question}"?

Based on the titles and structure, determine if this information is likely available.

Reply with:
ANSWER: [YES/PARTIAL/NO]
REASON: [One sentence]
LOCATION: [Which document(s) would contain this, or "Not found"]`

  return await aiProvider.checkAnswerability(question, prompt)
}
