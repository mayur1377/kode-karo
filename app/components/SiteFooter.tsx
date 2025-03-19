"use client";

import { Github, Twitter } from "lucide-react"; // Icons for social media

export function SiteFooter() {
  return (
    <footer className="mt-20 order-t bg-gradient-to-b from-background to-muted/50 py-12">
      <div className="container mx-auto px-4">
        {/* Flex container for About and Social Media sections */}
        <div className="flex flex-col items-center justify-between gap-8 md:flex-row md:items-start">
          {/* About Section - Left */}
          <div className="w-full md:w-1/2 space-y-4 text-center md:text-left">
            <h3 className="text-lg font-semibold">About Us</h3>
            <p className="text-sm text-muted-foreground">
              We are a cutting-edge, world-class development team — and by
              &quot;team,&quot; I mean it&apos;s mostly me, tirelessly coding,
              designing, and brainstorming with a little help from my brilliant
              AI partners: ChatGPT, DeepSeek, Gork, Copilot, Cursor, and Pear
              AI. Together, we craft web experiences so polished, even
              perfection takes notes. Powered by creativity, innovation, and a
              whole lot of effort (and caffeine/OH, of course).
            </p>
          </div>

          <div className="space-y-4 text-center md:text-left">
            <h3 className="text-lg font-semibold">Follow me</h3>
            <div className="flex justify-center space-x-4 md:justify-start">
              <a
                href="https://github.com/mayur1377"
                className="text-muted-foreground hover:text-foreground"
                aria-label="GitHub"
              >
                <Github className="h-5 w-5" />
              </a>
              <a
                href="https://x.com/thisismayur1377"
                className="text-muted-foreground hover:text-foreground"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-12 border-t pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Built by{" "}
            <a
              href="https://shadcn.com"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              shadcn
            </a>
            . The source code is available on{" "}
            <a
              href="https://github.com/shadcn"
              target="_blank"
              rel="noreferrer"
              className="font-medium underline underline-offset-4"
            >
              GitHub
            </a>
            .
          </p>
        </div>
      </div>
    </footer>
  );
}
