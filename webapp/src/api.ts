export function sendRecording(video: Blob) {
  const formData = new FormData();
  formData.append('video', video);
  return fetch('.netlify/functions/uploadVideoNote', {
    method: 'POST',
    body: JSON.stringify({
      id: 1,
      blob: video,
    }),
  });
}
