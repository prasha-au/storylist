import React, { useState, useRef, useEffect } from "react";


interface StoryData {
  sentences: string[];
  image?: string;
  voice?: string;
}

interface StoryPlayerProps {
  story: StoryData;
  onClose: () => void;
}

const StoryPlayer: React.FC<StoryPlayerProps> = ({ story, onClose }) => {
  const [idx, setIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const handlePlay = () => {
    if (isPlaying) {
      speechSynthesis.pause();
      setIsPlaying(false);
    } else {
      if (speechSynthesis.paused) {
        speechSynthesis.resume();
        setIsPlaying(true);
      } else {
        const utterance = new SpeechSynthesisUtterance(story.sentences[idx]);
        utterance.lang = 'en-AU';
        utterance.onend = () => setIsPlaying(false);
        utteranceRef.current = utterance;
        speechSynthesis.speak(utterance);
        setIsPlaying(true);
      }
    }
  };

  const handleImageClick = () => {
    if (idx < 3) {
      setIdx(idx + 1);
    } else {
      onClose();
    }
  };

  useEffect(() => {
    if (utteranceRef.current) {
      speechSynthesis.cancel();
      setIsPlaying(false);
    }
  }, [idx]);

  useEffect(() => {
    return () => {
      speechSynthesis.cancel();
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.2)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl relative flex flex-col items-center justify-center overflow-auto max-w-3xl"
        style={{ maxHeight: '95vh', padding: 0 }}
        onClick={e => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl font-bold z-10"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <div className="flex flex-col items-center justify-start w-full p-8 box-border">
          {story.image && (
            <div
              className="rounded-xl border border-gray-300 shadow select-none cursor-pointer mb-6 relative"
              style={{
                width: '512px',
                height: '512px',
                maxWidth: '90vw',
                maxHeight: '90vw',
                backgroundImage: `url(${story.image})`,
                backgroundSize: '200% 200%',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: `${(idx % 2) * 100}% ${Math.floor(idx / 2) * 100}%`,
                backgroundColor: '#f3f3f3'
              }}
              onClick={handleImageClick}
            >
              {idx > 0 && (
                <button
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white/90 rounded-full shadow p-2 text-2xl font-bold z-20 border border-gray-300"
                  style={{ minWidth: 44, minHeight: 44 }}
                  onClick={e => { e.stopPropagation(); setIdx(idx - 1); }}
                  aria-label="Previous"
                >
                  ◀
                </button>
              )}
              {idx < 3 && (
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white/90 rounded-full shadow p-2 text-2xl font-bold z-20 border border-gray-300"
                  style={{ minWidth: 44, minHeight: 44 }}
                  onClick={e => { e.stopPropagation(); setIdx(idx + 1); }}
                  aria-label="Next"
                >
                  ▶
                </button>
              )}
            </div>
          )}
          {story.sentences && story.sentences.length > idx && (
            <div className="text-gray-700 text-lg text-center w-full max-w-full break-words mt-4 flex items-center justify-center gap-2">
              <span className="italic">{story.sentences[idx]}</span>
                            {story.sentences && story.sentences.length > 0 && (
                <button
                  className="ml-2 p-0 rounded border-none bg-transparent text-3xl text-gray-700 hover:text-black focus:outline-none cursor-pointer"
                  style={{ width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  onClick={handlePlay}
                  aria-label={isPlaying ? "Pause narration" : "Play narration"}
                  title={isPlaying ? "Pause narration" : "Play narration"}
                >
                  {isPlaying ? '\u23F8' : '▶'}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StoryPlayer;
