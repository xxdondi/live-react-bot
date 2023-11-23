// @ts-nocheck

import './App.css';

import * as api from './api';

import React, { useEffect, useRef, useState } from 'react';
import { fromBase64JsonToObject, parseParams } from './util';

import { FFmpeg } from '@ffmpeg/ffmpeg';
import Webcam from 'react-webcam';
import { fetchFile } from '@ffmpeg/util';

function App() {
  const [url, setUrl] = useState('');
  const webcamRef = React.useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = React.useRef(null);
  const ffmpegRef = useRef(new FFmpeg());
  const [capturing, setCapturing] = React.useState(false);
  const [recordedChunks, setRecordedChunks] = React.useState([]);

  const transcode = async () => {
    const ffmpeg = ffmpegRef.current;
    await ffmpeg.writeFile('test.mp4', await fetchFile(url));
    await ffmpeg.exec([
      '-i',
      'input.webm',
      '-f',
      'segment',
      '-segment_time',
      '3',
      '-g',
      '9',
      '-sc_threshold',
      '0',
      '-force_key_frames',
      'expr:gte(t,n_forced*9)',
      '-reset_timestamps',
      '1',
      '-map',
      '0',
      'output_%d.mp4',
    ]);
    const data = await ffmpeg.readFile('output_1.mp4');
    videoRef.current.src = URL.createObjectURL(
      new Blob([data.buffer], { type: 'video/mp4' })
    );
  };

  const handleDataAvailable = React.useCallback(
    // @ts-expect-error
    ({ data }) => {
      if (data.size > 0) {
        setRecordedChunks((prev) => prev.concat(data));
      }
    },
    [setRecordedChunks]
  );

  const handleStartCaptureClick = React.useCallback(() => {
    setCapturing(true);
    // @ts-expect-error
    mediaRecorderRef.current = new MediaRecorder(webcamRef.current.stream, {
      mimeType: 'video/mp4',
    });
    // @ts-expect-error
    mediaRecorderRef.current.addEventListener(
      'dataavailable',
      handleDataAvailable
    );
    // @ts-expect-error
    mediaRecorderRef.current.start();
  }, [webcamRef, setCapturing, mediaRecorderRef, handleDataAvailable]);

  const handleStopCaptureClick = React.useCallback(() => {
    // @ts-expect-error
    mediaRecorderRef.current.stop();
    setCapturing(false);
  }, [mediaRecorderRef, setCapturing]);

  const send = React.useCallback(() => {
    if (recordedChunks.length) {
      const blob = new Blob(recordedChunks, {
        type: 'video/webm',
      });
      api.sendRecording(blob);
      setRecordedChunks([]);
    }
  }, [recordedChunks]);

  useEffect(() => {
    const query = parseParams(window.location.search);
    // @ts-expect-error
    const startData = fromBase64JsonToObject(query['data']);
    setUrl(startData.link);
  }, []);
  return (
    <div className="App">
      <video id="video" width="240" height="240" src={url} autoPlay></video>
      <Webcam mirrored={true} ref={webcamRef} />
      {capturing ? (
        <button onClick={handleStopCaptureClick}>Stop Capture</button>
      ) : (
        <button onClick={handleStartCaptureClick}>Start Capture</button>
      )}
      {recordedChunks.length > 0 && <button onClick={send}>Send</button>}
      <button onClick={transcode}>Transcode</button>
    </div>
  );
}

export default App;
