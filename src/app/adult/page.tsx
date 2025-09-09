"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

import { getChecklist, setChecklist, removeStory } from "@/lib/indexeddb";
import { addStoryData } from "@/lib/story";
import ChildSettingsModal from "./ChildSettingsModal";
import GeminiApiKeyModal from "./GeminiApiKeyModal";


const DEFAULT_STORY_ID = 'defaultstory';

export default function AdultChecklistPage() {
  const [items, setItems] = useState<string[] | null>(null);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [childSettingsOpen, setChildSettingsOpen] = useState(false);

  const openChildSettings = async () => {
    setChildSettingsOpen(true);
  };


  useEffect(() => {
    (async () => {
      const dbItems = await getChecklist(DEFAULT_STORY_ID);
      setItems(dbItems ? dbItems.map(v => v.text) : []);
    })();
  }, []);

  async function saveToDb() {
    if (items !== null) {
      setIsGenerating(true);
      const checklist = items.map(task => ({
        text: task,
        completed: false,
      }));
      try {
        await setChecklist(DEFAULT_STORY_ID, checklist);
        await removeStory(DEFAULT_STORY_ID);
        await addStoryData(DEFAULT_STORY_ID);
      } finally {
        setIsGenerating(false);
      }
    }
  }

  function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !items) return;
    setItems([
      ...items,
      input.trim(),
    ]);
    setInput("");
  }

  function removeItem(text: string) {
    if (!items) return;
    setItems(items.filter((item) => item !== text));
  }

  if (items === null) {
    return null;
  }

  return (
    <main className="w-full p-6 min-h-screen flex flex-col items-center bg-gradient-to-br from-purple-100 via-pink-50 to-orange-100">
      <div className="w-full max-w-5xl mx-auto">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-xl border-4 border-purple-200">
        <div className="text-center mb-6 flex flex-row items-center justify-center gap-4">
          <div className="text-4xl">👨‍👩‍👧‍👦</div>
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-purple-700">Checklist Setup</h1>
            <p className="text-gray-600 text-sm">Create fun tasks for your little one!</p>
          </div>
        </div>

        <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-xl flex flex-col items-center">
          <div className="flex flex-row gap-4 w-full justify-center mb-2">
            <button
              className="px-4 py-2 rounded-full bg-purple-100 hover:bg-purple-200 text-purple-700 font-semibold border border-purple-200 text-base"
              onClick={openChildSettings}
              type="button"
            >
              🧒 Child Settings
            </button>
            <button
              className="px-4 py-2 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold border border-blue-200 text-base"
              onClick={() => setApiKeyModalOpen(true)}
              type="button"
            >
              🔑 Set Gemini API Key
            </button>
          </div>
          <div className="mt-2 text-sm text-red-600 font-semibold text-center">
            ⚠️ Do not enter sensitive information on public or shared computers.
          </div>
        </div>

        <form onSubmit={addItem} className="flex gap-3 mb-6">
          <input
            className="flex-1 border-2 border-purple-200 rounded-full px-4 py-3 text-lg text-gray-800 bg-white focus:border-purple-400 focus:outline-none placeholder-gray-500"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Add a fun task..."
          />
          <button
            type="submit"
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full font-semibold hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
          >
            ➕ Add
          </button>
        </form>

        <ul className="space-y-3">
          {items.map((item, idx) => (
            <li
              key={idx}
              className="bg-gradient-to-r from-blue-100 to-gray-100 border-blue-200 flex items-center gap-3 p-4 rounded-2xl border-2"
            >
              <span className="text-xl">⭐</span>
              <span className="flex-1 text-lg font-medium text-gray-800">{item}</span>
              <button
                onClick={() => removeItem(item)}
                className="text-red-500 hover:text-red-700 hover:bg-red-100 px-3 py-1 rounded-full font-semibold transition-all duration-200"
                aria-label="Remove"
              >
                🗑️ Remove
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-col items-center gap-4">
          <button
            onClick={saveToDb}
            disabled={isGenerating}
            className="bg-gradient-to-r from-purple-400 to-pink-400 text-white px-6 py-3 rounded-full text-lg font-semibold hover:from-purple-500 hover:to-pink-500 transform hover:scale-105 transition-all duration-200 shadow-lg cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isGenerating ? 'Generating...' : '💎 Generate Story'}
          </button>
          {items.length > 0 && (
            <Link
              href="/"
              className="bg-gradient-to-r from-green-400 to-blue-500 text-white px-6 py-3 rounded-full text-lg font-semibold hover:from-green-500 hover:to-blue-600 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              🎉 View Checklist
            </Link>
          )}
        </div>
      </div>

      <ChildSettingsModal open={childSettingsOpen} onClose={() => setChildSettingsOpen(false)} />
      <GeminiApiKeyModal open={apiKeyModalOpen} onClose={() => setApiKeyModalOpen(false)} />

      {isGenerating && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center gap-4">
            <div className="text-4xl animate-spin">⏳</div>
            <p className="text-xl font-semibold text-gray-700">Generating your story...</p>
            <p className="text-sm text-gray-500">This may take a moment</p>
          </div>
        </div>
      )}

      </div>
    </main>
  );
}
