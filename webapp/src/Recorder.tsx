import React, { useCallback, useRef, useState } from 'react'

import Webcam from 'react-webcam'

interface RecorderProps {
  onStartCapture(): void
  onStopCapture(): void
  onVideoReady(video: Blob): void
}

const Recorder: React.FC<RecorderProps> = (props) => {
  const { onStartCapture, onStopCapture, onVideoReady } = props

  const webcamRef = useRef<Webcam>(null)
  const mediaRecorderRef = useRef<MediaRecorder>(null)

  const [capturing, setCapturing] = useState(false)
  const [recordedChunks, setRecordedChunks] = useState<BlobPart[]>([])

  const handleDataAvailable = useCallback(
    // @ts-expect-error
    ({ data }) => {
      if (data.size > 0) {
        setRecordedChunks((prev) => prev.concat(data))
      }
    },
    [setRecordedChunks]
  )

  const handleStartCaptureClick = useCallback(() => {
    setCapturing(true)
    onStartCapture()

    const webmSupported = MediaRecorder.isTypeSupported('video/webm')
    // @ts-expect-error
    mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
      mimeType: webmSupported ? 'video/webm' : 'video/mp4',
    })
    mediaRecorderRef.current.addEventListener(
      'dataavailable',
      handleDataAvailable
    )
    mediaRecorderRef.current.start()
  }, [
    webcamRef,
    setCapturing,
    mediaRecorderRef,
    handleDataAvailable,
    onStartCapture,
  ])

  const handleStopCaptureClick = useCallback(() => {
    // @ts-expect-error
    mediaRecorderRef.current.stop()
    setCapturing(false)
    onStopCapture()
  }, [mediaRecorderRef, setCapturing, onStopCapture])

  const send = useCallback(() => {
    if (recordedChunks.length) {
      if (mediaRecorderRef.current !== null) {
        const blob = new Blob(recordedChunks, {
          type: mediaRecorderRef.current.mimeType,
        })
        onVideoReady(blob)
      }
      setRecordedChunks([])
    }
  }, [recordedChunks, onVideoReady])
  return (
    <div>
      <Webcam audio={true} muted={true} mirrored={true} ref={webcamRef} />
      {capturing ? (
        <button onClick={handleStopCaptureClick}>Stop ⏹️</button>
      ) : (
        <button onClick={handleStartCaptureClick}>Record 🔴</button>
      )}
      {recordedChunks.length > 0 && <button onClick={send}>Send ✅</button>}
    </div>
  )
}

export default Recorder
