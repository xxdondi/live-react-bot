// @ts-nocheck

import './App.css'

import * as api from './api'

import { fromBase64JsonToObject, parseParams } from './util'
import toast, { Toaster } from 'react-hot-toast'
import { useCallback, useEffect, useRef, useState } from 'react'

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

  const [videoClassnames, setVideoClassnames] = useState<string[]>([])
  const onMetadataLoaded = useCallback(() => {
    const w = videoNoteRef.current.videoWidth,
      h = videoNoteRef.current.videoHeight
    const ratio = w / h
    if (ratio > 1) {
      setVideoClassnames(['landscape'])
    } else if (ratio < 1) {
      setVideoClassnames(['portrait'])
    } else {
      setVideoClassnames(['square'])
    }
  })

  useEffect(() => {
    const query = parseParams(window.location.search)
    // @ts-expect-error
    const startData = fromBase64JsonToObject(query['data'])
    setUrl(startData.link)
    startData.link = uploadState.toString()
    if (window.Telegram) {
      window.Telegram.WebApp.ready()
      window.Telegram.WebApp.expand()
    }
  }, [uploadState])
  return (
    <div className="App">
      <Toaster />
      <div className="recording-body">
        <video
          className={videoClassnames.join(' ')}
          playsInline
          onLoadedMetadata={onMetadataLoaded}
          id="video"
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
      </div>

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
