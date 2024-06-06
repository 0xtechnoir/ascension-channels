import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import "dotenv/config";

if (!process.env.VITE_NEYNAR_API_KEY) {
    throw new Error("Make sure you set VITE_NEYNAR_API_KEY in your .env file");
  }
const neynarClient = new NeynarAPIClient(process.env.VITE_NEYNAR_API_KEY);
export default neynarClient;