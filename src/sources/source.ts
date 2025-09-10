export async function fetchDocumentation(
  url: string
): Promise<{ content: string; name: string }> {
  try {
    // Try to fetch llms.txt
    const llmsTxtUrl = new URL('/llms.txt', url).href

    console.log(`Fetching ${llmsTxtUrl}...`)
    let response = await fetch(llmsTxtUrl)

    if (!response.ok) {
      // Maybe they provided the llms.txt URL directly
      response = await fetch(url)
      if (!response.ok) {
        throw new Error(`No llms.txt found at ${url}`)
      }
    }

    const content = await response.text()
    const name = `llms.txt from ${new URL(url).hostname}`

    console.log('✓ Fetched documentation\n')
    return { content, name }
  } catch (error: any) {
    throw new Error(
      `Failed to fetch documentation from ${url}: ${error.message}`
    )
  }
}
