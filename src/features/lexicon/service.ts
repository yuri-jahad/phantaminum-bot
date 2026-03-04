import * as fs from 'fs'
import * as path from 'path'
import csv from 'csv-parser'

export type LexiconWord = {
  ortho: string
  phon: string
  nbsyll: number
}

export class LexiconService {
  private dictionary: LexiconWord[] = []
  private isLoaded = false

  public async loadDictionary (): Promise<void> {
    if (this.isLoaded) return

    const filePath = path.join(import.meta.dir, '../../data/lexicon.tsv')

    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv({ separator: '\t' })) 
        .on('data', row => {
          const ortho = row.ortho
          const phono = row.Lexique4__Phono || row.Phono || row.phon 
          const syllNb = row.Lexique4__SyllNb || row.SyllNb || row.nbsyll

          if (ortho && phono) {
            this.dictionary.push({
              ortho: ortho.trim(),
              phon: phono.trim(),
              nbsyll: parseInt(syllNb, 10) || 0
            })
          }
        })
        .on('end', () => {
          this.isLoaded = true
          console.log(
            `[LexiconService] Dictionnaire Lexique4 charge : ${this.dictionary.length} mots.`
          )
          resolve()
        })
        .on('error', error => {
          console.error(
            '[LexiconService] Erreur lors du chargement du fichier :',
            error
          )
          reject(error)
        })
    })
  }

  /**
   * Cherche des mots selon un son et (optionnellement) un nombre de syllabes
   */
  public searchWords (
    targetPhon: string,
    targetSyllables?: number
  ): LexiconWord[] {
    if (!this.isLoaded) {
      throw new Error("Le dictionnaire n'est pas encore charge.")
    }

    return this.dictionary.filter(word => {
      const matchPhon = word.phon.includes(targetPhon)

      if (targetSyllables) {
        return matchPhon && word.nbsyll === targetSyllables
      }

      return matchPhon
    })
  }
}

export const lexiconService = new LexiconService()
