const BASE     = 'https://mwamed.com/syllabe-boreale/server/api/vocabulary'
const password = process.env.API_DEF_TOKEN!

const post = async (endpoint: string, body: Record<string, any>) => {
  const res = await fetch(`${BASE}/data${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password, ...body })
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

export const phantApi = {
  synonymes:    (word: string)                              => post('/synonyms',     { word }),
  antonymes:    (word: string)                              => post('/antonyms',     { word }),
  etymologie:   (word: string)                              => post('/etymology',    { word }),
  ipa:          (word: string)                              => post('/ipa',          { word }),
  expressions:  (word: string)                              => post('/expressions',  { word }),
  mot:          (word: string, fields?: string[])           => post('/word',         fields ? { word, fields } : { word }),
  search:       (pattern: string, listname: string)         => post('/search',       { pattern, listname }),
  conjugaison:  (verb: string)                              => post('/conjugation',  { verb }),
  definitions:  (word: string, source?: string, limit?: number) =>
    post('/definitions', { word, ...(source ? { source } : {}), ...(limit ? { limit } : {}) }),
}
