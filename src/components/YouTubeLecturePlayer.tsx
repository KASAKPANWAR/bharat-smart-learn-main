import { useEffect, useId, useRef } from "react";

type YouTubePlayer = {
  destroy: () => void;
};

type YouTubeApi = {
  Player: new (
    elementId: string,
    options: {
      videoId: string;
      width?: string;
      height?: string;
      playerVars?: Record<string, string | number | boolean>;
      events?: {
        onReady?: () => void;
        onStateChange?: (event: { data: number }) => void;
      };
    }
  ) => YouTubePlayer;
  PlayerState: {
    ENDED: number;
  };
};

declare global {
  interface Window {
    YT?: YouTubeApi;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let youtubeApiPromise: Promise<YouTubeApi> | null = null;

const loadYouTubeApi = () => {
  if (window.YT?.Player) {
    return Promise.resolve(window.YT);
  }

  if (!youtubeApiPromise) {
    youtubeApiPromise = new Promise<YouTubeApi>((resolve, reject) => {
      const existingScript = document.querySelector<HTMLScriptElement>("script[data-youtube-iframe-api='true']");

      window.onYouTubeIframeAPIReady = () => {
        if (window.YT) {
          resolve(window.YT);
        } else {
          reject(new Error("YouTube API failed to initialise."));
        }
      };

      if (!existingScript) {
        const script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";
        script.async = true;
        script.dataset.youtubeIframeApi = "true";
        script.onerror = () => reject(new Error("Unable to load the YouTube iframe API."));
        document.head.appendChild(script);
      }

      window.setTimeout(() => {
        if (!window.YT?.Player) {
          reject(new Error("Timed out while loading the YouTube iframe API."));
        }
      }, 8000);
    });
  }

  return youtubeApiPromise;
};

interface YouTubeLecturePlayerProps {
  videoId: string;
  title: string;
  autoPlay?: boolean;
  onEnded?: () => void;
}

const YouTubeLecturePlayer = ({ videoId, title, autoPlay = false, onEnded }: YouTubeLecturePlayerProps) => {
  const elementId = useId();
  const playerRef = useRef<YouTubePlayer | null>(null);

  useEffect(() => {
    let cancelled = false;

    const createPlayer = async () => {
      const YT = await loadYouTubeApi();

      if (cancelled) {
        return;
      }

      playerRef.current?.destroy();
      playerRef.current = new YT.Player(elementId, {
        videoId,
        width: "100%",
        height: "100%",
        playerVars: {
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          autoplay: autoPlay ? 1 : 0,
          origin: window.location.origin,
        },
        events: {
          onStateChange: (event) => {
            if (event.data === YT.PlayerState.ENDED) {
              onEnded?.();
            }
          },
        },
      });
    };

    void createPlayer();

    return () => {
      cancelled = true;
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [autoPlay, elementId, onEnded, videoId]);

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-border bg-black shadow-[var(--shadow-elevated)]">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-black/80 px-4 py-3 text-primary-foreground">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-primary-foreground/70">Lesson player</p>
          <p className="mt-1 text-sm font-semibold">{title}</p>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-primary-foreground/80">Embedded lesson</span>
      </div>
      <div className="aspect-video bg-black">
        <div id={elementId} aria-label={title} className="h-full w-full" />
      </div>
    </div>
  );
};

export default YouTubeLecturePlayer;