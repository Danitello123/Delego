import { DelegoClient } from "@delego/sdk";

/** Shared API client instance for the web app */
export const api = new DelegoClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000",
});
