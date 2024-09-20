"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { FaFileDownload } from "react-icons/fa";
import { FaCheck } from "react-icons/fa";

export default function Home() {
  const [text, setText] = useState<string>("");
  const [hash, setHash] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const [fileToHash, setFileToHash] = useState<File | null>(null);
  const [fileHash, setFileHash] = useState<string>("");

  const [fileToCheck, setFileToCheck] = useState<File | null>(null);
  const [checksumFile, setChecksumFile] = useState<File | null>(null);
  const [checkState, setCheckState] = useState<{
    corrupted: boolean;
    message: string;
  } | null>(null);

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

  const getFileHash = async () => {
    setError(null);
    if (!fileToHash) {
      return;
    }
    const formData = new FormData();
    formData.append("file", fileToHash as Blob);
    try {
      const res = await fetch("/api/md5/file", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error((await res.json()).message);
      }

      const json: { hash: string } = await res.json();
      setFileHash(json.hash);
    } catch (error) {
      const err = error as { message: string };
      setError(err.message);
    }
  };

  const submit = () => {
    if (text) {
      getHash();
    }
    if (fileToHash) {
      getFileHash();
    }
  };

  const checkFile = async () => {
    const formData = new FormData();
    formData.append("file", fileToCheck as Blob);
    formData.append("hashFile", checksumFile as Blob);

    try {
      const res = await fetch("/api/verify-file", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      if (res.status === 422) {
        setCheckState({
          corrupted: true,
          message: json.message,
        });
      } else if (res.ok) {
        setCheckState({
          corrupted: false,
          message: json.message,
        });
      } else {
        throw new Error(json.message);
      }
    } catch (error) {
      console.error((error as any).message);
    } finally {
      setFileToCheck(null);
      setChecksumFile(null);
    }
  };

  const downloadStringAsFile = (content: string, fileType: string) => {
    const blob = new Blob([content], { type: fileType });

    const a = document.createElement("a");
    a.download = `checksum_${new Date().getTime()}`;
    a.href = URL.createObjectURL(blob);
    a.dataset.downloadurl = [fileType, a.download, a.href].join(":");
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () {
      URL.revokeObjectURL(a.href);
    }, 1500);
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
          <div className="flex flex-row justify-center items-center gap-5 w-full">
            <div className="h-[1px] w-full content-[''] bg-gray-400" />
            <span className="text-sm text-gray-600">OR</span>
            <div className="h-[1px] w-full content-[''] bg-gray-400" />
          </div>
          <Input
            type="file"
            onChange={(e) => setFileToHash(e.target.files && e.target.files[0])}
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
            <Button onClick={submit}>Convert</Button>
          </div>
          <div className="flex flex-row w-full gap-4 justify-start items-center">
            <Input value={hash} onChange={() => {}} placeholder="Result" />
            <Button
              disabled={!hash.length}
              onClick={() => downloadStringAsFile(hash, "hex")}
            >
              <FaFileDownload />
            </Button>
          </div>
          <div className="flex flex-row w-full gap-4 justify-start items-center">
            <Input
              value={fileHash}
              onChange={() => {}}
              placeholder="File hash result"
            />
            <Button
              disabled={!fileHash.length}
              onClick={() => downloadStringAsFile(fileHash, "hex")}
            >
              <FaFileDownload />
            </Button>
          </div>
        </div>
        {/* checksum checker */}
        <div className="w-full flex flex-col justify-start items-center gap-5">
          <div className="w-full">
            <span>Upload file with checksum</span>
            <Input
              type="file"
              accept=".txt"
              placeholder="Checksum"
              onChange={(e) =>
                setChecksumFile(e.target.files && e.target.files[0])
              }
            />
          </div>
          <div className="w-full">
            <span>Upload file to check</span>
            <Input
              type="file"
              accept=".txt"
              placeholder="File"
              onChange={(e) =>
                setFileToCheck(e.target.files && e.target.files[0])
              }
            />
          </div>
          <Button onClick={checkFile} disabled={!checksumFile || !fileToCheck}>
            <FaCheck className="mr-2" />
            Check
          </Button>
          {checkState !== null && (
            <div
              className={cn(
                "border border-solid rounded-md p-4 w-full mb-10",
                checkState?.corrupted
                  ? "bg-red-50 border-red-200 text-red-600"
                  : "bg-green-50 border-green-200 text-green-600"
              )}
            >
              <span>{checkState?.message}</span>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
