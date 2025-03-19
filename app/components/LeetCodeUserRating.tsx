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
import { Skeleton } from "@/app/components/ui/skeleton";
import { useYouTubeData } from "./YouTubeDataProvider";
import { SiLeetcode } from "react-icons/si";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { MdModeEdit } from "react-icons/md";
import { toast } from "sonner";
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
} from "@/components/ui/dialog";
import { Label } from "../components/ui/label";

interface ContestData {
  attended: boolean;
  rating: number;
  ranking: number;
  trendDirection: string;
  problemsSolved: number;
  totalProblems: number;
  finishTimeInSeconds: number;
  contest: {
    title: string;
    startTime: number;
  };
}

interface ApiResponse {
  contestAttend: number;
  contestRating: number;
  contestGlobalRanking: number;
  totalParticipants: number;
  contestTopPercentage: number;
  contestBadges: null;
  contestParticipation: ContestData[];
}

import { createClient } from "@supabase/supabase-js";

const sanitizeTitle = (title: string) =>
  title.trim().toLowerCase().replace(/\s+/g, " ");
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

interface LeetcodeProps {
  username: string;
  onUsernameDelete: () => void;
  onUsernameUpdate: (newUsername: string) => void;
  showBookmarkedOnly: boolean;
}

const LeetCodeUserRating: React.FC<LeetcodeProps> = ({
  username,
  onUsernameDelete,
  onUsernameUpdate,
  showBookmarkedOnly,
}) => {
  const [userRatings, setUserRatings] = useState<ContestData[]>([]);
  const [userData, setUserData] = useState<ApiResponse>();
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
          `leetcode_user_ratings_${username}`,
        );
        const cachedTimestamp = localStorage.getItem(
          `leetcode_user_ratings_timestamp_${username}`,
        );
        const fiveMinutes = 5 * 60 * 1000;

        if (
          cachedData &&
          cachedTimestamp &&
          Date.now() - parseInt(cachedTimestamp, 10) < fiveMinutes
        ) {
          console.log("Using cached data.");
          const parsedData = JSON.parse(cachedData);
          setUserData(parsedData);
          setUserRatings(parsedData.contestParticipation); // Assuming this is the array you're sorting
          setLoading(false);
          console.log("------------- user data: ", userData);
          return;
        }

        const response = await fetch(
          `https://alfa-leetcode-api.onrender.com/${username}/contest`,
        );

        console.log("username: ", username);
        console.log("response: ", response);

        const data = await response.json();

        if (data.contestParticipation) {
          setUserData(data);
          const sortedData = data.contestParticipation.sort(
            (
              a: { contest: { startTime: number } },
              b: { contest: { startTime: number } },
            ) => b.contest.startTime - a.contest.startTime,
          );

          setUserRatings(sortedData);

          // Cache the entire data object (userData) and the current timestamp
          localStorage.setItem(
            `leetcode_user_ratings_${username}`,
            JSON.stringify(data),
          );
          localStorage.setItem(
            `leetcode_user_ratings_timestamp_${username}`,
            Date.now().toString(),
          );
        } else if (data.errors) {
          console.error("Invalid user, deleting username from Supabase.");

          // Mark the username as null in Supabase
          await supabase
            .from("users")
            .update({ leetcode_username: null })
            .eq("leetcode_username", username);

          // Show error toast
          toast.error("Invalid LeetCode username. Please check and try again.");

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
        .update({ leetcode_username: newUsername })
        .eq("leetcode_username", username);

      if (error) {
        throw error;
      }

      // Notify the parent component of the username update
      onUsernameUpdate(newUsername);

      // Clear the cache for the old username
      localStorage.removeItem(`leetcode_user_ratings_${username}`);
      localStorage.removeItem(`leetcode_user_ratings_timestamp_${username}`);
    } catch (error) {
      console.error("Error updating username:", error);
      toast.error("Failed to update username");
    }
  };

  const chartData = userRatings
    .map((contest) => ({
      name: new Date(contest.contest.startTime * 1000).toLocaleDateString(
        "en-US",
        { month: "short", year: "numeric" },
      ),
      rating: contest.rating,
      contestName: contest.contest.title,
      date: new Date(contest.contest.startTime * 1000).toLocaleDateString(),
    }))
    .reverse();

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active: boolean;
    payload: {
      payload: { contestName: string; rating: number; date: string };
    }[];
  }) => {
    if (active && payload && payload.length) {
      const { contestName, rating, date } = payload[0].payload;
      return (
        <div className="custom-tooltip bg-gray-800 text-white p-2 rounded">
          <p className="label">{`Contest: ${contestName}`}</p>
          <p>{`Rating: ${rating}`}</p>
          <p>{`Date: ${date}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
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
              {/* Chart at the top */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                layout
              >
                <div className="flex items-center gap-2 mb-4">
                  <SiLeetcode className="text-2xl" />
                  <h1 className="text-2xl text-black dark:text-white">
                    Leetcode
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
                        <DialogTitle>Edit LeetCode Username</DialogTitle>
                        <DialogDescription>
                          Update your LeetCode username here. Click save when
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
                      Rating:{" "}
                      {userData?.contestRating !== undefined
                        ? Math.ceil(userData.contestRating)
                        : "Loading..."}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="w-full overflow-hidden">
                      {" "}
                      {/* Prevents horizontal overflow */}
                      <AreaChart
                        width={450} // This is the max width; will shrink if needed
                        height={250}
                        data={chartData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip
                          content={
                            <CustomTooltip active={false} payload={[]} />
                          }
                        />
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

              {/* Contest cards below the chart */}
              {userRatings
                .filter(
                  (contest) =>
                    !showBookmarkedOnly ||
                    bookmarks.includes(contest.contest.title),
                )
                .map((contest) => {
                  const relatedVideos = videos.filter((video) =>
                    sanitizeTitle(video.title).includes(
                      sanitizeTitle(contest.contest.title),
                    ),
                  );

                  return (
                    <motion.div
                      key={contest.contest.title}
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
                              href={`https://leetcode.com/contest/${contest.contest.title.toLowerCase().replace(/ /g, "-")}/`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xl font-bold hover:underline"
                            >
                              {contest.contest.title}
                            </a>
                            <span
                              onClick={() =>
                                handleBookmark(contest.contest.title)
                              }
                            >
                              {bookmarks.includes(contest.contest.title) ? (
                                <FaBookmark className="text-black dark:text-white cursor-pointer" />
                              ) : (
                                <FaRegBookmark className="text-gray-500 dark:text-gray-400 cursor-pointer" />
                              )}
                            </span>
                          </div>
                          <p>Rank: {contest.ranking}</p>
                          <p>Rating: {contest.rating}</p>
                          <p>
                            Problems Solved: {contest.problemsSolved}/
                            {contest.totalProblems}
                          </p>
                          <p>
                            Date:{" "}
                            {new Date(
                              contest.contest.startTime * 1000,
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

export default LeetCodeUserRating;
