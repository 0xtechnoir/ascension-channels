import express from "express";
import ViteExpress from "vite-express";
import { Request, Response } from "express";
import getSignedKey from "./getSignedKey";
import neynarClient from "./neynatClient";
import "dotenv/config";
import fetch from "node-fetch";

const PORT = process.env.PORT || 3000;
const NEYNAR_API_KEY = process.env.VITE_NEYNAR_API_KEY;
const app = express();
app.use(express.json());

app.get("/hello", (_, res) => {
  res.send("Hello Vite + React + TypeScript!");
});

app.get("/getPosts", async (_: Request, res: Response) => {
  try {
  } catch (error) {
    console.error(error);
  }
});

app.post("/signer", async (_, res: Response) => {
  try {
    const signedKey = await getSignedKey();
    return res.status(200).send(signedKey);
  } catch (error) {
    return res.status(500).send(error);
  }
});

app.get("/signer/:signer_uuid", async (req: Request, res: Response) => {
  const signer_uuid = req.params.signer_uuid;
  if (!signer_uuid) {
    return res.status(400).send("signer_uuid is required");
  }
  try {
    const signer = await neynarClient.lookupSigner(signer_uuid);
    return res.status(200).send(signer);
  } catch (error) {
    return res.status(500).send(error);
  }
});

app.post("/cast", async (req: Request, res: Response) => {
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
    .then((json) => console.log(json))
    .catch((err) => console.error("error:" + err));
});

ViteExpress.listen(app, Number(PORT), () =>
  console.log(`Server is listening on port ${PORT}...`)
);
