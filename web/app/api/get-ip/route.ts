import { NextResponse } from "next/server";
import axios from "axios";
export async function GET(req: Request) {
  // Try to get the IP address from various headers
  const res = await axios.get("https://api.ipify.org/?format=json");
  const ip = res.data.ip;
  return NextResponse.json({ ip });
}
