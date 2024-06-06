export interface FarcasterUser {
  signer_uuid: string;
  public_key: string;
  status: string;
  signer_approval_url?: string;
  fid?: number;
}

export type Response = {
  casts: Cast[];
  next: {
    cursor: string;
  };
};

export type ErrorResponse = {
  code: string;
  message: string;
  property: string;
  status: number;
};

export type Cast = {
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
