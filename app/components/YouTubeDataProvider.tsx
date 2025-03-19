import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

interface YouTubeVideo {
  title: string;
  url: string;
}

interface YouTubeResponse {
  videos: YouTubeVideo[];
}

interface YouTubeDataContextType {
  videos: YouTubeVideo[];
  loading: boolean;
  error: string | null;
}

interface CachedData {
  videos: YouTubeVideo[];
  timestamp: number;
}

const CACHE_KEY = "youtube_data_cache";
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
const TIMEOUT_DURATION = 10000; // 10 seconds in milliseconds

const YouTubeDataContext = createContext<YouTubeDataContextType | undefined>(
  undefined,
);

export const YouTubeDataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchYouTubeData = async (forceRefresh: boolean = false) => {
    console.log("Fetching YouTube data...");
    setLoading(true);

    const timeoutId = setTimeout(() => {
      toast("Videos are taking longer than usual to load , please wait :)");
    }, TIMEOUT_DURATION);

    try {
      if (!forceRefresh) {
        const cachedData = localStorage.getItem(CACHE_KEY);
        if (cachedData) {
          const parsedCache: CachedData = JSON.parse(cachedData);
          const isExpired = Date.now() - parsedCache.timestamp > CACHE_DURATION;

          if (!isExpired) {
            console.log("Using cached data");
            setVideos(parsedCache.videos);
            setError(null);
            setLoading(false);
            clearTimeout(timeoutId); // Clear timeout if cached data is used
            return;
          }
        }
      }

      const response = await fetch(
        "https://yt-channel-data.onrender.com/videos",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
          },
          body: JSON.stringify({
            channel_name: "TLE_Eliminators",
          }),
        },
      );

      console.log("Response status:", response.status);

      if (!response.ok) {
        console.error("Failed to fetch YouTube data. Status:", response.status);
        throw new Error("Failed to fetch YouTube data.");
      }

      const data: YouTubeResponse = await response.json();
      console.log("Fetched data:", data);

      if (!data.videos || !Array.isArray(data.videos)) {
        console.error("Invalid data structure:", data);
        throw new Error("Invalid data format received from API");
      }

      const validVideos: YouTubeVideo[] = data.videos.filter(
        (video) =>
          video &&
          typeof video.title === "string" &&
          typeof video.url === "string",
      );

      console.log("Validated videos:", validVideos);

      const cacheData: CachedData = {
        videos: validVideos,
        timestamp: Date.now(),
      };
      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));

      setVideos(validVideos);
      setError(null);
    } catch (err) {
      console.error("Error fetching YouTube data:", err);
      setError("Failed to fetch YouTube data.");
      setVideos([]);
    } finally {
      console.log("Fetching process completed.");
      setLoading(false);
      clearTimeout(timeoutId); // Clear the timeout when fetching completes
    }
  };

  useEffect(() => {
    fetchYouTubeData();

    const intervalId = setInterval(
      () => fetchYouTubeData(true),
      CACHE_DURATION,
    ); // Refresh every hour
    return () => clearInterval(intervalId);
  }, []);

  return (
    <YouTubeDataContext.Provider value={{ videos, loading, error }}>
      {children}
    </YouTubeDataContext.Provider>
  );
};

export const useYouTubeData = () => {
  const context = useContext(YouTubeDataContext);
  if (!context)
    throw new Error("useYouTubeData must be used within a YouTubeDataProvider");
  return context;
};
