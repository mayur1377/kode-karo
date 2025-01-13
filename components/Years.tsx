import React from "react";
import dayjs from "dayjs";
import dayOfYear from "dayjs/plugin/dayOfYear";

dayjs.extend(dayOfYear);

export default function Year() {
  const currentYear = dayjs().year();
  const currentDay = dayjs().dayOfYear();
  const daysInYear = dayjs(`${currentYear}-12-31`).dayOfYear(); // Total days in the year

  // Generate an array for all the days in the year
  const daysArray = Array.from({ length: daysInYear }, (_, index) => index + 1);

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-2xl font-bold mb-8 yourfont text-white tracking-[0.25em]">{currentYear}</h1>
      <div className="grid grid-cols-12 gap-1">
        {daysArray.map((day) => {
          const date = dayjs(`${currentYear}-${day}`);
          return (
            <div
              key={day}
              className={`w-4 h-4 rounded-sm ${
                day < currentDay
                  ? "bg-gray-400" // Past days
                  : day === currentDay
                  ? "bg-yellow-500 animate-pulse" // Current day
                  : "bg-gray-200" // Future days
              }`}
              title={date.format("MMMM D, YYYY")} // Tooltip with full date
            ></div>
          );
        })}
      </div>
    </div>
  );
}
