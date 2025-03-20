"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // Use next/navigation for App Router
import Image from "next/image";
import { motion } from "framer-motion";
import LeetCodeIcon from "./leetcode.svg"; // Correctly import the SVG
import CodeChefIcon from "./codechef.svg"; // Assuming you have a codechef.svg file
import CodeforcesIcon from "./code-forces.svg"; // Assuming you have a codeforces.svg file
import TLEicon from "./tle.jpg";
import ghcat from "./securitocat.png"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "./ui/chart";
import { Button } from "./ui/moving-border";
import { WobbleCard } from "./ui/wobble-card";
// import { PinContainer } from "./ui/3d-pin";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";
import { Compare } from "./ui/compare";
import tlecode from "./tle.png";
import notlecode from "./notle.png";

const chartData = [
  { month: "January", desktop: 1200 },
  { month: "February", desktop: 1460 },
  { month: "March", desktop: 1500 },
  { month: "April", desktop: 1420 },
  { month: "May", desktop: 1640 },
  { month: "June", desktop: 1690 },
];
const chartConfig = {
  desktop: {
    label: "Rating",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;
// ShowHome Component
const ShowHome = () => {
  const router = useRouter();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [iconPositions, setIconPositions] = useState<
    Array<{ x: number; y: number }>
  >([]);

  const handleSignInClick = () => {
    router.push("/sign-in"); // Route to the sign-in page
  };

  // Define platform icons with their properties
  const platformIcons = [
    {
      icon: LeetCodeIcon,
      alt: "LeetCode",
      rotate: -12,
      shadow: "rgba(49,120,198,0.35)",
    },
    {
      icon: CodeChefIcon,
      alt: "CodeChef",
      rotate: -62,
      shadow: "rgba(49,120,198,0.35)",
    },
    {
      icon: CodeforcesIcon,
      alt: "Codeforces",
      rotate: 0,
      shadow: "rgba(0,0,255,0.35)",
    },
    {
      icon: TLEicon,
      ale: "TLEelimination",
      rotate: 0,
      shadow: "rgba(49,120,198,0.35)",
    },
  ];

  const floatingVariant = {
    initial: { y: 0, opacity: 0 },
    animate: {
      y: [0, -10, 0],
      opacity: 1,
      transition: {
        y: {
          duration: 3,
          ease: "easeInOut",
          repeat: Infinity,
        },
        opacity: {
          duration: 0.8,
          ease: "easeInOut",
        },
      },
    },
  };

  const handleMouseMove = (event: MouseEvent) => {
    const { clientX, clientY } = event;
    setMousePosition({ x: clientX, y: clientY });
  };

  const handleResize = () => {
    setViewportSize({ width: window.innerWidth, height: window.innerHeight });
  };

  useEffect(() => {
    setViewportSize({ width: window.innerWidth, height: window.innerHeight });

    const positions = platformIcons.map(() => ({
      // Random position for left (0-40%) or right (60-100%)
      x: Math.random() < 0.5 ? Math.random() * 40 : 60 + Math.random() * 40,
      y: Math.random() * 60, // Random vertical position between 0% and 60%
    }));

    setIconPositions(positions);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const fixedIconPositions = [
    { x: -10, y: 35 },
    { x: 40, y: 30 },
    { x: -20, y: 70 },
    { x: 20, y: 75 },
  ];

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background overflow-x-hidden">
      {/* Hero Section */}
      <section className="h-screen flex flex-col items-center justify-center relative">
  <h1 className="text-6xl font-bold text-foreground mb-8">
    &lt;kode-karo/&gt;
  </h1>
  <Button
    onClick={handleSignInClick}
    className="px-8 py-3 transition-colors text-lg
      bg-black text-white hover:bg-gray-800 
      dark:bg-white dark:text-black dark:hover:bg-gray-300"
  >
    Get Started
  </Button>

  {/* Platform Icons with Fixed Random Positions */}
  {platformIcons.map((platform, index) => (
    <motion.div
      key={platform.alt}
      className="hidden lg:block w-12 h-12 absolute transform drop-shadow-[0_16px_24px_rgba(0,0,0,0.35)]"
      style={{
        left: `${(viewportSize.width * fixedIconPositions[index]?.x) / 100}px`,
        top: `${(viewportSize.height * fixedIconPositions[index]?.y) / 100}px`,
        transform: `rotate(${platform.rotate}deg)`,
        x: mousePosition.x * 0.02,
        y: mousePosition.y * 0.02,
      }}
      variants={floatingVariant}
      initial="initial"
      animate="animate"
    >
      <Image src={platform.icon} alt="platform" className="w-full h-full" />
    </motion.div>
  ))}
</section>


      {/* Features Sections */}
      <section className="min-h-screen flex items-center justify-center w-full">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="text-center md:text-left">
              <h2 className="text-4xl font-bold mb-4">
                Track your progress easily
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Monitor your competitive programming journey with detailed
                analytics and insights.
              </p>
            </div>
            <WobbleCard>
              <div className="relative h-64 rounded-lg">
                <Card>
                  <CardHeader>
                    <CardTitle>Leetcode</CardTitle>
                    <CardDescription>Rating 1690</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig}>
                      <LineChart
                        accessibilityLayer
                        data={chartData}
                        margin={{
                          left: 12,
                          right: 12,
                        }}
                      >
                        <CartesianGrid vertical={false} />
                        <XAxis
                          dataKey="month"
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          tickFormatter={(value) => value.slice(0, 3)}
                        />
                        <ChartTooltip
                          cursor={false}
                          content={<ChartTooltipContent hideLabel />}
                        />
                        <Line
                          dataKey="desktop"
                          type="linear"
                          stroke="var(--color-desktop)"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ChartContainer>
                  </CardContent>
                </Card>
              </div>
            </WobbleCard>
          </div>
        </div>
      </section>

      <section className="min-h-screen flex items-center justify-center w-full">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="relative h-64  rounded-lg order-2 md:order-1">
              {/* <PinContainer title="Bookmarked!" className="z-[-1000]"> */}
              <WobbleCard containerClassName="bg-pink-800">
                <Card className="p-4 w-[350px] sm:w-[400px] md:w-[450px] lg:w-[500px] shadow-none group">
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <a
                        href="https://leetcode.com/contest/biweekly-contest-99/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xl font-bold hover:underline"
                      >
                        Biweekly Contest 99
                      </a>
                      <span>
                        <FaBookmark className="hidden group-hover:block text-black dark:text-white cursor-pointer" />
                        <FaRegBookmark className="block group-hover:hidden text-gray-500 dark:text-gray-400 cursor-pointer" />
                      </span>
                    </div>
                    <p>Rank: 1234</p>
                    <p>Rating: 1900</p>
                    <p>Problems Solved: 3/4</p>
                    <p>Date: 03/18/2025, 10:00 AM</p>
                    <div className="mt-4">
                      <h3 className="font-bold text-lg">Related Videos:</h3>
                      <a
                        href="https://youtube.com/watch?v=example3"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        Full Contest Walkthrough
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </WobbleCard>

              {/* </PinContainer> */}
            </div>
            <div className="text-center md:text-left order-1 md:order-2">
              <h2 className="text-4xl font-bold mb-4">
                Bookmark your fav contests
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Never miss your favorite contests with our easy-to-use
                bookmarking system.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="min-h-screen flex items-center justify-center w-full">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="text-center md:text-left">
              <h2 className="text-4xl font-bold mb-4">
                Find video solutions easily from TLE ELIMINATORs
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Access high-quality video solutions from expert competitive
                programmers.
              </p>
            </div>
            <div className="p-4 border rounded-3xl dark:bg-neutral-900 bg-neutral-100  border-neutral-200 dark:border-neutral-800 px-4">
              <Compare
                firstImage={tlecode.src}
                secondImage={notlecode.src}
                firstImageClassName="object-cover object-left-top transform scale-70"
                secondImageClassname="object-cover object-left-top transform scale-93"
                className="h-[250px] w-[200px] md:h-[500px] md:w-[500px]"
                slideMode="hover"
                autoplay={true}
              />
            </div>
          </div>
        </div>
      </section>
      <section className="min-h-screen flex items-center justify-center w-full">
  <div className="container mx-auto px-4 py-16">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
      <a
        href="https://github.com/mayur1377/kode-karo"
        target="_blank"
        rel="noopener noreferrer"
        className="block"
      >
        <WobbleCard>
          <div className="relative h-64 rounded-lg">
            <Card>
              <CardHeader>
                <CardTitle>Contribute Now</CardTitle>
                <CardDescription>
                  Open Source is for Everyone
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-full">
                <Image
                  src={ghcat}
                  alt="GitHub Octocat"
                  className="w-32 h-32"
                />
                </div>
              </CardContent>
            </Card>
          </div>
        </WobbleCard>
      </a>

      {/* Text Content */}
      <div className="text-center md:text-left">
        <h2 className="text-4xl font-bold mb-4">
          Open Source Contribution
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
          Feel free to contribute and enhance this platform! Your
          creativity and skills can help improve the experience for
          everyone.
        </p>
      </div>
    </div>
  </div>
</section>

    </div>
  );
};

export default ShowHome;
