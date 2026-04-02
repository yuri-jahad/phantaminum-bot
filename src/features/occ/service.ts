import { words } from '@core/dictionary/cache'
import { shuffle } from '@shared/utils/array'

export const processSyllables = (args: string[]): Map<string, Set<string>> => {
  if (!args || args.length === 0) return new Map<string, Set<string>>()
  if (!words?.data) return new Map<string, Set<string>>()

  const mode = args[0]
  if (mode !== 'pick' && mode !== 'omit') return new Map<string, Set<string>>()

  const val1 = args[1] ? Number(args[1]) : NaN
  const val2 = args[2] ? Number(args[2]) : NaN
  
  if (!Number.isFinite(val1)) return new Map<string, Set<string>>()

  const hasVal2 = Number.isFinite(val2)
  const isPick = mode === 'pick'
  const { occurrences, words: wordList } = words.data

  const targetSets: Record<string, Set<string>> = Object.create(null)
  const keys = Object.keys(occurrences)
  const keysLen = keys.length
  let hasTargets = false

  for (let i = 0; i < keysLen; i++) {
    const k = keys[i] as string
    const len = k.length
    if (len === 2 || len === 3) {
      const occ = occurrences[k] as number
      const match = hasVal2 ? (occ >= val1 * 2 && occ <= val2 * 2) : (occ === val1 * 2)

      if (isPick ? match : !match) {
        targetSets[k] = new Set<string>()
        hasTargets = true
      }
    }
  }

  if (!hasTargets) return new Map<string, Set<string>>()

  const wlLen = wordList.length

  for (let j = 0; j < wlLen; j++) {
    const w = wordList[j]
    if (!w) continue 

    const wLen = w.length
    const limit = wLen - 1

    for (let i = 0; i < limit; i++) {
      const set2 = targetSets[w.substring(i, i + 2)]
      if (set2 !== undefined) set2.add(w)

      const i3 = i + 3
      if (i3 <= wLen) {
        const set3 = targetSets[w.substring(i, i3)]
        if (set3 !== undefined) set3.add(w)
      }
    }
  }

  const finalMap = new Map<string, Set<string>>()
  const targetKeys = Object.keys(targetSets)
  const tKeysLen = targetKeys.length

  for (let i = 0; i < tKeysLen; i++) {
    const k = targetKeys[i] as string
    const set = targetSets[k] as Set<string>
    if (set.size > 0) {
      finalMap.set(k, set)
    }
  }

  return finalMap
}

export const getRandomSyllableData = (syllablesMap: Map<string, Set<string>>): [string, Set<string>] | null => {
  if (!syllablesMap || syllablesMap.size === 0) return null
  const entries = Array.from(syllablesMap.entries())
  const shuffled = shuffle(entries)[0]
  return shuffled !== undefined ? shuffled : null
}
