import React from 'react'

export function fromBase64JsonToObject(base64json: string) {
  return JSON.parse(atob(base64json))
}

export function parseParams(queryString: string) {
  var query: object = {}
  var pairs = (
    queryString[0] === '?' ? queryString.substr(1) : queryString
  ).split('&')
  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i].split('=')
    // @ts-expect-error
    query[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '')
  }
  return query
}

type IntervalCallback = () => void

export const useInterval = (callback: IntervalCallback, delay: number) => {
  const savedCallback = React.useRef(callback)

  React.useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  React.useEffect(() => {
    function tick() {
      savedCallback.current()
    }
    let id = setInterval(tick, delay)
    return () => clearInterval(id)
  }, [delay])
}

export function downloadBlob(blob: Blob, name = 'file.txt') {
  const data = window.URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = data
  link.download = name

  link.dispatchEvent(
    new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      view: window,
    })
  )

  setTimeout(() => {
    window.URL.revokeObjectURL(data)
    link.remove()
  }, 100)
}
