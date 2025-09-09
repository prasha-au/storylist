import React, { useState, useEffect } from "react";
import { setSetting, getSetting } from "@/lib/indexeddb";
import { generateCharacterImage } from "@/lib/genai";


interface ChildSettingsModalProps {
  open: boolean;
  onClose: () => void;
}

const ChildSettingsModal: React.FC<ChildSettingsModalProps> = ({ open, onClose }) => {
  const [settings, setSettings] = useState<string>('');
  const [characterImg, setCharacterImg] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (open) {
      (async () => {
        const saved = await getSetting<string>('CHILD_DESCRIPTION');
        setSettings(saved || '');
        const img = await getSetting<string>('CHILD_RENDER');
        setCharacterImg(img);
      })();
    }
  }, [open]);

  if (!open) return null;

  const defaultText = `Name: John\nAge: 3\nGender: Male\nFeatures: jet black hair, tanned skin, blue eyes`;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.2)" }}>
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-2xl relative" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold mb-4 text-purple-700">Child Description</h2>
        <div className="flex flex-col md:flex-row gap-6 items-stretch">
          <form
            onSubmit={async e => {
              e.preventDefault();
              try {
                await setSetting('CHILD_DESCRIPTION', settings);
                const img = await generateCharacterImage(settings);
                await setSetting('CHILD_RENDER', img);
                setCharacterImg(img);
              } catch (err) {
                console.error('Failed to generate or save character image', err);
              }
            }}
            className="flex-1 flex flex-col gap-4"
          >
            <label className="flex flex-col gap-1">
              <textarea
                className="border rounded px-3 py-2 min-h-[200px] resize-vertical text-gray-900"
                value={settings || defaultText}
                onChange={e => setSettings(e.target.value)}
              />
            </label>
            <div className="flex gap-2 mt-2">
              <button type="submit" className="bg-purple-500 text-white px-4 py-2 rounded font-semibold hover:bg-purple-600">Generate</button>
              <button type="button" className="bg-gray-300 text-gray-700 px-4 py-2 rounded font-semibold hover:bg-gray-400" onClick={onClose}>Close</button>
            </div>
          </form>
          <div className="flex-1 flex flex-col items-center justify-center min-h-[200px]">
            {characterImg ? (
              <img
                src={characterImg}
                alt="Character preview"
                className="max-w-full max-h-64 object-contain border rounded shadow"
              />
            ) : (
              <div className="w-full h-64 flex items-center justify-center text-gray-400 border rounded bg-gray-50">
                No character image
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChildSettingsModal;
