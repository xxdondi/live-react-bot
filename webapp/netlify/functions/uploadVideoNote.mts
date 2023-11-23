import type { Context } from '@netlify/functions'
import { getStore } from '@netlify/blobs'

export default async (req: Request) => {
  try {
    req.body
    const json = await req.json()
    const blob = json['blob'],
      id = json['id']
    const notesStore = getStore('videoNotes')
    await notesStore.set(id, blob)
    return new Response(JSON.stringify({ id: id }), { status: 200 })
  } catch {
    return new Response(JSON.stringify({ error: 'Oops' }), { status: 404 })
  }
}
