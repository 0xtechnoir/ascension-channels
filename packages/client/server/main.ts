import express from "express";
import ViteExpress from "vite-express";
import { Request, Response } from "express";
import getSignedKey from "./getSignedKey";
import neynarClient from "./neynatClient";
import "dotenv/config";

const PORT = process.env.PORT || 3000;
const app = express();
app.use(express.json());

app.get("/hello", (_, res) => {
  res.send("Hello Vite + React + TypeScript!");
});

app.post('/', async (req: Request, res: Response) => {
  try {
    const hookData = JSON.parse(req.body);
    console.log("hookdata: ", hookData);
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
  if (!process.env.VITE_NEYNAR_API_KEY) {
    throw new Error("Make sure you set VITE_NEYNAR_API_KEY in your .env file");
  }
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
  const body = req.body;
  try {
    const cast = await neynarClient.publishCast(body.signer_uuid, body.text);
    return res.status(200).send(cast);
  } catch (error) {
    return res.status(500);
  }
});

ViteExpress.listen(app, Number(PORT), () =>
  console.log(`Server is listening on port ${PORT}...`)
);


