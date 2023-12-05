import 'dotenv/config'

import { Input, Telegraf } from 'telegraf'

import Fastify from 'fastify'
import cors from '@fastify/cors'
import { downloadFile } from './util.js'
import ffmpeg from 'fluent-ffmpeg'
import ffmpegPath from '@ffmpeg-installer/ffmpeg'
import fs from 'fs'
import { nanoid } from 'nanoid'
import { processVideo } from './ffmpeg.js'

async function main() {
  ffmpeg.setFfmpegPath(ffmpegPath.path)
  const fastify = new Fastify({
    logger: true,
    bodyLimit: 12485760 * 5,
  })

  await fastify.register(cors, {
    origin: '*',
  })

  fastify.post('/api/uploadVideo', async (req, reply) => {
    const json = req.body
    const blob = json['blob'],
      noteUrl = json['noteUrl'],
      userId = json['userId'],
      container = json['container']
    let reactionFileExtension = 'webm'
    if (container === 'video/mp4') {
      reactionFileExtension = 'mp4'
    }
    const uniqueId = `${nanoid()}-${userId}`
    const srcVideoFilename = `/tmp/srcVideo_${uniqueId}.mp4`,
      reactionFilename = `/tmp/reaction_${uniqueId}.${reactionFileExtension}`,
      outputFilename = `/tmp/output_${uniqueId}.mp4`

    await downloadFile(noteUrl, srcVideoFilename)

    fs.writeFileSync(reactionFilename, Buffer.from(blob, 'base64'))
    await processVideo(reactionFilename, srcVideoFilename, outputFilename)

    await fs.unlinkSync(reactionFilename)
    await fs.unlinkSync(srcVideoFilename)

    const bot = new Telegraf(process.env.BOT_TOKEN)

    await bot.telegram.sendVideo(userId, Input.fromLocalFile(outputFilename), {
      caption: 'Here is your reaction!',
    })
    await fs.unlinkSync(outputFilename)

    reply.code(200).send({ status: 'ok' })
  })

  await fastify.listen({ host: '0.0.0.0', port: 80 })
}

main()
