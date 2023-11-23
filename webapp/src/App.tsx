// @ts-nocheck

import './App.css'

import * as api from './api'

import React, { useEffect, useRef, useState } from 'react'
import { fromBase64JsonToObject, parseParams } from './util'

import Webcam from 'react-webcam'

/*
const UPLOAD_STATES = {
  NOT_STARTED: 'NOT_STARTED',
  UPLOADING: 'UPLOADING',
  UPLOADED: 'UPLOADED',
  ERROR: 'ERROR',
}
*/
function App() {
  const [url, setUrl] = useState('')
  const videoNoteRef = useRef<HTMLVideoElement>(null)
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
    videoNoteRef.current.currentTime = 0
    videoNoteRef.current.play()
    const webmSupported = MediaRecorder.isTypeSupported('video/webm')
    // @ts-expect-error
    mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
      mimeType: webmSupported ? 'video/webm' : 'video/mp4',
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
    videoNoteRef.current?.pause()
    // @ts-expect-error
    mediaRecorderRef.current.stop()
    setCapturing(false)
  }, [mediaRecorderRef, setCapturing])

  const send = React.useCallback(() => {
    if (recordedChunks.length) {
      const blob = new Blob(recordedChunks, {
        type: mediaRecorderRef.current.mimeType,
      })
      api
        .sendRecording(blob, url)
        .then(() => {})
        .catch((e) => {})
      setRecordedChunks([])
    }
  }, [recordedChunks, url])

  useEffect(() => {
    const query = parseParams(window.location.search)
    // @ts-expect-error
    const startData = fromBase64JsonToObject(query['data'])
    setUrl(startData.link)
    if (window.Telegram) {
      window.Telegram.WebApp.ready()
      window.Telegram.WebApp.expand()
    }
  }, [])
  return (
    <div className="App">
      <video
        playsInline
        id="video"
        width="240"
        height="240"
        src={url}
        ref={videoNoteRef}
      ></video>
      <Webcam mirrored={true} ref={webcamRef} />
      <div className="buttons-panel">
        {capturing ? (
          <button onClick={handleStopCaptureClick}>Stop ⏹️</button>
        ) : (
          <button onClick={handleStartCaptureClick}>Record 🔴</button>
        )}
        {recordedChunks.length > 0 && <button onClick={send}>Send ✅</button>}
        <button
          onClick={() => {
            window.Telegram.WebApp.openLink(window.location.href, {
              try_instant_view: false,
            })
          }}
        >
          Open External 🔄
        </button>
      </div>
    </div>
  )
}

export default App
