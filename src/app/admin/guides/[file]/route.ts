import { promises as fs } from "node:fs";
import path from "node:path";
import { currentOwner } from "@/lib/auth/session";
import { guides } from "@/lib/admin/guides";

export const runtime = "nodejs";

/** Owner-only PDF downloads. Only files listed in guides.ts can be served. */
export async function GET(req: Request, { params }: { params: Promise<{ file: string }> }) {
  if (!(await currentOwner())) return new Response("Unauthorized", { status: 401 });
  const { file } = await params;
  const guide = guides.find((g) => g.file === file);
  if (!guide) return new Response("Not found", { status: 404 });
  try {
    const pdf = await fs.readFile(path.join(process.cwd(), "docs", "owner", guide.file));
    const download = new URL(req.url).searchParams.has("download");
    return new Response(new Uint8Array(pdf), {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `${download ? "attachment" : "inline"}; filename="${guide.file}"`,
        "cache-control": "private, no-store",
      },
    });
  } catch {
    return new Response("Guide not generated yet", { status: 404 });
  }
}
