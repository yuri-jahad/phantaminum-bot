export const ensureFile = async (
  filePath: string,
  defaultContent: string = '[]'
): Promise<boolean> => {
  try {
    const file = Bun.file(filePath)

    if (await file.exists()) {
      console.log(`ℹ️  ${filePath} existe déjà`)
      return false
    }

    await Bun.write(filePath, defaultContent)
    console.log(`Créé: ${filePath}`)
    return true
  } catch (error) {
    console.error(`Erreur ${filePath}:`, error)
    throw new Error(`Échec création ${filePath}: ${error}`)
  }
}
