import React, { useEffect, useState } from "react";
import CodeForcesprevcontests from "./CodeForcesprevcontests";
import LeetCodeUserRating from "./LeetCodeUserRating";
import CodeChef from "./CodeChef";
import { YouTubeDataProvider } from "./YouTubeDataProvider";
import { supabase } from "../supabaseClient";
import { useUser } from "@clerk/nextjs";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { SiLeetcode, SiCodeforces, SiCodechef } from "react-icons/si";
import { FaBookmark } from "react-icons/fa";
import Loading from "../loading";
import { motion, AnimatePresence } from "framer-motion";

const platforms = [
  { name: "codeforces", icon: <SiCodeforces /> },
  { name: "leetcode", icon: <SiLeetcode /> },
  { name: "codechef", icon: <SiCodechef /> },
];

const YourProgress = () => {
  const { user } = useUser();
  const userId = user?.id;
  const userEmail = user?.emailAddresses[0]?.emailAddress;

  const [userData, setUserData] = useState({
    email: "",
    codeforces_username: "",
    leetcode_username: "",
    codechef_username: "",
  });
  const [loading, setLoading] = useState(true);
  const [newUsernames, setNewUsernames] = useState({
    codeforces_username: "",
    leetcode_username: "",
    codechef_username: "",
  });
  const [selectedPlatforms, setSelectedPlatforms] = useState(
    platforms.map((p) => p.name),
  );
  const [showBookmarkedOnly, setShowBookmarkedOnly] = useState(false);

  // Fetch user data from Supabase
  const fetchUserData = async () => {
    if (!userId) return;
    const { data, error } = await supabase
      .from("users")
      .select(
        "email, codeforces_username, leetcode_username, codechef_username",
      )
      .eq("user_id", userId)
      .single();

    if (error) {
      console.error("Error fetching user data:", error);
    } else {
      setUserData(data);
    }
    setLoading(false);
  };

  // Save new username to Supabase
  type Platform =
    | "codeforces_username"
    | "leetcode_username"
    | "codechef_username";

  const handleSave = async (platform: Platform) => {
    const { error } = await supabase.from("users").upsert(
      {
        user_id: userId,
        email: userEmail,
        [platform]: newUsernames[platform],
      },
      { onConflict: "user_id" },
    );

    if (error) {
      console.error(`Error saving ${platform}:`, error);
    } else {
      fetchUserData(); // Refresh data after saving
    }
  };

  // Handle username deletion
  const handleUsernameDelete = async (platform: string) => {
    const { error } = await supabase
      .from("users")
      .update({ [platform]: null })
      .eq("user_id", userId);

    if (error) {
      console.error(`Error deleting ${platform} username:`, error);
    } else {
      fetchUserData(); // Refresh data after deletion
    }
  };

  // Fetch user data on component mount or when userId changes
  useEffect(() => {
    fetchUserData();
  }, [userId]);

  // Toggle the visibility of a platform section
  const togglePlatform = (platformName: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformName)
        ? prev.filter((p) => p !== platformName)
        : [...prev, platformName],
    );
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <YouTubeDataProvider>
      <div className="left-0 right-0 py-2 flex justify-center">
        <div>
          <div>
            <div className="mb-4 flex flex-wrap gap-2 items-center justify-center sm:justify-start">
              {platforms.map((platform) => (
                <Button
                  key={platform.name}
                  variant={
                    selectedPlatforms.includes(platform.name)
                      ? "default"
                      : "outline"
                  }
                  onClick={() => togglePlatform(platform.name)}
                  className="flex items-center gap-2"
                >
                  {platform.icon}
                  {platform.name}
                </Button>
              ))}
              <div className="w-full flex justify-center sm:w-auto">
                <Button
                  variant={showBookmarkedOnly ? "default" : "outline"}
                  onClick={() => setShowBookmarkedOnly(!showBookmarkedOnly)}
                  className="flex items-center gap-2 mt-2 sm:mt-0"
                >
                  <FaBookmark className="w-4 h-4" />
                  Bookmarked
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        className={`flex flex-col md:flex-row gap-2 ${selectedPlatforms.length === 1 ? "justify-center" : ""}`}
      >
        {/* <motion.div className={`flex flex-col md:flex-row gap-4 w-full ${selectedPlatforms.length === 1 ? 'justify-center' : ''}`} layout> */}
        <AnimatePresence mode="wait">
          {selectedPlatforms.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              //     transition={{ duration: 0.3, ease: "easeInOut" }}
              className="w-full flex flex-col items-center justify-center py-8"
            >
              <p className="text-muted-foreground">koi progress hi nahi hai</p>
              <p className="text-muted-foreground">
                select a platform to show progress
              </p>
            </motion.div>
          ) : (
            <>
              {/* Codeforces Section */}
              {selectedPlatforms.includes("codeforces") && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  // transition={{ duration: 0.3, ease: "easeInOut" }}
                  // layout
                >
                  <Card className="w-full border-none shadow-sm">
                    <CardContent className="p-6">
                      {userData?.codeforces_username ? (
                        <CodeForcesprevcontests
                          username={userData.codeforces_username}
                          onUsernameDelete={() =>
                            handleUsernameDelete("codeforces_username")
                          }
                          onUsernameUpdate={(newUsername) => {
                            setUserData({
                              ...userData,
                              codeforces_username: newUsername,
                            });
                          }}
                          showBookmarkedOnly={showBookmarkedOnly}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <SiCodeforces className="w-5 h-5" />
                            <p>Codeforces </p>
                          </div>
                          <div className="flex flex-col items-center space-y-2 w-full max-w-sm">
                            <Input
                              type="text"
                              placeholder="Enter Codeforces username"
                              value={newUsernames.codeforces_username}
                              onChange={(e) =>
                                setNewUsernames({
                                  ...newUsernames,
                                  codeforces_username: e.target.value,
                                })
                              }
                              className="w-full"
                            />
                            <Button
                              onClick={() => handleSave("codeforces_username")}
                              className="w-full"
                            >
                              Save
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* LeetCode Section */}
              {selectedPlatforms.includes("leetcode") && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  // transition={{ duration: 0.3, ease: "easeInOut" }}
                  // layout
                >
                  <Card className="w-full border-none shadow-sm">
                    <CardContent className="p-6">
                      {userData?.leetcode_username ? (
                        <LeetCodeUserRating
                          username={userData.leetcode_username}
                          onUsernameDelete={() =>
                            handleUsernameDelete("leetcode_username")
                          }
                          onUsernameUpdate={(newUsername) => {
                            setUserData({
                              ...userData,
                              leetcode_username: newUsername,
                            });
                          }}
                          showBookmarkedOnly={showBookmarkedOnly}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <SiLeetcode className="w-5 h-5" />
                            <p>LeetCode </p>
                          </div>
                          <div className="flex flex-col items-center space-y-2 w-full max-w-sm">
                            <Input
                              type="text"
                              placeholder="Enter LeetCode username"
                              value={newUsernames.leetcode_username}
                              onChange={(e) =>
                                setNewUsernames({
                                  ...newUsernames,
                                  leetcode_username: e.target.value,
                                })
                              }
                              className="w-full"
                            />
                            <Button
                              onClick={() => handleSave("leetcode_username")}
                              className="w-full"
                            >
                              Save
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* CodeChef Section */}
              {selectedPlatforms.includes("codechef") && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  // transition={{ duration: 0.3, ease: "easeInOut" }}
                  // layout
                >
                  <Card className="w-full border-none shadow-sm">
                    <CardContent className="p-6">
                      {userData?.codechef_username ? (
                        <CodeChef
                          username={userData.codechef_username}
                          onUsernameDelete={() =>
                            handleUsernameDelete("codechef_username")
                          }
                          onUsernameUpdate={(newUsername) => {
                            setUserData({
                              ...userData,
                              codechef_username: newUsername,
                            });
                          }}
                          showBookmarkedOnly={showBookmarkedOnly}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <SiCodechef className="w-5 h-5" />
                            <p>CodeChef </p>
                          </div>
                          <div className="flex flex-col items-center space-y-2 w-full max-w-sm">
                            <Input
                              type="text"
                              placeholder="Enter CodeChef username"
                              value={newUsernames.codechef_username}
                              onChange={(e) =>
                                setNewUsernames({
                                  ...newUsernames,
                                  codechef_username: e.target.value,
                                })
                              }
                              className="w-full"
                            />
                            <Button
                              onClick={() => handleSave("codechef_username")}
                              className="w-full"
                            >
                              Save
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>
        {/* </motion.div> */}
      </div>
    </YouTubeDataProvider>
  );
};

export default YourProgress;
