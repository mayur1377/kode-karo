"use client";

import { useEffect } from "react";
import { Button } from "./components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-destructive">Oops!</h1>
        <p className="text-2xl font-mono text-muted-foreground">
          NullPointerException
        </p>
        <p className="text-lg text-muted-foreground">
          Something went wrong in our codebase
        </p>
        <div className="pt-4 space-x-4">
          <Button onClick={() => reset()}>Try Again</Button>
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/")}
          >
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}
