import fetch from 'node-fetch'
import fs from 'fs'

export function downloadFile(url, filename) {
  return new Promise((resolve, reject) => {
    const fileStream = fs.createWriteStream(filename)
    fetch(url).then((res) => {
      res.body.pipe(fileStream)
      fileStream.on('finish', () => {
        resolve()
      })
      fileStream.on('connectionError', () => {
        reject()
      })
    })
  })
}