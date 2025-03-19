import React, { useEffect, useState } from "react";
import { Button } from "../components/ui/button";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { SiLeetcode, SiCodeforces, SiCodechef } from "react-icons/si";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/app/components/ui/card";

const platforms = [
  { name: "leetcode", icon: <SiLeetcode /> },
  { name: "codeforces", icon: <SiCodeforces /> },
  { name: "codechef", icon: <SiCodechef /> },
];

const CACHE_KEY = "contestDataCache";
const CACHE_EXPIRY = 10 * 60 * 1000;

const ContestData = () => {
  interface Contest {
    title: string;
    url: string;
    startTime: string;
    site: string;
  }

  const [contests, setContests] = useState<Contest[]>([]);
  const [filteredContests, setFilteredContests] = useState<Contest[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState(
    platforms.map((p) => p.name),
  );
  const [loading, setLoading] = useState(true);

  const fetchContests = async () => {
    try {
      const response = await fetch(
        "https://competeapi.vercel.app/contests/upcoming",
      );
      const data = await response.json();
      setContests(data);
      setFilteredContests(data);
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ data, timestamp: Date.now() }),
      );
    } catch (error) {
      console.error("Error fetching contest data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cachedData = localStorage.getItem(CACHE_KEY);
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      if (Date.now() - timestamp < CACHE_EXPIRY) {
        setContests(data);
        setFilteredContests(data);
        setLoading(false);
        return;
      }
    }
    fetchContests();

    const intervalId = setInterval(fetchContests, CACHE_EXPIRY);
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const filtered = contests.filter((contest) =>
      selectedPlatforms.includes(contest.site),
    );
    setFilteredContests(filtered);
  }, [contests, selectedPlatforms]);

  const togglePlatform = (platformName: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platformName)
        ? prev.filter((p) => p !== platformName)
        : [...prev, platformName],
    );
  };

  const renderContests = (platform: string) => {
    const filtered = filteredContests.filter(
      (contest) => contest.site === platform,
    );

    if (!selectedPlatforms.includes(platform)) return null;

    const platformIcon = platforms.find((p) => p.name === platform)?.icon;

    return (
      <motion.div
        key={platform}
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-grow min-w-[300px] flex flex-col gap-4"
      >
        <h2 className="text-xl font-bold mb-4 capitalize">{platform}</h2>
        {filtered.length > 0 ? (
          filtered.map((contest) => (
            <Card key={contest.url} className="p-4">
              <CardContent>
                <h3 className="text-lg font-bold">{contest.title}</h3>
                <p>
                  Start Time: {new Date(contest.startTime).toLocaleString()}
                </p>
                <Button variant="link" asChild>
                  <a
                    href={contest.url}
                    target="_blank"
                    className="flex items-center gap-2"
                  >
                    {platformIcon}
                    Visit
                  </a>
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="p-4">
            <CardContent>
              <p className="text-gray-500">No upcoming contests available.</p>
            </CardContent>
          </Card>
        )}
      </motion.div>
    );
  };

  return (
    <div className="p-4 flex flex-col items-center">
      <div className="left-0 right-0 py-2 flex justify-center">
        <div>
          <div className="mb-4 flex gap-2">
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
          </div>
        </div>
      </div>

      <div className="mt-20 w-full max-w-5xl flex flex-col gap-4">
        <LayoutGroup>
          {loading ? (
            <div className="flex flex-wrap gap-4 justify-between">
              {platforms.map((platform, index) => (
                <Skeleton key={index} className="w-full min-w-[300px] h-56" />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-4 justify-between">
              <AnimatePresence>
                {selectedPlatforms.length === 0 ? (
                  <motion.div
                    key="no-platforms"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.1 }}
                    className="w-full flex flex-col items-center justify-center py-8"
                  >
                    <p className="text-gray-500">
                      Please select at least one platform to view upcoming
                      contests.
                    </p>
                  </motion.div>
                ) : (
                  ["codeforces", "leetcode", "codechef"].map((platform) =>
                    renderContests(platform),
                  )
                )}
              </AnimatePresence>
            </div>
          )}
        </LayoutGroup>
      </div>
    </div>
  );
};

export default ContestData;
