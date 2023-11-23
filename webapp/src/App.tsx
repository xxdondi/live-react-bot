// @ts-nocheck

import './App.css'

import * as api from './api'

import React, { useEffect, useRef, useState } from 'react'
import { fromBase64JsonToObject, parseParams } from './util'

import Webcam from 'react-webcam'

function App() {
  const [url, setUrl] = useState('')
  const webcamRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef(null)
  const [capturing, setCapturing] = useState(false)
  const [recordedChunks, setRecordedChunks] = useState([])

  const handleDataAvailable = React.useCallback(
    // @ts-expect-error
    ({ data }) => {
      if (data.size > 0) {
        setRecordedChunks((prev) => prev.concat(data))
      }
    },
    [setRecordedChunks]
  )

  const handleStartCaptureClick = React.useCallback(() => {
    setCapturing(true)
    // @ts-expect-error
    mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
      mimeType: 'video/webm',
    })
    // @ts-expect-error
    mediaRecorderRef.current.addEventListener(
      'dataavailable',
      handleDataAvailable
    )
    // @ts-expect-error
    mediaRecorderRef.current.start()
  }, [webcamRef, setCapturing, mediaRecorderRef, handleDataAvailable])

  const handleStopCaptureClick = React.useCallback(() => {
    // @ts-expect-error
    mediaRecorderRef.current.stop()
    setCapturing(false)
  }, [mediaRecorderRef, setCapturing])

  const send = React.useCallback(() => {
    if (recordedChunks.length) {
      const blob = new Blob(recordedChunks, {
        type: 'video/webm',
      })
      api.sendRecording(blob, url)
      setRecordedChunks([])
    }
  }, [recordedChunks, url])

  useEffect(() => {
    const query = parseParams(window.location.search)
    // @ts-expect-error
    const startData = fromBase64JsonToObject(query['data'])
    setUrl(startData.link)
  }, [])
  return (
    <div className="App">
      <video id="video" width="240" height="240" src={url}></video>
      <Webcam mirrored={true} ref={webcamRef} />
      {capturing ? (
        <button onClick={handleStopCaptureClick}>Stop Capture</button>
      ) : (
        <button onClick={handleStartCaptureClick}>Start Capture</button>
      )}
      {recordedChunks.length > 0 && <button onClick={send}>Send</button>}
    </div>
  )
}

export default App
