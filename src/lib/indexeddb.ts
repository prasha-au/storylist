import { openDB, DBSchema } from 'idb';
import { ChecklistItems } from './schemas';
import { Story } from './schemas';


const DB_NAME = 'storylist';
const DB_VERSION = 1;
const SETTINGS_STORE = 'data';
const CHECKLIST_STORE = 'checklist';
const STORY_STORE = 'story';

interface StorylistDB extends DBSchema {
  [SETTINGS_STORE]: {
    key: string;
    value: unknown;
  };
  [CHECKLIST_STORE]: {
    key: string;
    value: ChecklistItems;
  };
  [STORY_STORE]: {
    key: string;
    value: Story;
  };
}

let dbPromise: Promise<any> | null = null;

const getDbPromise = () => {
  if (typeof window === 'undefined') {
    throw new Error('IndexedDB is not available on the server');
  }
  if (!dbPromise) {
    dbPromise = openDB<StorylistDB>(DB_NAME, DB_VERSION, {
      upgrade(db, _oldVersion) {
        if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
          db.createObjectStore(SETTINGS_STORE);
        }
        if (!db.objectStoreNames.contains(CHECKLIST_STORE)) {
          db.createObjectStore(CHECKLIST_STORE);
        }
        if (!db.objectStoreNames.contains(STORY_STORE)) {
          db.createObjectStore(STORY_STORE);
        }
      },
    });
  }
  return dbPromise;
};


export async function setChecklist(key: string, value: ChecklistItems) {
  const db = await getDbPromise();
  await db.put(CHECKLIST_STORE, value, key);
}

export async function getChecklist(key: string): Promise<ChecklistItems | undefined> {
  const db = await getDbPromise();
  return db.get(CHECKLIST_STORE, key);
}

export async function setStory(key: string, value: Story) {
  const db = await getDbPromise();
  await db.put(STORY_STORE, value, key);
}

export async function getStory(key: string): Promise<Story | undefined> {
  const db = await getDbPromise();
  return db.get(STORY_STORE, key);
}

export async function updateStoryItem(key: string, index: number, item: Story[number]): Promise<void> {
  const story = await getStory(key);
  if (!story) {
    throw new Error('Story not found');
  }
  story[index] = item;
  await setStory(key, story);
}

export async function removeStory(key: string): Promise<void> {
  const db = await getDbPromise();
  await db.delete(STORY_STORE, key);
}

export async function setSetting<T = unknown>(key: string, value: T) {
  const db = await getDbPromise();
  await db.put(SETTINGS_STORE, value, key);
}

export async function getSetting<T = unknown>(key: string): Promise<T | undefined> {
  const db = await getDbPromise();
  return db.get(SETTINGS_STORE, key) as T | undefined;
}
