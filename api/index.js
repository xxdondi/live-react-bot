import { Input, Telegraf, } from 'telegraf'

import Fastify from 'fastify'
import cors from '@fastify/cors'
import fetch from 'node-fetch'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegPath from '@ffmpeg-installer/ffmpeg'
import fs from 'fs'

const fastify = new Fastify({
  logger: true,
  bodyLimit: 12485760 * 5,
})

await fastify.register(cors, {
  origin: '*',
})


fastify.post('/api/uploadVideo', async (req) => {
  const json = req.body
  const blob = json['blob'],
    noteUrl = json['noteUrl'],
    userId = json['userId']

  await downloadFile(noteUrl, '/tmp/note.mp4')
  fs.writeFileSync('/tmp/userVideo.webm', Buffer.from(blob, 'base64'))
  await processVideo('/tmp/userVideo.webm', '/tmp/note.mp4')

  await fs.unlinkSync('/tmp/userVideo.webm')
  await fs.unlinkSync('/tmp/note.mp4')

  const bot = new Telegraf('6948869191:AAGsNU7mEvX58SY6DpoPgMoynUNaDaRj0aU')

  await bot.telegram.sendVideoNote(
    userId,
    // @ts-expect-error
    Input.fromLocalFile('/tmp/test.mp4')
  )
  await fs.unlinkSync('/tmp/test.mp4')

  return new Response(JSON.stringify({ status: 'ok' }), {
    status: 200,
  })
})

function downloadFile(url, filename) {
  return new Promise((resolve, reject) => {
    fetch(url).then((res) => {
      const fileStream = fs.createWriteStream(filename)
      // @ts-expect-error
      res.body.pipe(fileStream)
      fileStream.on('finish', () => {
        resolve()
      })
    })
  })
}

function processVideo(filename1, filename2) {
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(filename1)
      .input(filename2)
      .complexFilter(
        '[0:v]scale=320:-1[v0];[1:v]scale=320:-1[v1];[v0][v1]vstack'
      )
      .withFPSOutput(25)
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

async function main() {
  ffmpeg.setFfmpegPath(ffmpegPath.path)
  await fastify.listen({ host: '0.0.0.0', port: 80 })
}

main()
