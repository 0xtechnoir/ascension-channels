import express from "express";
import ViteExpress from "vite-express";
import { NeynarAPIClient } from "@neynar/nodejs-sdk";
import { Request, Response } from "express";
import { bytesToHex, hexToBytes } from "viem";
import { mnemonicToAccount } from "viem/accounts";
import { ViemLocalEip712Signer } from "@farcaster/hub-nodejs";
import "dotenv/config";

const PORT = process.env.PORT || 3000;
const app = express();
app.use(express.json());

app.get("/hello", (_, res) => {
  res.send("Hello Vite + React + TypeScript!");
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
  if (!process.env.NEYNAR_API_KEY) {
    throw new Error("Make sure you set NEYNAR_API_KEY in your .env file");
  }
  const neynarClient = new NeynarAPIClient(process.env.NEYNAR_API_KEY);
  // This is hardcoded for now, as it's a previously created signer. 
  // It looks like there may be a limit on the number of allowed, as there are 3 existing signers 
  // on my account from previous tests.
  const signer_uuid = "bc81ddd1-d7f9-463e-98b1-a3a63109ffa4";
  // const signer_uuid = req.params.signer_uuid;
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
  if (!process.env.NEYNAR_API_KEY) {
    throw new Error("Make sure you set NEYNAR_API_KEY in your .env file");
  }
  const neynarClient = new NeynarAPIClient(process.env.NEYNAR_API_KEY);
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

const getSignedKey = async () => {
  if (!process.env.NEYNAR_API_KEY) {
    throw new Error("Make sure you set NEYNAR_API_KEY in your .env file");
  }
  const neynarClient = new NeynarAPIClient(process.env.NEYNAR_API_KEY);
  const createSigner = await neynarClient.createSigner();
  const { deadline, signature } = await generate_signature(
    createSigner.public_key
  );
  if (deadline === 0 || signature === "") {
    throw new Error("Failed to generate signature");
  }
  const fid = await getFid();
  const signedKey = await neynarClient.registerSignedKey(
    createSigner.signer_uuid,
    fid,
    deadline,
    signature
  );

  return signedKey;
};

const generate_signature = async function (public_key: string) {
  if (typeof process.env.FARCASTER_DEVELOPER_MNEMONIC === "undefined") {
    throw new Error("FARCASTER_DEVELOPER_MNEMONIC is not defined");
  }
  const FARCASTER_DEVELOPER_MNEMONIC = process.env.FARCASTER_DEVELOPER_MNEMONIC;
  const FID = await getFid();
  const account = mnemonicToAccount(FARCASTER_DEVELOPER_MNEMONIC);
  const appAccountKey = new ViemLocalEip712Signer(account as any);
  // Generates an expiration date for the signature (24 hours from now).
  const deadline = Math.floor(Date.now() / 1000) + 86400;
  const uintAddress = hexToBytes(public_key as `0x${string}`);
  const signature = await appAccountKey.signKeyRequest({
    requestFid: BigInt(FID),
    key: uintAddress,
    deadline: BigInt(deadline),
  });
  if (signature.isErr()) {
    return {
      deadline,
      signature: "",
    };
  }
  const sigHex = bytesToHex(signature.value);
  return { deadline, signature: sigHex };
};

const getFid = async () => {
  if (!process.env.NEYNAR_API_KEY) {
    throw new Error("Make sure you set NEYNAR_API_KEY in your .env file");
  }
  const neynarClient = new NeynarAPIClient(process.env.NEYNAR_API_KEY);
  if (!process.env.FARCASTER_DEVELOPER_MNEMONIC) {
    throw new Error("FARCASTER_DEVELOPER_MNEMONIC is not set.");
  }
  const account = mnemonicToAccount(process.env.FARCASTER_DEVELOPER_MNEMONIC);
  // Lookup user details using the custody address.
  const { user: farcasterDeveloper } =
    await neynarClient.lookupUserByCustodyAddress(account.address);

  return Number(farcasterDeveloper.fid);
};
