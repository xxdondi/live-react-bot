import ffmpeg from 'fluent-ffmpeg'
import { Telegraf, Input } from 'telegraf'
import ffmpegPath from '@ffmpeg-installer/ffmpeg'
ffmpeg.setFfmpegPath(ffmpegPath.path)
const fs = require('fs')
import fetch from 'node-fetch'

function downloadFile(url: string, filename: string): Promise<void> {
  return new Promise((resolve, reject) => {
    fetch(url).then((res) => {
      const fileStream = fs.createWriteStream(filename)
      // @ts-expect-error
      res.body.pipe(fileStream)
      fileStream.on('finish', () => {
        console.log('download finished')
        resolve()
      })
    })
  })
}

function processVideo(filename1: string, filename2): Promise<void> {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(filename1)
      .input(filename2)
      .complexFilter(
        '[0:v]scale=320:-1[v0];[1:v]scale=320:-1[v1];[v0][v1]vstack'
      )
      .withFPSOutput(30)
      .output('/tmp/test.mp4')
      .on('end', function () {
        resolve()
        console.log('finished processing')
      })
      .on('error', function (err) {
        reject()
        console.log('an error happened: ' + err.message)
      })
      .run()
  })
}

export default async (req: Request) => {
  const json = await req.json()
  const blob = json['blob'],
    noteUrl = json['noteUrl']

  await downloadFile(noteUrl, '/tmp/note.mp4')
  fs.writeFileSync('/tmp/userVideo.webm', Buffer.from(blob, 'base64'))
  await processVideo('/tmp/userVideo.webm', '/tmp/note.mp4')

  await fs.unlinkSync('/tmp/userVideo.webm')
  await fs.unlinkSync('/tmp/note.mp4')

  const bot = new Telegraf('6948869191:AAGsNU7mEvX58SY6DpoPgMoynUNaDaRj0aU')

  bot.launch()
  await bot.telegram.sendVideoNote(
    16392240,
    // @ts-expect-error
    Input.fromLocalFile('/tmp/test.mp4')
  )
  await bot.stop()
  await fs.unlinkSync('/tmp/test.mp4')

  return new Response(JSON.stringify({ status: 'ok' }), {
    status: 200,
  })
}
