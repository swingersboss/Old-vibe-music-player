/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  SkipBack, 
  SkipForward, 
  FolderOpen, 
  Volume2,
  Music,
  Minus,
  Maximize,
  X,
  FileMusic,
  ListMusic
} from 'lucide-react';

interface Track {
  id: string;
  title: string;
  url: string;
  file?: File;
}

export default function App() {
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentTrack = currentTrackIndex !== null ? playlist[currentTrackIndex] : null;

  // Handle track changes
  useEffect(() => {
    if (audioRef.current && currentTrack) {
      audioRef.current.src = currentTrack.url;
      audioRef.current.load();
      if (isPlaying) {
        audioRef.current.play().catch(err => {
          console.error("Playback failed", err);
          setIsPlaying(false);
        });
      }
    }
  }, [currentTrackIndex]);

  // Handle global volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Handle files selected via input
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newTracks: Track[] = files.map(file => ({
      id: crypto.randomUUID(),
      title: file.name.replace(/\.[^/.]+$/, ""), // Strip extension
      url: URL.createObjectURL(file),
      file
    }));

    setPlaylist(prev => {
      const nextPlaylist = [...prev, ...newTracks];
      // Auto-play if it was empty before
      if (prev.length === 0 && newTracks.length > 0) {
        setCurrentTrackIndex(0);
        setIsPlaying(true);
      }
      return nextPlaylist;
    });
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePlayPause = () => {
    if (!audioRef.current || !currentTrack) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(err => console.error(err));
    }
  };

  const handleStop = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setIsPlaying(false);
  };

  const handleNext = () => {
    if (playlist.length === 0) return;
    const nextIdx = currentTrackIndex !== null ? (currentTrackIndex + 1) % playlist.length : 0;
    setCurrentTrackIndex(nextIdx);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    if (playlist.length === 0) return;
    const prevIdx = currentTrackIndex !== null 
      ? (currentTrackIndex - 1 + playlist.length) % playlist.length 
      : 0;
    setCurrentTrackIndex(prevIdx);
    setIsPlaying(true);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "00:00";
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Simulated visualizer bars for aesthetics
  const vizBars = Array.from({ length: 16 }).map((_, i) => {
    const height = isPlaying ? Math.random() * 80 + 10 : 5;
    return (
      <div 
        key={i} 
        className="w-1.5 bg-[#00ff00] transition-all duration-100 ease-linear"
        style={{ height: `${height}%`, opacity: isPlaying ? 0.8 : 0.3 }}
      />
    );
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Hidden Audio and File Elements */}
      <audio 
        ref={audioRef}
        onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onEnded={handleNext}
      />
      <input 
        type="file" 
        accept="audio/*" 
        multiple 
        className="hidden" 
        ref={fileInputRef}
        onChange={handleFileUpload}
      />

      {/* Main Window */}
      <div className="win95-outset w-full max-w-[420px] flex flex-col font-sans select-none shadow-xl">
        {/* Title Bar */}
        <div className="bg-[#000080] text-white px-1 py-0.5 flex items-center justify-between font-bold text-[13px] mx-[2px] mt-[2px]">
          <div className="flex items-center gap-1.5 ml-1">
            <Music size={14} /> 
            <span>Media Player 95</span>
          </div>
          <div className="flex gap-0.5">
            <button className="win95-outset bg-[#c0c0c0] w-4 h-4 flex items-center justify-center text-black font-bold focus:outline-none">
              <Minus size={12} strokeWidth={3} className="mt-1" />
            </button>
            <button className="win95-outset bg-[#c0c0c0] w-4 h-4 flex items-center justify-center text-black font-bold focus:outline-none">
              <Maximize size={10} strokeWidth={3} />
            </button>
            <button className="win95-outset bg-[#c0c0c0] w-4 h-4 flex items-center justify-center text-black font-bold focus:outline-none ml-1">
              <X size={12} strokeWidth={3} />
            </button>
          </div>
        </div>

        {/* Menu Bar */}
        <div className="flex text-black text-xs py-1 px-2 gap-4 border-b border-[#808080] mb-2 shadow-[0_1px_0_#ffffff]">
          <span className="cursor-pointer hover:bg-[#000080] hover:text-white px-1 -mx-1" onClick={() => fileInputRef.current?.click()}>
            <span className="underline">F</span>ile
          </span>
          <span className="cursor-default px-1 -mx-1">
            <span className="underline">E</span>dit
          </span>
          <span className="cursor-default px-1 -mx-1">
            <span className="underline">V</span>iew
          </span>
          <span className="cursor-default px-1 -mx-1">
            <span className="underline">H</span>elp
          </span>
        </div>

        {/* Player Body */}
        <div className="p-3 pt-1 flex flex-col gap-4">
          
          {/* Top Section: Display & Visualizer */}
          <div className="flex gap-3 h-[80px]">
            {/* Visualizer / Logo Block */}
            <div className="win95-inset w-[100px] bg-black flex items-end justify-center gap-[1px] p-1 pb-1.5 shrink-0 relative overflow-hidden">
              {vizBars}
              <div className="absolute top-1 left-1 text-[#00ff00] text-[10px] font-mono opacity-50">
                STEREO
              </div>
            </div>

            {/* Main LCD Display */}
            <div className="win95-inset flex-1 bg-black text-[#00ff00] font-mono p-2 flex flex-col justify-between overflow-hidden">
              <div className="text-xs truncate" title={currentTrack?.title || "No Media Loaded"}>
                {currentTrackIndex !== null ? `${(currentTrackIndex + 1).toString().padStart(2, '0')}. ${currentTrack?.title}` : "NO MEDIA LOADED"}
              </div>
              
              <div className="flex justify-between items-end">
                <div className="text-sm flex items-center gap-2">
                  <span className="bg-[#00ff00] text-black px-1 rounded-sm text-[10px] font-bold leading-tight">
                    {isPlaying ? "PLAY" : "STOP"}
                  </span>
                  <span>kbps 128</span>
                </div>
                <div className="text-2xl font-bold leading-none tracking-tighter">
                  {formatTime(progress)}
                </div>
              </div>
            </div>
          </div>

          {/* Scrubber */}
          <div className="flex items-center gap-2 px-1">
            <input 
              type="range" 
              min="0" 
              max={duration || 100} 
              value={progress}
              onChange={(e) => {
                const val = Number(e.target.value);
                setProgress(val);
                if (audioRef.current) audioRef.current.currentTime = val;
              }}
              disabled={!currentTrack}
              className="flex-1"
            />
          </div>

          {/* Controls & Volume */}
          <div className="flex items-center justify-between mt-1">
            <div className="flex gap-1.5">
              <button 
                onClick={handlePrev} 
                disabled={playlist.length === 0}
                className="win95-outset w-8 h-8 flex items-center justify-center text-black disabled:opacity-50 focus:outline-none"
                title="Previous"
              >
                <SkipBack size={14} className="fill-black" />
              </button>
              <button 
                onClick={handlePlayPause} 
                disabled={playlist.length === 0}
                className="win95-outset w-8 h-8 flex items-center justify-center text-black disabled:opacity-50 focus:outline-none"
                title="Play/Pause"
              >
                {isPlaying ? <Pause size={14} className="fill-black" /> : <Play size={14} className="fill-black" />}
              </button>
              <button 
                onClick={handleStop} 
                disabled={playlist.length === 0}
                className="win95-outset w-8 h-8 flex items-center justify-center text-black disabled:opacity-50 focus:outline-none"
                title="Stop"
              >
                <Square size={12} className="fill-black" />
              </button>
              <button 
                onClick={handleNext} 
                disabled={playlist.length === 0}
                className="win95-outset w-8 h-8 flex items-center justify-center text-black disabled:opacity-50 focus:outline-none"
                title="Next"
              >
                <SkipForward size={14} className="fill-black" />
              </button>
              <div className="w-2" /> {/* Spacer */}
              <button 
                onClick={() => fileInputRef.current?.click()} 
                className="win95-outset w-8 h-8 flex items-center justify-center text-black focus:outline-none"
                title="Open File"
              >
                <FolderOpen size={14} className="fill-black" />
              </button>
            </div>

            {/* Volume Control */}
            <div className="flex items-center gap-2 win95-inset px-2 py-1">
              <Volume2 size={14} className="text-black" />
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.01" 
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
                className="w-20"
              />
            </div>
          </div>

          <hr className="border-t-[#808080] border-b border-b-white my-1 mx-[-12px]" />

          {/* Playlist Section */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center text-xs font-bold px-1">
              <span>Playlist</span>
              <span className="text-[10px] bg-white border border-[#808080] px-1 shadow-[1px_1px_0_#ffffff]">
                {playlist.length} track(s)
              </span>
            </div>
            
            <div className="win95-inset h-[120px] overflow-y-auto bg-white p-1 text-sm">
              {playlist.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 gap-2 opacity-60 p-4 text-center">
                  <FileMusic size={32} />
                  <p className="text-xs">Click Eject or File &gt; Open to add MP3 files to your playlist.</p>
                </div>
              ) : (
                <ul className="flex flex-col">
                  {playlist.map((track, idx) => (
                    <li 
                      key={track.id}
                      onClick={() => {
                        setCurrentTrackIndex(idx);
                        setIsPlaying(true);
                      }}
                      className={`px-1 py-0.5 cursor-pointer flex gap-2 truncate select-none ${
                        currentTrackIndex === idx 
                          ? 'bg-[#000080] text-white border border-dotted border-white' 
                          : 'text-black hover:bg-gray-200 border border-transparent'
                      }`}
                    >
                      <span className="opacity-70 w-4 text-right shrink-0">{idx + 1}.</span>
                      <span className="truncate">{track.title}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            {/* Bottom Actions */}
            <div className="flex justify-between mt-1">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="win95-outset text-xs px-3 py-1 flex items-center gap-1 active:pt-[5px] active:pb-0"
              >
                <ListMusic size={12} /> Add Files
              </button>
              <button 
                onClick={() => {
                  setPlaylist([]);
                  setCurrentTrackIndex(null);
                  handleStop();
                }}
                disabled={playlist.length === 0}
                className="win95-outset text-xs px-3 py-1 disabled:opacity-50"
              >
                Clear
              </button>
            </div>
          </div>

        </div>
      </div>

      <div className="mt-8 text-white text-sm font-sans tracking-wide">
        Follow <a href="https://instagram.com/the_aadarshtiwari" target="_blank" rel="noopener noreferrer" className="underline font-bold hover:text-[#00ff00]">@the_aadarshtiwari</a> on Instagram
      </div>
    </div>
  );
}
