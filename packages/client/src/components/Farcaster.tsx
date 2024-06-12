import { useEffect, useState, useContext } from "react";
import axios from "axios";
import styles from "./page.module.css";
import QRCode from "qrcode.react";
import { WalletContext } from "@eveworld/contexts";
import FarcasterFeed from "./FarcasterFeed";
import { useMUD } from "../mud/MUDContext";
import { useEntityQuery } from "@latticexyz/react";
import { Has, getComponentValue, getEntityComponents, getComponentEntities } from "@latticexyz/recs";
import { Cast, Response, FarcasterUser } from "./types";

export default function Farcaster() {
  const {
    components: { FidRegistry },
    systemCalls: { registerFid },
  } = useMUD();

  const [registeredFids, setRegisteredFids] = useState<number[]>([]);

  const REQUIRED_TOKEN = "0x011FAeAf1d555beD45861193359dB0287D7648C2";
  const FAKE_TOKEN = "0x325d0fB01432ba65faCF5691e087ddb68e9de911"; // for testing purposes
  const EVE_TOKEN = "0xec79573FAC3b9C103819beBBD00143dfD67059DA"; // for testing purposes
  const LOCAL_STORAGE_KEYS = {
    FARCASTER_USER: "farcasterUser",
  };

  const [loading, setLoading] = useState(false);
  const [farcasterUser, setFarcasterUser] = useState<FarcasterUser | null>(
    null
  );
  const [text, setText] = useState<string>("");
  const [isCasting, setIsCasting] = useState<boolean>(false);
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [isPollingFeed, setIsPollingFeed] = useState<boolean>(false);

  const NEYNAR_API_KEY: string = import.meta.env.VITE_NEYNAR_API_KEY;

  //  check whether player is holding the required token to access the feed
  const { walletClient } = useContext(WalletContext);
  useEffect(() => {
    if (!walletClient?.account) return;
    const addr = walletClient.account.address;
    Promise.resolve(
      fetch(
        `https://testnet-game-blockscout-api.nursery.reitnorf.com/api/v2/tokens/${REQUIRED_TOKEN}/holders`
      )
    )
      .then((res) => res.json())
      .then((x) => {
        for (let i = 0; i < x.items.length; i++) {
          // console.log("player address: ", x.items[i].address.hash.toLowerCase());
          if (x.items[i].address.hash.toLowerCase() == addr.toLowerCase()) {
            // console.log("Player holds the correct token. Granting Access");
            setHasAccess(true);
            break;
          }
        }
      })
      .catch((err) => console.error(err));
  }, [walletClient?.account]);

  const handleCast = async () => {
    setIsCasting(true);
    const castText = text.length === 0 ? "gm" : text;
    try {
      const response = await axios.post("api/cast", {
        text: castText,
        signer_uuid: farcasterUser?.signer_uuid,
      });
      if (response.status === 200) {
        setText(""); // Clear the text field
      }
    } catch (error) {
      console.error("Could not send the cast", error);
    } finally {
      setIsCasting(false); // Re-enable the button
    }
  };

  useEffect(() => {
    const storedData = localStorage.getItem(LOCAL_STORAGE_KEYS.FARCASTER_USER);
    if (storedData) {
      const user: FarcasterUser = JSON.parse(storedData);
      setFarcasterUser(user);
    }
  }, []);

  const registerUser = async (user: FarcasterUser) => {
    // console.log("Calling registerUser with user: ", user)
    // update the onchain registry with the user's FID
    const fid = user.fid;
    const addr = walletClient?.account?.address;
    // console.log(`Registering FID: ${fid} with address: ${addr}`);
    try {
      if (fid && addr) {
        await registerFid(fid, addr);
      }
    } catch (error) {
      console.error("Error registering FID: ", error);
    }
  };

  const moderate = async (data: Response) => {
    // const allRegisteredUsers = useEntityQuery([Has(FidRegistry)]);
    const allRegisteredUsers = getComponentEntities(FidRegistry);
    const MODERATOR_FID: number = parseInt(import.meta.env.VITE_MODERATOR_FID);
    // console.log("Moderator function called");

    const registeredFids = new Set(
      Array.from(allRegisteredUsers).map((user) => {
        const rec = getComponentValue(FidRegistry, user);
        return rec?.fid; // Add null check here
      })
    );

    for (const cast of data.casts) {
      const authorFid = cast.author.fid;
      // console.log("Author FID: ", authorFid);
      // console.log("allRegisteredUsers (from MUD table): ", allRegisteredUsers);
      console.log("registeredFids (from MUD table): ", registeredFids);

      if (registeredFids.has(authorFid)) {
        // console.log(`Author ${authorFid} is registered`);

        if (cast.reactions.likes.length === 0) {
          // console.log("Moderator has not liked the cast yet");
          likeCast(cast.hash);
        } else if (!cast.reactions.likes.some(like => like.fid === MODERATOR_FID)) {
          // console.log("Moderator has not liked the cast yet");
          likeCast(cast.hash);
        } else {
          // console.log("Moderator has already liked the cast");
        }
      } else {
        // console.log(`Author ${authorFid} is not registered`);
      }
    }
  }
  
  async function likeCast(hash: string) {
    const url = "https://api.neynar.com/v2/farcaster/reaction";
    const options = {
      method: "POST",
      headers: {
        accept: "application/json",
        api_key: NEYNAR_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        reaction_type: "like",
        signer_uuid: import.meta.env.VITE_MODERATOR_SIGNER_UUID,
        target: hash,
      }),
    };
    
    fetch(url, options)
    .then(res => res.json())
    // .then(json => console.log(json))
    .catch(err => console.error("error:", err));
  }

  const pollFeed = async () => {
    setIsPollingFeed(!isPollingFeed);
    let intervalId: NodeJS.Timeout;
    intervalId = setInterval(async () => {
      const channelId: string = "dead";
      const url = `https://api.neynar.com/v2/farcaster/feed/channels?channel_ids=${channelId}&with_recasts=true&viewer_fid=3&with_replies=false&limit=25&should_moderate=false`;

      if (!NEYNAR_API_KEY) {
        console.error("API key is not set");
        return;
      }
      const options = {
        method: "GET",
        headers: { accept: "application/json", api_key: NEYNAR_API_KEY },
      };
      try {
        const response = await fetch(url, options);
        const data: Response = await response.json();
        // console.log("Feed Polling Response:", data);
        moderate(data);
      } catch (err) {
        console.error("error:" + err);
      }
    }, 50000);
  };

  useEffect(() => {
    if (!isPollingFeed) {
      pollFeed();
    }
  }),
    [];

  useEffect(() => {
    if (farcasterUser && farcasterUser.status === "pending_approval") {
      let intervalId: NodeJS.Timeout;

      const startPolling = () => {
        intervalId = setInterval(async () => {
          try {
            const response = await axios.get(
              `api/signer/${farcasterUser?.signer_uuid}`
            );
            const user = response.data as FarcasterUser;

            if (user?.status === "approved") {
              // store the user in local storage
              localStorage.setItem(
                LOCAL_STORAGE_KEYS.FARCASTER_USER,
                JSON.stringify(user)
              );
              setFarcasterUser(user);
              clearInterval(intervalId);
              registerUser(user);
            }
          } catch (error) {
            console.error("Error during polling", error);
          }
        }, 2000);
      };

      const stopPolling = () => {
        clearInterval(intervalId);
      };

      const handleVisibilityChange = () => {
        if (document.hidden) {
          stopPolling();
        } else {
          startPolling();
        }
      };

      document.addEventListener("visibilitychange", handleVisibilityChange);

      // Start the polling when the effect runs.
      startPolling();

      // Cleanup function to remove the event listener and clear interval.
      return () => {
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange
        );
        clearInterval(intervalId);
      };
    }
  }, [farcasterUser]);

  const handleSignIn = async () => {
    setLoading(true);
    await createAndStoreSigner();
    setLoading(false);
  };

  const createAndStoreSigner = async () => {
    try {
      const response = await axios.post("api/signer");
      if (response.status === 200) {
        localStorage.setItem(
          LOCAL_STORAGE_KEYS.FARCASTER_USER,
          JSON.stringify(response.data)
        );
        setFarcasterUser(response.data);
      }
    } catch (error) {
      console.error("API Call failed", error);
    }
  };

  return (
    <div >
      <div className={styles.title}>Alliance Channels</div>
      {hasAccess ? (
        <>
          <div className={styles.userInfo}>Feed Access Granted</div>
          {!farcasterUser?.status && (
            <button
              className={styles.btn}
              onClick={handleSignIn}
              disabled={loading}
            >
              {loading ? "Loading..." : "Sign in with farcaster to cast"}
            </button>
          )}
          <FarcasterFeed />
          {farcasterUser?.status == "pending_approval" &&
            farcasterUser?.signer_approval_url && (
              <div className={styles.qrContainer}>
                <QRCode value={farcasterUser.signer_approval_url} />
                <div className={styles.or}>OR</div>
                <a
                  href={farcasterUser.signer_approval_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.link}
                >
                  Click here to view the signer URL (on mobile)
                </a>
              </div>
            )}
          {farcasterUser?.status == "approved" && (
            <div className={styles.castSection}>
              <div className={styles.userInfo}>
                gm {farcasterUser.display_name}
              </div>
              <div className={styles.castContainer}>
                <textarea
                  className={styles.castTextarea}
                  placeholder="What say you anon?"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={5}
                />
                <button
                  className={styles.castbtn}
                  onClick={handleCast}
                  disabled={isCasting}
                >
                  {isCasting ? <span>Publishing 🔄</span> : "Cast"}
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className={styles.userInfo}>Access Denied - You do not hold the required token</div>
      )}
    </div>
  );
}
