export const startTime = Date.now()

export const formatUptimeService = (time: number): { display: string; details: any } => {
  const elapsedTime = Date.now() - time
  const seconds = Math.floor(elapsedTime / 1000) % 60
  const minutes = Math.floor(elapsedTime / (1000 * 60)) % 60
  const hours = Math.floor(elapsedTime / (1000 * 60 * 60)) % 24
  const days = Math.floor(elapsedTime / (1000 * 60 * 60 * 24))
  
  const display = `${days}j ${hours}h ${minutes}m ${seconds}s`
  
  return {
    display,
    details: { days, hours, minutes, seconds }
  }
}
