import React, { useState, useEffect } from "react";
import { setSetting, getSetting } from "@/lib/indexeddb";

interface GeminiApiKeyModalProps {
  open: boolean;
  onClose: () => void;
}

const GeminiApiKeyModal: React.FC<GeminiApiKeyModalProps> = ({ open, onClose }) => {
  const [apiKey, setApiKey] = useState<string>("");

  useEffect(() => {
    if (open) {
      (async () => {
        const saved = await getSetting<string>("GEMINI_API_KEY");
        setApiKey(saved || "");
      })();
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.2)" }}>
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-xl relative" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4 text-blue-700">Gemini API Key</h2>
        <form
          onSubmit={async e => {
            e.preventDefault();
            await setSetting("GEMINI_API_KEY", apiKey);
            onClose();
          }}
          className="flex flex-col gap-4"
        >
          <label className="flex flex-col gap-1">
            <input
              type="text"
              className="border rounded px-3 py-2 text-gray-900 bg-white"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder="Paste your Gemini API key here"
              autoFocus
            />
          </label>
          <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded font-semibold hover:bg-blue-600 mt-2">Save & Close</button>
        </form>
      </div>
    </div>
  );
};

export default GeminiApiKeyModal;
