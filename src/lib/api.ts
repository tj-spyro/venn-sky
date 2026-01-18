import { BskyAgent } from "@atproto/api";

export const agent = new BskyAgent({
  service: "https://public.api.bsky.app",
});
