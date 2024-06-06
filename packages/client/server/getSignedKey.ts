import getFid from "./getFid";
import generate_signature from "./generateSignature";
import neynarClient from "./neynatClient";

const getSignedKey = async () => {
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

export default getSignedKey;
