import { FC, RefObject, useCallback, useState } from 'react'

interface FloatingPreviewProps {
  videoRef: RefObject<HTMLVideoElement>
  src: string
}

const FloatingPreview: FC<FloatingPreviewProps> = (props) => {
  const { src, videoRef } = props
  const [videoClassnames, setVideoClassnames] = useState<string[]>([])
  const onMetadataLoaded = useCallback(() => {
    if (!videoRef.current) return
    const w = videoRef.current.videoWidth,
      h = videoRef.current.videoHeight
    const ratio = w / h
    if (ratio > 1) {
      setVideoClassnames(['landscape'])
    } else if (ratio < 1) {
      setVideoClassnames(['portrait'])
    } else {
      setVideoClassnames(['square'])
    }
  }, [setVideoClassnames, videoRef])
  return (
    <video
      className={videoClassnames.join(' ')}
      playsInline
      preload=""
      onLoadedMetadata={onMetadataLoaded}
      id="video"
      src={src}
      ref={videoRef}
    ></video>
  )
}

export { FloatingPreview }
