import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { useYouTubeData } from "./YouTubeDataProvider";
import { createClient } from "@supabase/supabase-js";
import { SiCodeforces } from "react-icons/si";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { MdModeEdit } from "react-icons/md";
import { toast } from "sonner";
import { Toaster } from "sonner";
import { useUser } from "@clerk/nextjs";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"; // Import Dialog components
import { Label } from "../components/ui/label"; // Import Label component

interface ContestData {
  contestId: number;
  contestName: string;
  handle: string;
  rank: number;
  ratingUpdateTimeSeconds: number;
  oldRating: number;
  newRating: number;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

interface CodeForcesprevcontestsProps {
  username: string;
  onUsernameDelete: () => void; // Callback to notify parent
  onUsernameUpdate: (newUsername: string) => void; // Callback to notify parent of username update
  showBookmarkedOnly: boolean;
}

const CodeForcesprevcontests: React.FC<CodeForcesprevcontestsProps> = ({
  username,
  onUsernameDelete,
  onUsernameUpdate,
  showBookmarkedOnly,
}) => {
  const [userRatings, setUserRatings] = useState<ContestData[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [newUsername, setNewUsername] = useState(username);
  const { videos, loading: videoLoading } = useYouTubeData();
  const { user } = useUser();
  const userEmail = user?.emailAddresses[0]?.emailAddress;

  useEffect(() => {
    if (!username || !userEmail) return;

    const fetchUserRatings = async () => {
      try {
        const cachedData = localStorage.getItem(
          `codeforces_user_ratings_${username}`,
        );
        const cachedTimestamp = localStorage.getItem(
          `codeforces_user_ratings_timestamp_${username}`,
        );
        const fiveMinutes = 5 * 60 * 1000;

        if (
          cachedData &&
          cachedTimestamp &&
          Date.now() - parseInt(cachedTimestamp, 10) < fiveMinutes
        ) {
          console.log("Using cached data for Codeforces user ratings.");
          setUserRatings(JSON.parse(cachedData));
          setLoading(false);
          return;
        }

        const response = await fetch(
          `https://codeforces.com/api/user.rating?handle=${username}`,
        );

        console.log("username : ", username);
        console.log("response : ", response);

        const data = await response.json();

        if (data.status === "OK") {
          const sortedData = data.result.sort(
            (a: ContestData, b: ContestData) =>
              b.ratingUpdateTimeSeconds - a.ratingUpdateTimeSeconds,
          );

          setUserRatings(sortedData);

          // Cache the fetched data and the current timestamp
          localStorage.setItem(
            `codeforces_user_ratings_${username}`,
            JSON.stringify(sortedData),
          );
          localStorage.setItem(
            `codeforces_user_ratings_timestamp_${username}`,
            Date.now().toString(),
          );
        } else {
          console.error("Error fetching user ratings:", data.comment);

          // Mark the username as null in Supabase
          await supabase
            .from("users")
            .update({ codeforces_username: null })
            .eq("codeforces_username", username);

          // Show error toast
          toast.error(
            "Invalid Codeforces username. Please check and try again.",
          );

          // Notify parent that the username was deleted
          onUsernameDelete();
        }
      } catch (error) {
        console.error("Error fetching user ratings:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchBookmarks = async () => {
      try {
        const { data, error } = await supabase
          .from("bookmarks")
          .select("contest_name")
          .eq("email", userEmail);

        if (error) {
          throw error;
        }

        setBookmarks(
          data.map(
            (bookmark: { contest_name: string }) => bookmark.contest_name,
          ),
        );
      } catch (error) {
        console.error("Error fetching bookmarks:", error);
      }
    };

    fetchUserRatings();
    fetchBookmarks();
  }, [username, onUsernameDelete, userEmail]);

  const handleBookmark = async (contestName: string) => {
    if (!userEmail) {
      toast.error("Please sign in to bookmark contests");
      return;
    }

    try {
      if (bookmarks.includes(contestName)) {
        // Remove bookmark
        const { error } = await supabase
          .from("bookmarks")
          .delete()
          .eq("email", userEmail)
          .eq("contest_name", contestName);

        if (error) {
          throw error;
        }

        setBookmarks(bookmarks.filter((name) => name !== contestName));
      } else {
        // Add bookmark
        const { error } = await supabase
          .from("bookmarks")
          .insert([{ email: userEmail, contest_name: contestName }]);

        if (error) {
          throw error;
        }

        setBookmarks([...bookmarks, contestName]);
      }
    } catch (error) {
      console.error("Error updating bookmark:", error);
      toast.error("Failed to update bookmark");
    }
  };

  const handleUsernameUpdate = async () => {
    if (!newUsername) {
      toast.error("Username cannot be empty");
      return;
    }

    try {
      // Update the username in Supabase
      const { error } = await supabase
        .from("users")
        .update({ codeforces_username: newUsername })
        .eq("codeforces_username", username);

      if (error) {
        throw error;
      }

      // Notify the parent component of the username update
      onUsernameUpdate(newUsername);

      // Clear the cache for the old username
      localStorage.removeItem(`codeforces_user_ratings_${username}`);
      localStorage.removeItem(`codeforces_user_ratings_timestamp_${username}`);
    } catch (error) {
      console.error("Error updating username:", error);
      toast.error("Failed to update username");
    }
  };

  const extractRoundNumber = (title: string) => {
    const match = title.match(/round\s*(\d+)/i); // Match "Round" followed by a number
    return match ? match[1] : null; // Return the number if found
  };

  const findRelatedVideos = (contestName: string) => {
    const contestRoundNumber = extractRoundNumber(contestName);
    if (!contestRoundNumber) return []; // If no round number is found, return empty

    return videos.filter((video) => {
      const videoRoundNumber = extractRoundNumber(video.title);
      return videoRoundNumber === contestRoundNumber; // Match round numbers
    });
  };

  const chartData = userRatings
    .map((contest) => ({
      name: new Date(contest.ratingUpdateTimeSeconds * 1000).toLocaleDateString(
        "en-US",
        { month: "short", year: "numeric" },
      ),
      rating: contest.newRating,
      contestName: contest.contestName,
      date: new Date(
        contest.ratingUpdateTimeSeconds * 1000,
      ).toLocaleDateString(),
    }))
    .reverse();

  const tickValues = [
    1200, 1400, 1600, 1900, 2100, 2300, 2400, 2600, 3000, 3200, 3400, 3600,
    3800, 4000,
  ]; // Hardcoded for now
  const maxRating = Math.max(
    ...userRatings.map((contest) => contest.newRating),
    1200,
  );
  const nextTickValue = tickValues.find((value) => value > maxRating) || 3000;
  const minRating = Math.min(
    ...userRatings.map((contest) => contest.newRating),
  );
  const yAxisMin = Math.min(1200, minRating - 100); // Make sure the Y-axis starts below your lowest rating

  interface CustomTooltipProps {
    active?: boolean;
    payload?: {
      payload: { contestName: string; rating: number; date: string };
    }[];
  }

  const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { contestName, rating, date } = payload[0].payload;
      return (
        <div className="custom-tooltip bg-gray-800 text-white p-2 rounded">
          <p className="label">{`Contest: ${contestName}`}</p>
          <p className="intro">{`Rating: ${rating}`}</p>
          <p className="desc">{`Date: ${date}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      <Toaster richColors />
      <div className="grid gap-4 justify-center">
        <AnimatePresence>
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                layout
              >
                <Card className="p-4 w-[350px] sm:w-[400px] md:w-[450px] lg:w-[500px]">
                  <CardContent>
                    <Skeleton className="h-6 w-1/2 mb-2" />
                    <Skeleton className="h-4 w-1/3 mb-2" />
                    <Skeleton className="h-4 w-2/3 mb-4" />
                  </CardContent>
                </Card>
              </motion.div>
            ))
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                layout
              >
                <div className="flex items-center gap-2 mb-4">
                  <SiCodeforces className="text-2xl" />{" "}
                  {/* 'text-4xl' for larger size */}
                  <h1 className="text-2xl text-black dark:text-white">
                    Codeforces
                  </h1>
                  <span className="text-gray-600 dark:text-gray-400 ml-auto">
                    {username}
                  </span>
                  <Dialog>
                    <DialogTrigger asChild>
                      <MdModeEdit className="text-2xl" />
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Edit Codeforces Username</DialogTitle>
                        <DialogDescription>
                          Update your Codeforces username here. Click save when
                          done.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        {/* <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="current-username" className="text-right">
                                    Current Username
                                </Label>
                                <Input
                                    id="current-username"
                                    value={username}
                                    disabled
                                    className="col-span-3"
                                />
                            </div> */}
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="new-username" className="text-right">
                            New Username
                          </Label>
                          <Input
                            id="new-username"
                            value={newUsername}
                            onChange={(e) => setNewUsername(e.target.value)}
                            placeholder="Enter new username"
                            className="col-span-3"
                          />
                        </div>
                      </div>
                      <DialogFooter className="sm:justify-end">
                        <DialogClose asChild>
                          <Button type="button" variant="secondary">
                            Close
                          </Button>
                        </DialogClose>
                        <DialogClose asChild>
                          <Button type="button" onClick={handleUsernameUpdate}>
                            Save
                          </Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <Card className="p-4 w-[350px] sm:w-[400px] md:w-[450px] lg:w-[500px]">
                  <CardHeader>
                    <CardTitle>
                      Rating :{" "}
                      {userRatings[0].newRating !== undefined
                        ? userRatings[0].newRating
                        : "Nothing??"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="w-full overflow-hidden">
                      {" "}
                      {/* Prevents x-axis overflow */}
                      <AreaChart
                        width={400} // This will be overridden by the parent div's width
                        height={250}
                        data={chartData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis
                          domain={[yAxisMin, nextTickValue]}
                          ticks={tickValues.filter(
                            (value) => value <= nextTickValue,
                          )}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="rating"
                          stroke="#8884d8"
                          fill="#8884d8"
                        />
                      </AreaChart>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
              {userRatings
                .filter(
                  (contest) =>
                    !showBookmarkedOnly ||
                    bookmarks.includes(contest.contestName),
                )
                .map((contest) => {
                  const relatedVideos = findRelatedVideos(contest.contestName);

                  return (
                    <motion.div
                      key={contest.contestId}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      layout
                    >
                      <Card className="p-4 w-[350px] sm:w-[400px] md:w-[450px] lg:w-[500px]">
                        <CardContent>
                          <div className="flex justify-between items-center">
                            <a
                              href={`https://codeforces.com/contest/${contest.contestId}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xl font-bold hover:underline"
                            >
                              {contest.contestName}
                            </a>
                            <span
                              onClick={() =>
                                handleBookmark(contest.contestName)
                              }
                            >
                              {bookmarks.includes(contest.contestName) ? (
                                <FaBookmark className="text-black dark:text-white cursor-pointer" />
                              ) : (
                                <FaRegBookmark className="text-gray-500 dark:text-gray-400 cursor-pointer" />
                              )}
                            </span>
                          </div>
                          <p>Rank: {contest.rank}</p>
                          <p>Rating: {contest.newRating}</p>
                          <p>
                            Date:{" "}
                            {new Date(
                              contest.ratingUpdateTimeSeconds * 1000,
                            ).toLocaleString()}
                          </p>
                          <div className="mt-4">
                            <h3 className="font-bold text-lg">
                              Related Videos:
                            </h3>
                            {videoLoading ? (
                              <Skeleton className="h-4 w-2/3" />
                            ) : relatedVideos.length > 0 ? (
                              <ul>
                                {relatedVideos.map((video) => (
                                  <li key={video.url}>
                                    <a
                                      href={video.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-500 hover:underline"
                                    >
                                      {video.title}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-gray-500">
                                No related videos found.
                              </p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CodeForcesprevcontests;
