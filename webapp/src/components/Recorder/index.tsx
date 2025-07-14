import React, { useCallback, useRef, useState } from 'react'

import Webcam from 'react-webcam'
import styles from './Recorder.module.css'
import { useInterval } from '../../util'
import { useStoreState } from '../../store'

enum RECORDING_STATES {
  NOT_STARTED,
  RECORDING,
  STOPPED,
}

interface RecorderProps {
  onStartCapture(): void
  onStopCapture(): void
  onVideoReady(video: Blob): void
  shouldRequestMedia: boolean
}

interface RecordButtonProps {
  state: RECORDING_STATES
  onStart(): void
  onStop(): void
  onSend(): void
  onReset(): void
}

interface RecordingTimerProps {
  onTick(newTime: number): void
  isRunning: boolean
  currentTime: number
}

const RecordingTimer: React.FC<RecordingTimerProps> = (props) => {
  const { isRunning, currentTime, onTick } = props

  useInterval(() => {
    if (isRunning) {
      onTick(currentTime + 21)
    }
  }, 21)

  const formatTime = (timeMs: number): string => {
    const time = timeMs / 1000
    const seconds = Math.floor(time)
    const milliseconds = timeMs - seconds * 1000

    // Zero padding
    const secondsString = seconds.toString().padStart(2, '0')
    const millisecondsString = milliseconds.toString().padStart(2, '0')
    return `00:${secondsString}.${millisecondsString}`
  }

  return (
    <div>
      <span>{formatTime(currentTime)}</span>
    </div>
  )
}

const RecordButton: React.FC<RecordButtonProps> = (props) => {
  const { state, onStart, onStop, onSend, onReset } = props
  const onClick = () => {
    // @ts-expect-error
    if (window.Telegram !== undefined) {
      try {
        // @ts-expect-error
        window.Telegram.WebApp.HapticFeedback.impactOccurred('medium')
      } catch (e) {
        console.error(e)
      }
    }
    if (state === RECORDING_STATES.NOT_STARTED) {
      onStart()
    } else if (state === RECORDING_STATES.RECORDING) {
      onStop()
    } else if (state === RECORDING_STATES.STOPPED) {
      onSend()
    }
  }
  return (
    <>
      {state === RECORDING_STATES.STOPPED && (
        <button onClick={() => onReset()} className={styles.recorderBtn}>
          <span>
            ↩️
            <br />
            RESET
          </span>
        </button>
      )}
      <button onClick={onClick} className={styles.recorderBtn}>
        {state === RECORDING_STATES.NOT_STARTED && (
          <span>
            🔴
            <br />
            REC
          </span>
        )}
        {state === RECORDING_STATES.RECORDING && (
          <span>
            ⏹️
            <br />
            STOP
          </span>
        )}
        {state === RECORDING_STATES.STOPPED && (
          <span>
            ⬆️
            <br />
            SEND
          </span>
        )}
      </button>
    </>
  )
}

const Recorder: React.FC<RecorderProps> = (props) => {
  const { onStartCapture, onStopCapture, onVideoReady, shouldRequestMedia } =
    props

  const webcamRef = useRef<Webcam>(null)
  const mediaRecorderRef = useRef<MediaRecorder>(null)
  const { vh, vw } = useStoreState((state) => state.env)

  const [timerTime, setTimerTime] = useState(0)
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
    <div className={styles.recorderContainer}>
      {shouldRequestMedia && (
        <Webcam
          audio={true}
          muted={true}
          videoConstraints={{
            width: {
              ideal: vw,
            },
            height: {
              ideal: vh,
            },
            facingMode: 'user',
          }}
          mirrored={true}
          ref={webcamRef}
        />
      )}
      <span
        className={styles.recIndicator}
        style={{ visibility: capturing ? 'visible' : 'hidden' }}
      >
        REC <span className="blink">🔴</span>
      </span>
      <div className={styles.timerContainer}>
        <RecordingTimer
          isRunning={capturing}
          currentTime={timerTime}
          onTick={(newTime) => {
            setTimerTime(newTime)
          }}
        />
      </div>
      <div className={styles.recorderBtnContainer}>
        <RecordButton
          state={
            capturing
              ? RECORDING_STATES.RECORDING
              : recordedChunks.length > 0
              ? RECORDING_STATES.STOPPED
              : RECORDING_STATES.NOT_STARTED
          }
          onStart={handleStartCaptureClick}
          onStop={handleStopCaptureClick}
          onReset={() => {
            setCapturing(false)
            setTimerTime(0)
            setRecordedChunks([])
          }}
          onSend={send}
        />
      </div>
    </div>
  )
}

export default Recorder
