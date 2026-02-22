export const definitionApiRepo = async (word: string) => {
  try {
    const response = await fetch(
      `https://mwamed.com/syllabe-boreale/server/api/vocabulary/def/word-name/${word}`
    )

    if (!response.ok) {
      console.error(`HTTP Error: ${response.status} ${response.statusText}`)
      throw new Error(`Request failed with status ${response.status}`)
    }

    const data = await response.json()
    console.log('Data loaded successfully')
    return data
  } catch (error) {
    console.error(
      'Request Error:',
      error instanceof Error ? error.message : 'Unknown error'
    )
    throw error
  }
}
