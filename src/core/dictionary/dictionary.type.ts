export interface DictionaryList {
  success: boolean
  data: DictionaryData
  timestamp: string
}

export interface DictionaryData {
  words: string[]
  occurrences: Record<string, number>
}
