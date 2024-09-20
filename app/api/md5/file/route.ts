import { MD5 } from "@/utils/MD5";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return Response.json({ message: "No files received." }, { status: 400 });
  }

  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const fileContent = fileBuffer.toString("utf-8");

  const fileHash = MD5.hash(fileContent.trim());

  return Response.json(
    {
      hash: fileHash,
    },
    {
      status: 200,
      statusText: "OK",
    }
  );
}
