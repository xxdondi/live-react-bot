import type { Context } from "@netlify/functions";
import { getStore } from "@netlify/blobs";

export default async (req: Request, context: Context) => {
  try {
    const json = await req.json();
    const blob = json["blob"],
      id = json["id"];
    const notesStore = getStore("videoNotes");
    await notesStore.set(id, blob);
    return {
      statusCode: 200,
      body: JSON.stringify({ id: id }),
    };
  } catch {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: "Oops" }),
    };
  }
};
