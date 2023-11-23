export async function sendRecording(video: Blob, noteUrl: string) {
  const formData = new FormData()
  const videoBase64 = await blobToBase64(video)
  formData.append('video', video)
  return fetch('.netlify/functions/uploadVideoNote', {
    method: 'POST',
    body: JSON.stringify({
      noteUrl,
      blob: videoBase64,
    }),
  })
}

const blobToBase64 = (blob: Blob): Promise<string> => {
  const reader = new FileReader()
  reader.readAsDataURL(blob)
  return new Promise((resolve) => {
    reader.onloadend = () => {
      if (reader.result === null) {
        return resolve('')
      } else {
        if (typeof reader.result === 'string') {
          resolve(reader.result.split('base64,')[1])
        }
      }
    }
  })
}
