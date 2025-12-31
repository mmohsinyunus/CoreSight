// src/data/api.ts

const defaultBaseUrl =
  "https://script.google.com/macros/s/AKfycbwxTAPJITLdR3AUQoseEs-TsUefbWfuPPmt2rrqsmgDBGXSfAL3xDeUG10VLKUrGhDb0w/exec"

const baseUrl =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_APPS_SCRIPT_URL) ||
  defaultBaseUrl

export type SheetResponse<T> =
  | {
      ok: true
      data: T
      error?: string
    }
  | {
      ok: false
      error?: string
      data?: T
    }

export async function fetchSheetData<T>(tabName: string): Promise<T> {
  const url = new URL(baseUrl)
  url.searchParams.set("tab", tabName)

  const res = await fetch(url.toString())
  let body: SheetResponse<T> | T | null = null

  try {
    body = (await res.json()) as SheetResponse<T>
  } catch {
    // leave body as null so we can surface HTTP error details below
  }

  if (!res.ok) {
    const message =
      (body && typeof body === "object" && "error" in body && body.error) ||
      `HTTP ${res.status}`
    throw new Error(message)
  }

  if (body && typeof body === "object" && "ok" in body) {
    if (!body.ok) {
      throw new Error(body.error || "Request failed")
    }
    return body.data as T
  }

  return body as T
}

export const appsScriptBaseUrl = baseUrl
