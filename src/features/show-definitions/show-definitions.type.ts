export interface Definition {
  definition: string
  source_name: string
}

export interface DefinitionResult {
  success: boolean
  word_details: { word: string }
  definitions: Definition[]
}

export interface CommandResponse {
  success: boolean
  msg: string
}
