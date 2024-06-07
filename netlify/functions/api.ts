import express, { Router } from "express";
import { Request, Response } from "express";
import getSignedKey from "../../packages/client/server/getSignedKey"
import neynarClient from "../../packages/client/server/neynatClient";
import getUsername from "../../packages/client/server/getUsername";
import "dotenv/config";
import fetch from "node-fetch";
import { FarcasterUser } from "../../packages/client/src/components/types";
import serverless from "serverless-http";

const NEYNAR_API_KEY = process.env.VITE_NEYNAR_API_KEY;

const api = express();
const router = Router();

router.get("/hello", (req, res) => {
  console.log("Hello endpoint reached")
  return res.send("Hello Vite + React + TypeScript!");
})

router.get("/getPosts", async (_: Request, res: Response) => {
  try {
  } catch (error) {
    console.error(error);
  }
});

router.post("/signer", async (_, res: Response) => {
  try {
    const signedKey = await getSignedKey();
    return res.status(200).send(signedKey);
  } catch (error) {
    return res.status(500).send(error);
  }
});

router.get("/signer/:signer_uuid", async (req: Request, res: Response) => {
  const signer_uuid = req.params.signer_uuid;
  if (!signer_uuid) {
    return res.status(400).send("signer_uuid is required");
  }
  try {
    const signer = await neynarClient.lookupSigner(signer_uuid);
    const displayName = signer.fid ? await getUsername(signer.fid) : undefined;
    const result: FarcasterUser = { ...signer, display_name: displayName };
    return res.status(200).send(result);
  } catch (error) {
    return res.status(500).send(error);
  }
});

router.post("/cast", async (req: Request, res: Response) => {
  const channelId: string = "dead";
  const body = req.body;
  const url = "https://api.neynar.com/v2/farcaster/cast";
  const options = {
    method: "POST",
    headers: {
      accept: "application/json",
      api_key: NEYNAR_API_KEY || "",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      signer_uuid: body.signer_uuid,
      text: body.text,
      channel_id: channelId,
    }),
  };

  fetch(url, options)
    .then((res) => res.json())
    .then((json) => res.status(200).send(json))
    .catch((err) => res.status);
});

api.use("/api/", router);

export const handler = serverless(api);
