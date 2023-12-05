import ffmpeg from 'fluent-ffmpeg'
import ffmpegPath from '@ffmpeg-installer/ffmpeg'
import fs from 'fs'
import { processVideo } from './ffmpeg'

beforeAll(() => {
  ffmpeg.setFfmpegPath(ffmpegPath.path)
})

test(
  'creates a reaction video with test data',
  async () => {
    await processVideo(
      './test_data/reaction.mp4',
      './test_data/note.mp4',
      './test_data/output.mp4'
    )
    expect(fs.existsSync('./test_data/output.mp4')).toBe(true)
    fs.unlinkSync('./test_data/output.mp4')
  },
  5000 * 20
)
