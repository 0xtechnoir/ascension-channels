import { useEffect, useState, useContext } from "react";
import axios from "axios";
import styles from "./page.module.css";
import QRCode from "qrcode.react";
import { WalletContext } from "@eveworld/contexts";
import FarcasterFeed from "./FarcasterFeed";

interface FarcasterUser {
  signer_uuid: string;
  public_key: string;
  status: string;
  signer_approval_url?: string;
  fid?: number;
}

export default function Farcaster() {

  const REQUIRED_TOKEN = "0x011FAeAf1d555beD45861193359dB0287D7648C2";
  const FAKE_TOKEN = "0x325d0fB01432ba65faCF5691e087ddb68e9de911";
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

  const { walletClient, publicClient } = useContext(WalletContext);
  useEffect(() => {
    if (!walletClient?.account) return;
    const addr = walletClient.account.address;
    console.log("Account Address: ", addr.toLowerCase())

    Promise.resolve(
      fetch(
        `https://testnet-game-blockscout-api.nursery.reitnorf.com/api/v2/tokens/${REQUIRED_TOKEN}/holders`
      )
    )
      .then((res) => res.json())
      .then((x) => {
        for (let i = 0; i < x.items.length; i++) {
          console.log("player address: ", x.items[i].address.hash.toLowerCase());
          if (x.items[i].address.hash.toLowerCase() == addr.toLowerCase()) {
            console.log("Player holds the correct token. Granting Access");
            setHasAccess(true);
            break;
          }
        }
      })
      .catch((err) => console.error(err));
  }, [walletClient?.account]);

  useEffect(() => {
    console.log("Has Access: ", hasAccess);
  }, [hasAccess]);

  const handleCast = async () => {
    setIsCasting(true);
    const castText = text.length === 0 ? "gm" : text;
    try {
      const response = await axios.post("/cast", {
        text: castText,
        signer_uuid: farcasterUser?.signer_uuid,
      });
      if (response.status === 200) {
        setText(""); // Clear the text field
        alert("Cast successful");
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

  useEffect(() => {
    if (farcasterUser && farcasterUser.status === "pending_approval") {
      let intervalId: NodeJS.Timeout;

      const startPolling = () => {
        intervalId = setInterval(async () => {
          try {
            const response = await axios.get(
              `/signer/${farcasterUser?.signer_uuid}`
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
      const response = await axios.post("/signer");
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
    <div className={styles.container}>
        {hasAccess ? (
          <>
            <div className={styles.userInfo}>Access Granted</div>
            {!farcasterUser?.status && (
              <button
                className={styles.btn}
                onClick={handleSignIn}
                disabled={loading}
              >
                {loading ? "Loading..." : "Sign in with farcaster"}
              </button>
              )
            }
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
              )
            }
      
            {farcasterUser?.status == "approved" && (
              <div className={styles.castSection}>
                <div className={styles.userInfo}>Hello {farcasterUser.fid} 👋</div>
                <div className={styles.castContainer}>
                  <textarea
                    className={styles.castTextarea}
                    placeholder="What's on your mind?"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={5}
                  />
      
                  <button
                    className={styles.btn}
                    onClick={handleCast}
                    disabled={isCasting}
                  >
                    {isCasting ? <span>🔄</span> : "Cast"}
                  </button>
                </div>
              </div>
            )}
          </>)
          : (
            <div className={styles.userInfo}>Access Denied</div>
          )}
      </div>
  )
}
