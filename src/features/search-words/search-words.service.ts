import { shuffle } from '@shared/utils/array'
import safeRegexTest from 'safe-regex-test'

export const searchWordsService = (
  searchValue: string,
  array: string[],
  limit: number
): { results: string[]; total: number } => {
  try {
    const regex = new RegExp(searchValue, 'i')
    const tester = safeRegexTest(regex)
    const allResults: string[] = []
    const shuffledArray = shuffle(array)

    for (const item of shuffledArray) {
      if (tester(item)) {
        allResults.push(item.toUpperCase())
      }
    }

    return {
      results: allResults.slice(0, limit),
      total: allResults.length
    }
  } catch (error) {
    throw new Error('Invalid regular expression pattern')
  }
}
