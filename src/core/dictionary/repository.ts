import type { DictionaryList } from '@core/dictionary/type.js'

export async function getDictionaryList (): Promise<DictionaryList> {
  try {
    const response = await fetch(
      'https://mwamed.com/syllabe-boreale/server/api/vocabulary/get-list',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          password: process.env.API_DEF_TOKEN,
          choice: 'word',
          occ: true
        })
      }
    )

    if (!response.ok) {
      console.error(`HTTP Error: ${response.status} ${response.statusText}`)
      throw new Error(`Request failed with status ${response.status}`)
    }

    const data = await response.json()
    console.log('Data loaded successfully')
    return data as DictionaryList
  } catch (error) {
    console.error(
      'Request Error:',
      error instanceof Error ? error.message : 'Unknown error'
    )
    throw error
  }
}
