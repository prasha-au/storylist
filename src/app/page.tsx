"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getChecklist, getStory } from "../lib/indexeddb";
import { ChecklistItems, Story } from "../lib/schemas";
import { addContentToIndex } from '../lib/story';
import StoryPlayer from "./StoryPlayer";

const DEFAULT_STORY_ID = 'defaultstory';

export default function Home() {
  const [checklist, setChecklist] = useState<ChecklistItems | null>(null);
  const [story, setStory] = useState<Story | null>(null);
  const [playerIdx, setPlayerIdx] = useState<number | null>(null);
  const [generatingIdxs, setGeneratingIdxs] = useState<Set<number>>(new Set());

  useEffect(() => {
    (async () => {
      const checklistData = await getChecklist(DEFAULT_STORY_ID);
      const storyData = await getStory(DEFAULT_STORY_ID);
      setChecklist(checklistData ?? []);
      setStory(storyData ?? []);
    })();
  }, []);


  const tryGenerateMedia = async (idx: number) => {
    if (!checklist || !story || generatingIdxs.has(idx) || story[idx]?.image) return;
    setGeneratingIdxs(prev => new Set(prev).add(idx));
    await addContentToIndex(DEFAULT_STORY_ID, idx);
    const updatedStory = await getStory(DEFAULT_STORY_ID);
    setStory(updatedStory ?? []);
    setGeneratingIdxs(prev => {
      const next = new Set(prev);
      next.delete(idx);
      return next;
    });
  };

  const toggleItem = async (idx: number) => {
    if (!checklist) return;
    const updatedChecklist = checklist.map((item, i) =>
      i === idx ? { ...item, completed: !item.completed } : item
    );
    setChecklist(updatedChecklist);
    await setChecklist(updatedChecklist);

    const promises = [];
    promises.push(tryGenerateMedia(idx));
    if (idx + 1 < updatedChecklist.length) {
      promises.push(tryGenerateMedia(idx + 1));
    }
    await Promise.allSettled(promises);
  };

  if (checklist === null) {
    return null;
  }

  return (
    <main className="w-full p-6 min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100">
      <div className="w-full max-w-5xl mx-auto">
        {playerIdx !== null && story && story[playerIdx] && story[playerIdx].image && (
          <StoryPlayer
            story={{ sentences: story[playerIdx].sentences || [], image: story[playerIdx].image, voice: story[playerIdx].voice }}
            onClose={() => setPlayerIdx(null)}
          />
        )}
        {checklist.length === 0 ? (
          <div className="flex flex-col items-center gap-6 bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border-4 border-yellow-200">
            <div className="text-6xl">🌟</div>
            <p className="text-2xl font-bold text-purple-700 text-center">Time to make your checklist!</p>
            <Link
              href="/adult"
              className="bg-gradient-to-r from-pink-400 to-purple-500 text-white px-8 py-4 rounded-full text-xl font-bold hover:from-pink-500 hover:to-purple-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              ✨ Setup Checklist ✨
            </Link>
          </div>
        ) : (
          <div className="w-full">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold text-purple-700 mb-2 flex items-center justify-center gap-3">
                <span className="text-4xl">🎯</span>
                Today's Adventures!
              </h1>
            </div>
            <ul className="space-y-4">
              {checklist.map((item, idx) => {
                const storyItem = story?.[idx];
                const hasMedia = !!storyItem?.image;
                return (
                  <li
                    key={idx}
                    className={`
                      bg-gray-100 border-gray-300
                      rounded-2xl p-4 text-xl font-semibold text-gray-800 shadow-lg border-3 transition-all duration-200
                    `}
                  >
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => toggleItem(idx)}
                        className={`
                          w-8 h-8 rounded-full border-3 flex items-center justify-center text-2xl transition-all duration-200
                          ${item.completed
                            ? 'bg-green-400 border-green-500 text-white'
                            : 'bg-white border-purple-400 hover:bg-purple-50'
                          }
                        `}
                      >
                        {item.completed ? '✓' : ''}
                      </button>
                      <div className="text-2xl">⭐</div>
                      <span className={`flex-1 transition-opacity duration-200 ${item.completed ? 'text-gray-400 opacity-70' : ''}`}>{item.text}</span>
                      {item.completed && (
                        <button
                          className="ml-4 px-4 py-1 bg-blue-200 hover:bg-blue-300 rounded-full text-blue-800 text-sm font-semibold transition-all duration-200 flex items-center gap-2"
                          onClick={() => setPlayerIdx(idx)}
                          disabled={generatingIdxs.has(idx) || !hasMedia}
                        >
                          {!hasMedia ? (
                            <span className="animate-pulse">Generating..</span>
                          ) : (
                            'View Story'
                          )}
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="mt-8 text-center">
              <Link
                href="/adult"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-400 to-blue-500 text-white px-6 py-3 rounded-full text-lg font-semibold hover:from-indigo-500 hover:to-blue-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
              >
                🔧 Edit Checklist
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

