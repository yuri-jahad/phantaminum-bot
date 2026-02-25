function rateLimit (timeStamp: number, time: number) {
  const timeToMS = time * 1000
  const currentTime = Date.now() - timeStamp
  if (currentTime >= timeToMS) {
    console.log('Terminé')
  } else {
    console.log(currentTime)
  }
}

const now = Date.now()

setInterval(() => rateLimit(now, 5), 1000)
