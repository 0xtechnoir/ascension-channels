import { useEffect, useState } from "react";
import styles from "./page.module.css";
import { Response } from "./types";


export default function FarcasterFeed() {
  const [feed, setFeed] = useState<Response | null>(null);
  
  useEffect(() => {
    // Asynchronously fetch user data when the component mounts
    const fetchFeed = async () => {      
  
      const channelId: string = "dead";
      const url = `https://api.neynar.com/v2/farcaster/feed/channels?channel_ids=${channelId}&with_recasts=true&viewer_fid=3&with_replies=false&limit=25&should_moderate=false`;
  
      const apiKey: string = import.meta.env.VITE_NEYNAR_API_KEY;
      if (!apiKey) {
        console.error("API key is not set");
        return;
      }
      const options = {
        method: "GET",
        headers: { accept: "application/json", api_key: apiKey },
      };
      try {
        const response = await fetch(url, options);
        const data: Response = await response.json();
        // console.log("Response:", data);
        setFeed(data);
      } catch (err) {
        console.error("error:" + err);
      }
    };

    fetchFeed();
  }, []);

  if (!feed) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full h-96 overflow-y-auto">
      {feed.casts.length != 0 ? (
        feed.casts.map((cast, index) => (
          <div key={index} style={{ marginBottom: "20px", }}>
            <img
              src={cast.author.pfp_url}
              alt={cast.author.display_name}
              style={{ width: "100px" }}
            />
            <p>{cast.author.display_name}</p>
            <p>
              {new Date(cast.timestamp).toLocaleString("en-GB", {
                timeZone: "GMT",
                hour: "numeric",
                minute: "numeric",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </p>
            <p>{cast.text}</p>
            <hr />
          </div>
        ))
      ) : (
        <div className={styles.userInfo}>No casts found</div>
      )}
    </div>
  );
}
