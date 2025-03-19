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
import { format, parseISO } from "date-fns";
import { useYouTubeData } from "./YouTubeDataProvider"; // Added YouTube data provider
import { SiCodechef } from "react-icons/si";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";
import { createClient } from "@supabase/supabase-js";
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
} from "@/components/ui/dialog";
import { Label } from "@/app/components/ui/label";

interface RatingData {
  code: string;
  getyear: string;
  getmonth: string;
  getday: string;
  name: string;
  rating: string;
  rank: string;
  end_date: string;
}

interface UserData {
  profile: string;
  name: string;
  currentRating: number;
  highestRating: number;
  countryFlag: string;
  countryName: string;
  globalRank: number;
  countryRank: number;
  stars: string;
  ratingData: RatingData[];
}

// Contest identifier functions
const sanitizeTitle = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "") // Remove special characters
    .replace(/\s+/g, " ") // Collapse multiple spaces
    .trim()
    .replace(/ /g, ""); // Remove all spaces

const getContestIdentifier = (contestName: string) => {
  // Match contest type and number (e.g., "Starters 173", "Cook-Off 123")
  const match = contestName.match(/(starters|cook-off|lunchtime)\s+(\d+)/i);
  if (match) {
    const type = match[1].toLowerCase().replace(/-/g, "");
    return `${type}${match[2]}`; // e.g. "starters173", "cookoff123"
  }
  return null;
};

interface CodechefProps {
  username: string;
  onUsernameDelete: () => void; // Callback to notify parent
  onUsernameUpdate: (newUsername: string) => void;
  showBookmarkedOnly: boolean;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);

const CodechefUserRating: React.FC<CodechefProps> = ({
  username,
  onUsernameDelete,
  onUsernameUpdate,
  showBookmarkedOnly,
}) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const { videos, loading: videoLoading } = useYouTubeData(); // YouTube data hook
  const [newUsername, setNewUsername] = useState(username);
  const { user } = useUser();
  const userEmail = user?.emailAddresses[0]?.emailAddress;

  useEffect(() => {
    if (!username || !userEmail) return;

    const fetchUserData = async () => {
      try {
        const cachedData = localStorage.getItem(
          `codechef_user_data_${username}`,
        );
        const cachedTimestamp = localStorage.getItem(
          `codechef_user_data_timestamp_${username}`,
        );
        const fiveMinutes = 5 * 60 * 1000;

        if (
          cachedData &&
          cachedTimestamp &&
          Date.now() - parseInt(cachedTimestamp, 10) < fiveMinutes
        ) {
          console.log("Using cached data for CodeChef user.");
          setUserData(JSON.parse(cachedData));
          setLoading(false);
          return;
        }

        // Fetch data from the API
        const response = await fetch(
          `https://codechef-api.vercel.app/handle/${username}`,
        );

        console.log("username: ", username);
        console.log("response: ", response);

        const data = await response.json();

        if (data.success) {
          setUserData(data);

          // Cache the fetched data and the current timestamp
          localStorage.setItem(
            `codechef_user_data_${username}`,
            JSON.stringify(data),
          );
          localStorage.setItem(
            `codechef_user_data_timestamp_${username}`,
            Date.now().toString(),
          );
        } else {
          console.error("Invalid user, deleting username from Supabase.");

          // Mark the username as null in Supabase
          await supabase
            .from("users")
            .update({ codechef_username: null })
            .eq("codechef_username", username);

          // Show error toast
          toast.error("Invalid CodeChef username. Please check and try again.");

          // Notify parent that the username was deleted
          onUsernameDelete();
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
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

    fetchUserData();
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

  // Format chart data with proper date parsing
  const chartData =
    userData?.ratingData.map((contest) => ({
      name: contest.name,
      rating: parseInt(contest.rating),
      date: contest.end_date,
      formattedDate: format(parseISO(contest.end_date), "MMM yyyy"),
    })) || [];

  interface CustomTooltipProps {
    active?: boolean;
    payload?: {
      payload: { name: string; rating: number; formattedDate: string };
    }[];
  }

  const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { name, rating, formattedDate } = payload[0].payload;
      return (
        <div className="custom-tooltip bg-gray-800 text-white p-2 rounded z-[9999]">
          <p className="label">{`Contest: ${name}`}</p>
          <p className="intro">{`Rating: ${rating}`}</p>
          <p className="desc">{`Date: ${formattedDate}`}</p>
        </div>
      );
    }
    return null;
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
        .update({ codechef_username: newUsername })
        .eq("codechef_username", username);

      if (error) {
        throw error;
      }

      // Notify the parent component of the username update
      onUsernameUpdate(newUsername);

      // Clear the cache for the old username
      localStorage.removeItem(`codechef_user_data_${username}`);
      localStorage.removeItem(`codechef_user_data_timestamp_${username}`);
    } catch (error) {
      console.error("Error updating username:", error);
      toast.error("Failed to update username");
    }
  };

  return (
    <div>
      <Toaster richColors />

      <div className="grid gap-4 justify-center">
        <AnimatePresence>
          {loading
            ? Array.from({ length: 4 }).map((_, index) => (
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
            : userData && (
                <>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    layout
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <SiCodechef className="text-2xl" />
                      <h1 className="text-2xl text-black dark:text-white">
                        CodeChef
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
                            <DialogTitle>Edit CodeChef Username</DialogTitle>
                            <DialogDescription>
                              Update your CodeChef username here. Click save
                              when done.
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
                              <Label
                                htmlFor="new-username"
                                className="text-right"
                              >
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
                              <Button
                                type="button"
                                onClick={handleUsernameUpdate}
                              >
                                Save
                              </Button>
                            </DialogClose>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <Card className="p-4 w-[350px] sm:w-[400px] md:w-[450px] lg:w-[500px]">
                      <CardHeader>
                        <CardTitle>Rating : {userData.stars}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="w-full overflow-hidden">
                          {" "}
                          {/* Ensures no horizontal scrolling */}
                          <AreaChart
                            width={450} // This matches the max width of the card
                            height={250}
                            data={chartData}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                              dataKey="formattedDate"
                              tickFormatter={(date) => date}
                              interval={Math.ceil(chartData.length / 5)}
                            />
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

                  {[...userData.ratingData]
                    .reverse()
                    .filter(
                      (contest) =>
                        !showBookmarkedOnly || bookmarks.includes(contest.name),
                    ) // Apply bookmark filter here
                    .map((contest, index) => {
                      const contestId = getContestIdentifier(contest.name); // Get the contest identifier
                      const relatedVideos = contestId
                        ? videos.filter((video) => {
                            const videoId = sanitizeTitle(video.title);
                            return videoId.includes(contestId);
                          })
                        : [];

                      return (
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
                              <div className="flex justify-between items-center">
                                <a
                                  href={`https://www.codechef.com/${contest.code}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xl font-bold hover:underline"
                                >
                                  {contest.name}
                                </a>
                                <span
                                  onClick={() => handleBookmark(contest.name)}
                                >
                                  {bookmarks.includes(contest.name) ? (
                                    <FaBookmark className="text-black dark:text-white cursor-pointer" />
                                  ) : (
                                    <FaRegBookmark className="text-gray-500 dark:text-gray-400 cursor-pointer" />
                                  )}
                                </span>
                              </div>
                              <p>Rank: {contest.rank}</p>
                              <p>Rating: {contest.rating}</p>
                              <p>
                                Date: {contest.getday}/{contest.getmonth}/
                                {contest.getyear}{" "}
                                {contest.end_date.split(" ")[1]}
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
                                      <li key={video.url} className="mt-2">
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

export default CodechefUserRating;
