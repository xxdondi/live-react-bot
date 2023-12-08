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
      console.log('mediaRecorder.ondataavailable, e.data.size=' + data.size)
      if (data.size > 0) {
        setRecordedChunks((prev) => prev.concat(data))
      }
    },
    [setRecordedChunks]
  )

  const handleStartCaptureClick = useCallback(() => {
    if (webcamRef.current !== null && webcamRef.current.stream !== null) {
      setCapturing(true)
      onStartCapture()

      let mrOptions
      if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
        mrOptions = { mimeType: 'video/webm;codecs=vp9' }
      } else if (MediaRecorder.isTypeSupported('video/webm;codecs=h264')) {
        mrOptions = { mimeType: 'video/webm;codecs=h264' }
      } else if (MediaRecorder.isTypeSupported('video/webm')) {
        mrOptions = { mimeType: 'video/webm' }
      } else if (MediaRecorder.isTypeSupported('video/mp4')) {
        mrOptions = { mimeType: 'video/mp4' }
      }
      if (mrOptions !== undefined) {
        console.log('Using MIME =' + mrOptions.mimeType)
      } else {
        console.log(
          "No supported MIME type found, falling back to browser's default"
        )
      }
      // @ts-expect-error
      mediaRecorderRef.current = new MediaRecorder(
        webcamRef.current.stream,
        mrOptions
      )
      mediaRecorderRef.current.addEventListener(
        'dataavailable',
        handleDataAvailable
      )
      mediaRecorderRef.current.addEventListener('error', (e) => {
        console.log('mediaRecorder.onerror: ' + e)
      })
      mediaRecorderRef.current.start()
    }
  }, [
    webcamRef,
    setCapturing,
    mediaRecorderRef,
    handleDataAvailable,
    onStartCapture,
  ])

  const handleStopCaptureClick = useCallback(() => {
    if (mediaRecorderRef.current === null) {
      console.error('mediaRecorderRef.current is null, cannot stop')
    } else {
      mediaRecorderRef.current.stop()
      setCapturing(false)
      onStopCapture()
    }
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
      <Webcam
        audio={true}
        muted={true}
        videoConstraints={{
          facingMode: 'user',
        }}
        mirrored={true}
        ref={webcamRef}
      />
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
