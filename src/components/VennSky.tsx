"use client";

import { useState } from "react";
import Image from "next/image";
import {
  getAllFollowers,
  getAllFollows,
  getProfile,
  calculateOverlap,
  ProfileBasic,
} from "~/lib/bluesky";

type ComparisonType = "followers" | "following";

interface HandleEntry {
  handle: string;
  comparisonType: ComparisonType;
}

interface UserData extends HandleEntry {
  profile?: {
    displayName?: string;
    avatar?: string;
    followersCount?: number;
    followsCount?: number;
  };
  list: ProfileBasic[];
}

const MAX_HANDLES = 5;

export default function VennSky() {
  const [entries, setEntries] = useState<HandleEntry[]>([
    { handle: "", comparisonType: "followers" },
    { handle: "", comparisonType: "followers" },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<{
    users: UserData[];
    overlapping: ProfileBasic[];
    uniqueToEach: ProfileBasic[][];
    counts: number[];
  } | null>(null);

  const handleInputChange = (index: number, value: string) => {
    const newEntries = [...entries];
    newEntries[index] = { ...newEntries[index], handle: value };
    setEntries(newEntries);
  };

  const handleComparisonTypeChange = (
    index: number,
    value: ComparisonType
  ) => {
    const newEntries = [...entries];
    newEntries[index] = { ...newEntries[index], comparisonType: value };
    setEntries(newEntries);
  };

  const addHandle = () => {
    setEntries([...entries, { handle: "", comparisonType: "followers" }]);
  };

  const removeHandle = (index: number) => {
    if (entries.length > 2) {
      setEntries(entries.filter((_, i) => i !== index));
    }
  };

  const addUserToComparison = (handleToAdd: string) => {
    const normalizedHandle = handleToAdd.trim();

    // Check if handle is already in the list
    if (
      !entries.some((entry) => entry.handle.trim() === normalizedHandle) &&
      entries.length < MAX_HANDLES
    ) {
      // Replace first empty handle or add new one
      const emptyIndex = entries.findIndex((entry) => entry.handle.trim() === "");
      if (emptyIndex !== -1) {
        const newEntries = [...entries];
        newEntries[emptyIndex] = {
          ...newEntries[emptyIndex],
          handle: normalizedHandle,
        };
        setEntries(newEntries);
      } else {
        setEntries([
          ...entries,
          { handle: normalizedHandle, comparisonType: "followers" },
        ]);
      }
    }
  };

  const handleAnalyze = async () => {
    const filteredEntries = entries
      .filter((entry) => entry.handle.trim() !== "")
      .map((entry) => ({ ...entry, handle: entry.handle.trim() }));

    if (filteredEntries.length < 2) {
      setError("Please enter at least 2 Blue Sky handles");
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const userData: UserData[] = [];

      for (const entry of filteredEntries) {
        try {
          const profile = await getProfile(entry.handle);
          const list =
            entry.comparisonType === "followers"
              ? await getAllFollowers(entry.handle)
              : await getAllFollows(entry.handle);

          userData.push({
            handle: entry.handle,
            comparisonType: entry.comparisonType,
            profile: {
              displayName: profile.displayName,
              avatar: profile.avatar,
              followersCount: profile.followersCount,
              followsCount: profile.followsCount,
            },
            list,
          });
        } catch {
          throw new Error(`Failed to fetch data for @${entry.handle}`);
        }
      }

      const lists = userData.map((u) => u.list);
      const { overlapping, uniqueToEach, counts } = calculateOverlap(lists);

      setResults({
        users: userData,
        overlapping,
        uniqueToEach,
        counts,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-6xl mx-auto">
        <header className="text-center py-8">
          <h1 className="text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            Venn Sky
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            Discover the overlap of{" "}
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              followers
            </span>{" "}
            or{" "}
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              following
            </span>{" "}
            between Blue Sky users
          </p>
        </header>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Blue Sky Handles (without @) and List Type
              </label>
              <div className="space-y-2">
                {entries.map((entry, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={entry.handle}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                      placeholder={`Handle ${index + 1} (e.g., user.bsky.social)`}
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck="false"
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    />
                    <select
                      value={entry.comparisonType}
                      onChange={(e) =>
                        handleComparisonTypeChange(
                          index,
                          e.target.value as ComparisonType
                        )
                      }
                      className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                    >
                      <option value="followers">Followers</option>
                      <option value="following">Following</option>
                    </select>
                    {entries.length > 2 && (
                      <button
                        onClick={() => removeHandle(index)}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {entries.length < MAX_HANDLES && (
                <button
                  onClick={addHandle}
                  className="mt-2 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition"
                >
                  + Add Another Handle
                </button>
              )}
            </div>

            <button
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              {loading ? "Analyzing..." : "Analyze Overlap"}
            </button>

            {error && (
              <div className="p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
                {error}
              </div>
            )}
          </div>
        </div>

        {results && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
              Results
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {results.users.map((user, index) => (
                <div
                  key={`${user.handle}-${user.comparisonType}-${index}`}
                  className="p-4 bg-blue-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex items-center gap-3 mb-2">
                    {user.profile?.avatar && (
                      <Image
                        src={user.profile.avatar}
                        alt={user.handle}
                        className="w-12 h-12 rounded-full"
                        width={48}
                        height={48}
                      />
                    )}
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                        {user.profile?.displayName || user.handle}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        @{user.handle}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-700 dark:text-gray-300">
                    <p>
                      {user.comparisonType === "followers"
                        ? "Followers"
                        : "Following"}
                      :{" "}
                      <span className="font-semibold">{results.counts[index]}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-6">
              <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                <h3 className="text-xl font-semibold text-green-800 dark:text-green-200 mb-3">
                  ✨ Overlapping Users ({results.overlapping.length})
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300 mb-3">
                  {results.overlapping.length > 0
                    ? `These users appear in all ${results.users.length} lists:`
                    : "No users appear in all lists"}
                </p>
                {results.overlapping.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-96 overflow-y-auto">
                    {results.overlapping.map((profile) => (
                      <div
                        key={profile.did}
                        className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded hover:bg-green-100 dark:hover:bg-gray-700 transition"
                      >
                        <a
                          href={`https://bsky.app/profile/${profile.handle}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 flex-1 min-w-0"
                        >
                          {profile.avatar && (
                            <Image
                              src={profile.avatar}
                              alt={profile.handle}
                              className="w-8 h-8 rounded-full"
                              width={32}
                              height={32}
                            />
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                              {profile.displayName || profile.handle}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                              @{profile.handle}
                            </p>
                          </div>
                        </a>
                        <button
                          onClick={() => addUserToComparison(profile.handle)}
                          className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded transition"
                          title="Add to comparison"
                          aria-label={`Add ${profile.handle} to comparison`}
                        >
                          +
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {results.uniqueToEach.some((list) => list.length > 0) && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                    Unique to Each User
                  </h3>
                  {results.users.map((user, index) => {
                    const uniqueList = results.uniqueToEach[index];
                    if (uniqueList.length === 0) return null;

                    return (
                      <div
                        key={user.handle}
                        className="p-4 bg-blue-50 dark:bg-gray-700 rounded-lg"
                      >
                        <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">
                          Unique to @{user.handle} ({uniqueList.length})
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                          {uniqueList.slice(0, 50).map((profile) => (
                            <a
                              key={profile.did}
                              href={`https://bsky.app/profile/${profile.handle}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded hover:bg-blue-100 dark:hover:bg-gray-600 transition"
                            >
                              {profile.avatar && (
                                <Image
                                  src={profile.avatar}
                                  alt={profile.handle}
                                  className="w-8 h-8 rounded-full"
                                  width={32}
                                  height={32}
                                />
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">
                                  {profile.displayName || profile.handle}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                  @{profile.handle}
                                </p>
                              </div>
                            </a>
                          ))}
                        </div>
                        {uniqueList.length > 50 && (
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                            ... and {uniqueList.length - 50} more
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
