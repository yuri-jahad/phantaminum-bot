import { getDictionaryList } from '@core/dictionary/dictionary.repository.js'
import type { DictionaryList } from '@core/dictionary/dictionary.types.js'

class Dictionary {
  private static _instance: Dictionary | null = null
  private list: DictionaryList | null = null
  private constructor () {}

  static get instance (): Dictionary {
    if (!Dictionary._instance) {
      Dictionary._instance = new Dictionary()
    }
    return Dictionary._instance
  }

  async load (): Promise<void> {
    this.list = await getDictionaryList()
  }

  get data (): DictionaryList {
    if (!this.list) {
      throw new Error('Dictionary not loaded')
    }
    return this.list
  }
}
await Dictionary.instance.load()
export const words = Dictionary.instance.data
