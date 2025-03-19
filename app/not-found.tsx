import Link from "next/link";
import { Button } from "./components/ui/button";

export default function NotFound() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <p className="text-2xl font-mono text-muted-foreground">
          ArrayIndexOutOfBoundsException
        </p>
        <p className="text-lg text-muted-foreground">
          Looks like you&#39;re trying to access an element that doesn&#39;t
          exist
        </p>
        <div className="pt-4">
          <Link href="/">
            <Button>Return to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
