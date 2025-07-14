import ffmpeg from 'fluent-ffmpeg'

function reencodeVideo(srcVideoFilename, outputFilename) {
  return new Promise((resolve, reject) => {
    ffmpeg(srcVideoFilename)
      .videoCodec('libx264')
      .addOptions(['-profile:v high', '-level 4.0'])
      .audioCodec('copy')
      .output(outputFilename)
      .on('end', () => {
        console.log('Re-encoding completed.')
        resolve()
      })
      .on('error', (err) => {
        console.log('An error occurred: ' + err.message)
        reject()
      })
      .run()
  })
}

export async function processVideo(
  reactionFilename,
  srcVideoFilename,
  outputFilename
) {
  const reencodedFilename = '/tmp/' + Math.random() * 1000000 + '.mp4'
  await reencodeVideo(reactionFilename, reencodedFilename)
  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(reencodedFilename)
      .input(srcVideoFilename)
      .complexFilter([
        '[0:v]scale=320:320,setpts=PTS-STARTPTS[vReaction]', // Scale and set PTS for the first video
        '[1:v]scale=320:320,setpts=PTS-STARTPTS[vSrcVideo]', // Scale and set PTS for the second video
        '[vReaction][vSrcVideo]vstack', // Stack the two videos vertically
        '[0:a]volume=2.0,acompressor[enhanced_aSrcVideo]', // Split the first audio into two streams
        '[enhanced_aSrcVideo]asplit=2[aSrcVideo_sc][aSrcVideo_mix]',
        '[1:a][aSrcVideo_sc]sidechaincompress=threshold=0.1:ratio=2[bg]', // Apply sidechain compression
        '[bg][aSrcVideo_mix]amix=inputs=2[a]', // Merge and pan the audio
      ])
      .map('[a]')
      .withFPSOutput(24)
      .addOptions(['-preset fast', '-crf 24'])
      .addOutputOptions(['-shortest'])
      .output(outputFilename)
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
