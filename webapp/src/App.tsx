// @ts-nocheck

import './App.css'

import * as api from './api'

import { fromBase64JsonToObject, parseParams } from './util'
import toast, { Toaster } from 'react-hot-toast'
import { useEffect, useRef, useState } from 'react'

import Recorder from './Recorder'

const UPLOAD_STATES = {
  NOT_STARTED: 'NOT_STARTED',
  UPLOADING: 'UPLOADING',
  UPLOADED: 'UPLOADED',
  ERROR: 'ERROR',
}

function App() {
  const [uploadState, setUploadState] = useState(UPLOAD_STATES.NOT_STARTED)
  const [url, setUrl] = useState('')
  const videoNoteRef = useRef<HTMLVideoElement>(null)

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
      <Toaster />
      <video
        playsInline
        id="video"
        width="240"
        height="240"
        src={url}
        ref={videoNoteRef}
      ></video>
      <Recorder
        onStartCapture={() => {
          videoNoteRef.current.currentTime = 0
          videoNoteRef.current.play()
        }}
        onStopCapture={() => {
          videoNoteRef.current.pause()
        }}
        onVideoReady={(blob) => {
          setUploadState(UPLOAD_STATES.UPLOADING)
          const uploadingId = toast.loading('Uploading...')
          api
            .sendRecording(blob, url)
            .then(() => {
              setUploadState(UPLOAD_STATES.UPLOADED)
              toast.dismiss(uploadingId)
              toast.success('Uploaded! Closing the app in 3 seconds')
              window.setTimeout(() => {
                window.Telegram.WebApp.close()
              }, 3000)
            })
            .catch((e) => {
              setUploadState(UPLOAD_STATES.ERROR)
              toast.error('Upload failed!')
            })
        }}
      ></Recorder>
      {uploadState === UPLOAD_STATES.UPLOADING && (
        <div className="uploading">Uploading...</div>
      )}
      {uploadState === UPLOAD_STATES.UPLOADED && (
        <div className="uploaded">Uploaded!</div>
      )}
      {uploadState === UPLOAD_STATES.ERROR && (
        <div className="error">Error!</div>
      )}
      <div className="buttons-panel">
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
