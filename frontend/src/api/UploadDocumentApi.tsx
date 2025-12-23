import type { ApiResponse } from "@/types/api/ApiResponse";
import type {
  UploadDocumentBody,
  UploadDocumentResponse,
} from "@/types/upload-document/UploadDocument";
import type { A } from "vitest/dist/chunks/environment.d.cL3nLXbE.js";

const API_URL = import.meta.env.VITE_BACKEND_URL;

export async function generateUploadUrl(body: UploadDocumentBody): Promise<ApiResponse<UploadDocumentResponse>> {
  await new Promise((resolve) => setTimeout(resolve, 2000)); // Simula um atraso de 2 segundos

  const response = await fetch(`${API_URL}/generate-upload-url`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error("Failed to upload document");
  }

  return response.json() as Promise<ApiResponse<UploadDocumentResponse>>;
}

export async function saveFileToS3(
  url: string,
  file: File,
  onProgress: (percent: number) => void
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100);
        resolve();
      } else {
        reject(new Error("Upload failed"));
      }
    };

    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.send(file);
  });
}