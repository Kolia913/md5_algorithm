import { MD5 } from "@/utils/MD5";

export async function POST(request: Request) {
  const { text } = await request.json();

  if (!text) {
    return Response.json(
      {
        message: "'text' field is required",
      },
      {
        status: 422,
        statusText: "unprocessable_entity".toUpperCase(),
      }
    );
  }

  const hash = MD5.hash(text);

  return Response.json(
    {
      hash,
    },
    {
      status: 200,
      statusText: "OK",
    }
  );
}
