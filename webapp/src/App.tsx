// @ts-nocheck

import './App.css'

import * as api from './api'

import { UPLOAD_STATES, useStoreActions, useStoreState } from './store'
import { downloadBlob, fromBase64JsonToObject, parseParams } from './util'
import toast, { Toaster } from 'react-hot-toast'
import { useEffect, useRef, useState } from 'react'

import { FloatingPreview } from './components/FloatingPreview'
import Recorder from './components/Recorder'

function App() {
  const [shouldRequestMedia, setShouldRequestMedia] = useState(false)
  const uploadState = useStoreState((state) => state.uploadState)
  const setUploadState = useStoreActions((actions) => actions.setUploadState)

  const videoNoteRef = useRef<HTMLVideoElement>(null)
  const [url, setUrl] = useState('')

  useEffect(() => {
    window.setTimeout(() => {
      setShouldRequestMedia(true)
    }, 1000)
  }, [shouldRequestMedia])

  useEffect(() => {
    if (uploadState === UPLOAD_STATES.NOT_STARTED) {
      const query = parseParams(window.location.search)
      // @ts-expect-error
      const startData = fromBase64JsonToObject(query['data'])
      setUrl(startData.link)
      startData.link = uploadState.toString()
      if (window.Telegram) {
        window.Telegram.WebApp.ready()
        window.Telegram.WebApp.expand()
      }
    }
  }, [uploadState])
  return (
    <div className="App">
      <Toaster />
      <div className="recording-body">
        <FloatingPreview videoRef={videoNoteRef} src={url} />
        <Recorder
          shouldRequestMedia={shouldRequestMedia}
          onStartCapture={() => {
            videoNoteRef.current.currentTime = 0
            videoNoteRef.current.play()
          }}
          onStopCapture={() => {
            videoNoteRef.current.pause()
          }}
          onVideoReady={(blob) => {
            setUploadState(UPLOAD_STATES.UPLOADING)
            downloadBlob(blob, 'video.mp4')
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
    </div>
  )
}

export default App
