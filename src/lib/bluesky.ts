import { agent } from "./api";
import { getCached, setCached } from "./cache";
import type { AppBskyActorDefs } from "@atproto/api";

export interface ProfileBasic {
  did: string;
  handle: string;
  displayName?: string;
  avatar?: string;
}

/**
 * Fetch all followers for a given actor with pagination
 */
export async function getAllFollowers(actor: string): Promise<ProfileBasic[]> {
  // Check cache first
  const cached = getCached<ProfileBasic[]>(actor, "followers");
  if (cached) {
    return cached;
  }

  const followers: ProfileBasic[] = [];
  let cursor: string | undefined = undefined;

  try {
    do {
      const response = await agent.app.bsky.graph.getFollowers({
        actor,
        limit: 100,
        cursor,
      });

      followers.push(...response.data.followers);
      cursor = response.data.cursor;
    } while (cursor);

    // Cache the results
    setCached(actor, "followers", followers);

    return followers;
  } catch (error) {
    console.error(`Error fetching followers for ${actor}:`, error);
    throw new Error(`Failed to fetch followers for ${actor}`);
  }
}

/**
 * Fetch all follows (following) for a given actor with pagination
 */
export async function getAllFollows(actor: string): Promise<ProfileBasic[]> {
  // Check cache first
  const cached = getCached<ProfileBasic[]>(actor, "following");
  if (cached) {
    return cached;
  }

  const follows: ProfileBasic[] = [];
  let cursor: string | undefined = undefined;

  try {
    do {
      const response = await agent.app.bsky.graph.getFollows({
        actor,
        limit: 100,
        cursor,
      });

      follows.push(...response.data.follows);
      cursor = response.data.cursor;
    } while (cursor);

    // Cache the results
    setCached(actor, "following", follows);

    return follows;
  } catch (error) {
    console.error(`Error fetching follows for ${actor}:`, error);
    throw new Error(`Failed to fetch follows for ${actor}`);
  }
}

/**
 * Get profile information for an actor
 */
export async function getProfile(
  actor: string
): Promise<AppBskyActorDefs.ProfileViewDetailed> {
  // Check cache first
  const cached = getCached<AppBskyActorDefs.ProfileViewDetailed>(
    actor,
    "profile"
  );
  if (cached) {
    return cached;
  }

  try {
    const response = await agent.app.bsky.actor.getProfile({ actor });
    const profileData = response.data;

    // Cache the results
    setCached(actor, "profile", profileData);

    return profileData;
  } catch (error) {
    console.error(`Error fetching profile for ${actor}:`, error);
    throw new Error(`Failed to fetch profile for ${actor}`);
  }
}

/**
 * Calculate the overlap (intersection) of users across multiple lists
 */
export function calculateOverlap(lists: ProfileBasic[][]): {
  overlapping: ProfileBasic[];
  uniqueToEach: ProfileBasic[][];
  counts: number[];
} {
  if (lists.length === 0) {
    return { overlapping: [], uniqueToEach: [], counts: [] };
  }

  // Create a map to count occurrences of each DID
  const didCounts = new Map<string, { profile: ProfileBasic; count: number }>();

  lists.forEach((list) => {
    const seenInThisList = new Set<string>();
    list.forEach((profile) => {
      if (!seenInThisList.has(profile.did)) {
        seenInThisList.add(profile.did);
        const existing = didCounts.get(profile.did);
        if (existing) {
          existing.count++;
        } else {
          didCounts.set(profile.did, { profile, count: 1 });
        }
      }
    });
  });

  // Find profiles that appear in all lists
  const overlapping = Array.from(didCounts.values())
    .filter((item) => item.count === lists.length)
    .map((item) => item.profile);

  // Find profiles unique to each list
  const uniqueToEach = lists.map((list) => {
    return list.filter((profile) => {
      const item = didCounts.get(profile.did);
      return item && item.count === 1;
    });
  });

  // Count total for each list
  const counts = lists.map((list) => list.length);

  return { overlapping, uniqueToEach, counts };
}
