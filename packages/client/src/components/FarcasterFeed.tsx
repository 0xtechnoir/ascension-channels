import { useEffect, useState } from "react";
import styles from "./page.module.css";

type Response = {
  casts: Cast[];
  next: {
    cursor: string;
  };
};

type Cast = {
  object: string;
  hash: string;
  thread_hash: string;
  parent_hash: string | null;
  parent_url: string;
  root_parent_url: string;
  parent_author: {
    fid: number | null;
  };
  author: User;
  text: string;
  timestamp: string;
  embeds: Embed[];
  frames: Frame[];
  reactions: Reactions;
  replies: {
    count: number;
  };
  mentioned_profiles: User[];
  viewer_context: {
    liked: boolean;
    recasted: boolean;
  };
};

type User = {
  object: string;
  fid: number;
  custody_address: string;
  username: string;
  display_name: string;
  pfp_url: string;
  profile: {
    bio: {
      text: string;
    };
  };
  follower_count: number;
  following_count: number;
  verifications: string[];
  verified_addresses: {
    eth_addresses: string[];
    sol_addresses: string[];
  };
  active_status: string;
  power_badge: boolean;
  notes: {
    active_status: string;
  };
  viewer_context: {
    following: boolean;
    followed_by: boolean;
  };
};

type Embed = {
  url: string;
  cast_id?: {
    fid: number;
    hash: string;
  };
};

type Frame = {
  version: string;
  title: string;
  image: string;
  image_aspect_ratio: string;
  buttons: Button[];
  input: Record<string, unknown>;
  state: Record<string, unknown>;
  post_url: string;
  frames_url: string;
};

type Button = {
  index: number;
  title: string;
  action_type: string;
  target?: string;
};

type Reactions = {
  likes_count: number;
  recasts_count: number;
  likes: Like[];
  recasts: Like[];
};

type Like = {
  fid: number;
  fname: string;
};

export type ErrorResponse = {
  code: string;
  message: string;
  property: string;
  status: number;
};

const apiKey: string = import.meta.env.VITE_NEYNAR_API_KEY;

export default function FarcasterFeed() {
  const [feed, setFeed] = useState<Response | null>(null);

  const base = "https://api.neynar.com/";
  const channelId: string = "dead";

  useEffect(() => {
    // Asynchronously fetch user data when the component mounts
    const fetchFeed = async () => {
      const url = `https://api.neynar.com/v2/farcaster/feed/channels?channel_ids=${channelId}&with_recasts=true&viewer_fid=3&with_replies=false&limit=25&should_moderate=false`;

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
        console.log("Response:", data);
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
          <div key={index} style={{ marginBottom: "20px" }}>
            <img
              src={cast.author.pfp_url}
              alt={cast.author.display_name}
              style={{ width: "100px" }}
            />
            <p>Author: {cast.author.display_name}</p>
            <p>Username: {cast.author.username}</p>
            <p>FID: {cast.author.fid}</p>
            <p>
              Timestamp:{" "}
              {new Date(cast.timestamp).toLocaleString("en-GB", {
                timeZone: "GMT",
                hour: "numeric",
                minute: "numeric",
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}
            </p>
            <p>Text: {cast.text}</p>
            <p>Hash: {cast.hash}</p>
            <p>
              Link to post:{" "}
              {`https://warpcast.com/${cast.author.username}/${cast.hash.slice(
                0,
                10
              )}`}
            </p>
            <p>Parent URL: {cast.parent_url}</p>
            <p>Root Parent URL: {cast.root_parent_url}</p>
            <hr />
          </div>
        ))
      ) : (
        <div className={styles.userInfo}>No casts found</div>
      )}
    </div>
  );
}
