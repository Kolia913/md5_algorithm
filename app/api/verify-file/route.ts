import { MD5 } from "@/utils/MD5";

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("file") as File;
  const hashFile = formData.get("hashFile") as File;

  if (!file) {
    return Response.json({ message: "No files received." }, { status: 400 });
  }
  if (!hashFile) {
    return Response.json(
      { message: "No hash files received." },
      { status: 400 }
    );
  }

  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const hashFileBuffer = Buffer.from(await hashFile.arrayBuffer());

  const fileContent = fileBuffer.toString("utf-8");
  const hashFileContent = hashFileBuffer.toString("utf-8");

  const fileChecksum = MD5.hash(fileContent.trim());
  console.log(fileChecksum, hashFileContent);

  if (fileChecksum === hashFileContent.trim()) {
    return Response.json(
      {
        message: "File checksum matches!",
      },
      {
        status: 200,
        statusText: "OK",
      }
    );
  } else {
    return Response.json(
      {
        message: "File content is corrupted!",
      },
      {
        status: 422,
        statusText: "OK",
      }
    );
  }
}
