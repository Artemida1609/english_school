// src/components/YoutubePlayer.tsx
import { useState, useRef, useEffect, useCallback } from "react";

// ── YouTube IFrame API types ──────────────────────────────────────────────────
interface YTPlayerVars {
  autoplay?: 0 | 1;
  controls?: 0 | 1;
  rel?: 0 | 1;
  modestbranding?: 0 | 1;
  fs?: 0 | 1;
  iv_load_policy?: 1 | 3;
  disablekb?: 0 | 1;
  enablejsapi?: 0 | 1;
}

interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  setVolume(volume: number): void;
  unMute(): void;
  mute(): void;
  setPlaybackRate(rate: number): void;
  setPlaybackQuality(quality: string): void;
  getCurrentTime(): number;
  getDuration(): number;
  destroy(): void;
}

interface YTEvent {
  target: YTPlayer;
  data: number;
}

interface YTPlayerOptions {
  videoId: string;
  playerVars?: YTPlayerVars;
  events?: {
    onReady?: (e: YTEvent) => void;
    onStateChange?: (e: YTEvent) => void;
  };
}

declare global {
  interface Window {
    YT: {
      Player: new (elementId: string, options: YTPlayerOptions) => YTPlayer;
      PlayerState: {
        PLAYING: number;
        PAUSED: number;
        ENDED: number;
        BUFFERING: number;
      };
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

// ── Component types ───────────────────────────────────────────────────────────
interface YoutubePlayerProps {
  videoId: string;
  title: string;
}

type Quality = "1080p" | "720p" | "480p" | "360p" | "Auto";
type Speed = 0.5 | 0.75 | 1 | 1.25 | 1.5 | 2;

const QUALITY_MAP: Record<Quality, string> = {
  "1080p": "hd1080",
  "720p": "hd720",
  "480p": "large",
  "360p": "medium",
  Auto: "default",
};

// ── YoutubePlayer ─────────────────────────────────────────────────────────────
export const YoutubePlayer = ({ videoId, title }: YoutubePlayerProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const hideControlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // ref instead of state — avoids calling setState synchronously inside useEffect
  const apiReadyRef = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const [isEnded, setIsEnded] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsPanel, setSettingsPanel] = useState<"main" | "quality" | "speed">("main");
  const [quality, setQuality] = useState<Quality>("1080p");
  const [speed, setSpeed] = useState<Speed>(1);

  // ── Load YouTube IFrame API ───────────────────────────────────────────────
  // We never call setState here — apiReadyRef is a plain ref.
  useEffect(() => {
    if (window.YT?.Player) {
      apiReadyRef.current = true;
      return;
    }
    window.onYouTubeIframeAPIReady = () => {
      apiReadyRef.current = true;
    };
    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }
  }, []);

  // ── Init player after user clicks play ───────────────────────────────────
  const buildPlayer = useCallback(() => {
    if (playerRef.current) return;

    playerRef.current = new window.YT.Player("yt-player-iframe", {
      videoId,
      playerVars: {
        autoplay: 1,
        controls: 0,
        rel: 0,
        modestbranding: 1,
        fs: 0,
        iv_load_policy: 3,
        disablekb: 1,
        enablejsapi: 1,
      },
      events: {
        onReady: (e: YTEvent) => {
          e.target.setVolume(volume);
          e.target.setPlaybackRate(speed);
          setDuration(e.target.getDuration());
        },
        onStateChange: (e: YTEvent) => {
          const state = e.data;
          const playing = state === window.YT.PlayerState.PLAYING;
          const paused  = state === window.YT.PlayerState.PAUSED;
          const ended   = state === window.YT.PlayerState.ENDED;
          setIsPlaying(playing);
          setIsPaused(paused);
          if (ended) {
            setIsEnded(true);
          } else if (playing) {
            setIsEnded(false);
            setDuration(e.target.getDuration());
          }
        },
      },
    });
  }, [videoId, volume, speed]);

  useEffect(() => {
    if (!isStarted) return;

    // Small delay so React renders the iframe div before YT.Player targets it
    const buildTimer = setTimeout(() => {
      if (apiReadyRef.current) {
        buildPlayer();
      } else {
        // API not yet loaded — patch the callback so it builds after load
        const originalCallback = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
          originalCallback?.();
          buildPlayer();
        };
      }
    }, 50);

    const pollInterval = setInterval(() => {
      if (playerRef.current?.getCurrentTime) {
        setCurrentTime(playerRef.current.getCurrentTime());
      }
    }, 500);

    return () => {
      clearTimeout(buildTimer);
      clearInterval(pollInterval);
    };
  }, [isStarted, buildPlayer]);

  // ── Player controls ───────────────────────────────────────────────────────
  const togglePlay = useCallback(() => {
    if (!playerRef.current) return;
    if (isPlaying) playerRef.current.pauseVideo();
    else playerRef.current.playVideo();
  }, [isPlaying]);

  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!progressRef.current || !playerRef.current || !duration) return;
      const rect = progressRef.current.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      playerRef.current.seekTo(ratio * duration, true);
      setCurrentTime(ratio * duration);
    },
    [duration]
  );

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value);
    setVolume(v);
    playerRef.current?.setVolume(v);
    setIsMuted(v === 0);
  }, []);

  const toggleMute = useCallback(() => {
    if (!playerRef.current) return;
    if (isMuted) {
      playerRef.current.unMute();
      playerRef.current.setVolume(volume || 50);
      setIsMuted(false);
    } else {
      playerRef.current.mute();
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  const applySpeed = useCallback((s: Speed) => {
    setSpeed(s);
    playerRef.current?.setPlaybackRate(s);
    setShowSettings(false);
  }, []);

  const applyQuality = useCallback((q: Quality) => {
    setQuality(q);
    playerRef.current?.setPlaybackQuality(QUALITY_MAP[q]);
    setShowSettings(false);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    hideControlsTimer.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 2500);
  }, [isPlaying]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const progress = duration ? (currentTime / duration) * 100 : 0;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-video bg-[#1a1a2e] rounded-2xl overflow-hidden select-none"
      style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace" }}
      onMouseMove={resetControlsTimer}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap');
        .yt-vol-slider { -webkit-appearance: none; height: 3px; border-radius: 2px; background: rgba(255,255,255,0.2); outline: none; }
        .yt-vol-slider::-webkit-slider-thumb { -webkit-appearance: none; width: 12px; height: 12px; border-radius: 50%; background: #fff; cursor: pointer; }
        .yt-settings-panel { animation: fadeUp 0.15s ease; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* ── THUMBNAIL ── */}
      {!isStarted && (
        <div
          className="absolute inset-0 cursor-pointer z-10 group"
          onClick={() => setIsStarted(true)}
        >
          <img
            src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
            alt={title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/30" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative flex items-center justify-center w-20 h-20 rounded-full
              bg-[#1a1a2e]/80 border border-white/20 backdrop-blur-sm
              group-hover:bg-[#22c55e]/90 group-hover:border-[#22c55e]
              transition-all duration-300 shadow-2xl">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M6 4l14 8-14 8V4z" fill="white" />
              </svg>
              <div className="absolute inset-0 rounded-full border border-white/10 scale-125 opacity-0
                group-hover:opacity-100 group-hover:scale-150 transition-all duration-500" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#22c55e] font-semibold tracking-widest uppercase
                bg-[#22c55e]/10 border border-[#22c55e]/30 rounded px-2 py-0.5">VIDEO</span>
              <p className="text-white/90 text-sm font-medium truncate">{title}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── YOUTUBE IFRAME ── */}
      {isStarted && (
        <div id="yt-player-iframe" className="absolute inset-0 w-full h-full" />
      )}

      {/*
        ── PAUSE / IDLE BLOCKING OVERLAY ──
        When paused (or buffering), YouTube renders its own UI (related videos,
        info cards, logo) inside the iframe. Since the iframe is a cross-origin
        document we cannot suppress that via CSS. The only reliable fix is to
        cover the iframe with a solid overlay when we are NOT actively playing.
        The overlay is fully transparent (pointer-events: auto) so our controls
        still receive clicks — the YouTube iframe simply can't be seen or clicked.
      */}
      {isStarted && !isEnded && (isPaused || !isPlaying) && (
        <div
          className="absolute inset-0 z-10"
          style={{ pointerEvents: "none" }}
        >
          {/* Show blurred thumbnail as "freeze frame" when paused */}
          <img
            src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
            alt=""
            className="w-full h-full object-cover"
            style={{ filter: "brightness(0.55)" }}
          />
        </div>
      )}

      {/* ── ENDSCREEN — fully replaces YouTube's related-video panel ── */}
      {isStarted && isEnded && (
        <div className="absolute inset-0 z-10 bg-[#0f0f1a]/95 flex flex-col items-center justify-center gap-5">
          <p className="text-white/40 text-xs tracking-widest uppercase">Відео завершено</p>
          <button
            className="flex items-center gap-3 px-6 py-3 rounded-xl
              bg-[#22c55e]/10 border border-[#22c55e]/40 text-[#22c55e] text-sm font-semibold
              hover:bg-[#22c55e]/20 transition-colors"
            onClick={() => {
              setIsEnded(false);
              setIsPaused(false);
              playerRef.current?.seekTo(0, true);
              playerRef.current?.playVideo();
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 4l14 8-14 8V4z" />
            </svg>
            Переглянути знову
          </button>
        </div>
      )}

      {/* ── CLICK OVERLAY (play/pause + double-click fullscreen) ── */}
      {isStarted && !isEnded && (
        <div
          className="absolute inset-0 z-20 cursor-pointer"
          style={{ background: "transparent" }}
          onClick={togglePlay}
          onDoubleClick={toggleFullscreen}
        />
      )}

      {/* ── CONTROLS BAR ── */}
      {isStarted && !isEnded && (
        <div
          className="absolute bottom-0 left-0 right-0 z-30 transition-all duration-300"
          style={{ opacity: showControls ? 1 : 0, pointerEvents: showControls ? "auto" : "none" }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />
          <div className="relative px-4 pb-3 pt-8">

            {/* Progress bar */}
            <div
              ref={progressRef}
              className="relative w-full h-1 bg-white/20 rounded-full mb-3 cursor-pointer group/prog"
              onClick={handleSeek}
            >
              <div className="absolute top-0 left-0 h-full bg-white/10 rounded-full"
                style={{ width: `${Math.min(progress + 15, 100)}%` }} />
              <div className="absolute top-0 left-0 h-full bg-[#22c55e] rounded-full transition-all duration-200"
                style={{ width: `${progress}%` }} />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md
                  opacity-0 group-hover/prog:opacity-100 transition-opacity"
                style={{ left: `calc(${progress}% - 6px)` }}
              />
            </div>

            <div className="flex items-center justify-between gap-3">

              {/* LEFT: play + volume + time */}
              <div className="flex items-center gap-3">
                <button
                  className="text-white hover:text-[#22c55e] transition-colors p-1"
                  onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                >
                  {isPlaying ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16" rx="1" />
                      <rect x="14" y="4" width="4" height="16" rx="1" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M6 4l14 8-14 8V4z" />
                    </svg>
                  )}
                </button>

                <div className="flex items-center gap-2 group/vol" onClick={(e) => e.stopPropagation()}>
                  <button className="text-white/70 hover:text-white transition-colors" onClick={toggleMute}>
                    {isMuted || volume === 0 ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor" stroke="none" />
                        <line x1="23" y1="9" x2="17" y2="15" />
                        <line x1="17" y1="9" x2="23" y2="15" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor" stroke="none" />
                        <path d="M15.54 8.46a5 5 0 010 7.07M19.07 4.93a10 10 0 010 14.14" strokeLinecap="round" />
                      </svg>
                    )}
                  </button>
                  <input
                    type="range" min={0} max={100}
                    value={isMuted ? 0 : volume}
                    onChange={handleVolumeChange}
                    className="yt-vol-slider w-16 opacity-0 group-hover/vol:opacity-100 transition-opacity"
                    style={{
                      background: `linear-gradient(to right, #22c55e ${isMuted ? 0 : volume}%, rgba(255,255,255,0.2) ${isMuted ? 0 : volume}%)`
                    }}
                  />
                </div>

                <span className="text-white/60 text-xs tabular-nums">
                  {formatTime(currentTime)}
                  <span className="text-white/30 mx-1">/</span>
                  {formatTime(duration)}
                </span>
              </div>

              {/* RIGHT: settings + fullscreen */}
              <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <div className="relative">
                  <button
                    className="text-white/70 hover:text-white transition-colors p-1"
                    onClick={() => { setShowSettings((v) => !v); setSettingsPanel("main"); }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
                    </svg>
                  </button>

                  {showSettings && (
                    <div className="yt-settings-panel absolute bottom-9 right-0
                      bg-[#1e1e2e]/95 backdrop-blur-md border border-white/10
                      rounded-xl overflow-hidden shadow-2xl min-w-[200px]">

                      {settingsPanel === "main" && (
                        <>
                          <button
                            className="w-full flex items-center justify-between px-4 py-3
                              hover:bg-white/5 transition-colors text-sm text-white/80 hover:text-white"
                            onClick={() => setSettingsPanel("quality")}
                          >
                            <span className="text-white/50 mr-3">Quality</span>
                            <div className="flex items-center gap-2 text-white font-medium">
                              {quality}
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 18l6-6-6-6" />
                              </svg>
                            </div>
                          </button>
                          <div className="h-px bg-white/5" />
                          <button
                            className="w-full flex items-center justify-between px-4 py-3
                              hover:bg-white/5 transition-colors text-sm text-white/80 hover:text-white"
                            onClick={() => setSettingsPanel("speed")}
                          >
                            <span className="text-white/50 mr-3">Speed</span>
                            <div className="flex items-center gap-2 text-white font-medium">
                              {speed === 1 ? "Normal" : `${speed}x`}
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 18l6-6-6-6" />
                              </svg>
                            </div>
                          </button>
                        </>
                      )}

                      {settingsPanel === "quality" && (
                        <>
                          <button
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-white/50
                              hover:text-white hover:bg-white/5 transition-colors text-xs border-b border-white/5"
                            onClick={() => setSettingsPanel("main")}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M15 18l-6-6 6-6" />
                            </svg>
                            Quality
                          </button>
                          {(["Auto", "1080p", "720p", "480p", "360p"] as Quality[]).map((q) => (
                            <button
                              key={q}
                              className={`w-full flex items-center justify-between px-4 py-2.5 text-sm
                                hover:bg-white/5 transition-colors
                                ${quality === q ? "text-[#22c55e]" : "text-white/80"}`}
                              onClick={() => applyQuality(q)}
                            >
                              {q}
                              {quality === q && (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <path d="M20 6L9 17l-5-5" />
                                </svg>
                              )}
                            </button>
                          ))}
                        </>
                      )}

                      {settingsPanel === "speed" && (
                        <>
                          <button
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-white/50
                              hover:text-white hover:bg-white/5 transition-colors text-xs border-b border-white/5"
                            onClick={() => setSettingsPanel("main")}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M15 18l-6-6 6-6" />
                            </svg>
                            Speed
                          </button>
                          {([0.5, 0.75, 1, 1.25, 1.5, 2] as Speed[]).map((s) => (
                            <button
                              key={s}
                              className={`w-full flex items-center justify-between px-4 py-2.5 text-sm
                                hover:bg-white/5 transition-colors
                                ${speed === s ? "text-[#22c55e]" : "text-white/80"}`}
                              onClick={() => applySpeed(s)}
                            >
                              {s === 1 ? "Normal" : `${s}x`}
                              {speed === s && (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                  <path d="M20 6L9 17l-5-5" />
                                </svg>
                              )}
                            </button>
                          ))}
                        </>
                      )}
                    </div>
                  )}
                </div>

                <button
                  className="text-white/70 hover:text-white transition-colors p-1"
                  onClick={toggleFullscreen}
                >
                  {isFullscreen ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};