"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

export default function Home() {
  const [text, setText] = useState<string>("");
  const [hash, setHash] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const getHash = async () => {
    setError(null);
    try {
      const res = await fetch("/api/md5", {
        method: "POST",
        body: JSON.stringify({
          text,
        }),
      });
      if (!res.ok) {
        throw new Error((await res.json()).message);
      }
      const json: { hash: string } = await res.json();
      setHash(json.hash);
    } catch (error) {
      const err = error as { message: string };
      setError(err.message);
    }
  };
  return (
    <main className="flex w-full h-full justify-center items-start">
      <div className="container flex flex-col justify-center items-start gap-20 w-full">
        {/* title */}
        <div className="flex flex-riw justify-start items-center pt-10">
          <h1 className="text-3xl font-semibold">Message Digest 5</h1>
        </div>
        {/* inputs */}
        <div className="w-full flex flex-col justify-start items-center gap-5">
          <Textarea
            value={text}
            onInput={(e) => setText(e.currentTarget.value)}
            placeholder="Enter some text"
          />
          {/* error */}
          {error !== null && (
            <div className="w-full bg-red-50 border border-solid border-red-200 rounded-md p-4">
              <span className="text-red-600">
                Oops...Something went wrong :(
              </span>
              <p className="text-sm text-red-400">Message: {error}</p>
            </div>
          )}
          <div>
            <Button onClick={getHash}>Convert</Button>
          </div>
          <Input value={hash} onChange={() => {}} placeholder="Result" />
        </div>
      </div>
    </main>
  );
}
