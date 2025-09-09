import { getChecklist, setStory, getStory, getSetting, updateStoryItem } from './indexeddb';
import { generateSplitStoryImage, generateStory } from './genai';
import { ChecklistItems, ChildDetails, Story } from './schemas';


async function getChildDetailsOrFallback(): Promise<ChildDetails> {
  const description = await getSetting<string>('CHILD_DESCRIPTION');
  const childImage = await getSetting<string>('CHILD_IMAGE');
  return {
    image: childImage ?? `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkqAcAAIUAgUW0RjgAAAAASUVORK5CYII=`,
    description: description || `Age: 6`
  };
}


async function generateNewStory(checklist: ChecklistItems): Promise<Story> {
  const childDetails = await getChildDetailsOrFallback();
  const generateStoryResponse = await generateStory(childDetails.description, checklist.map(i => i.text));
  return generateStoryResponse.story.map(item => ({
    checklistText: item.originalTask,
    sentences: item.sentences,
  }));
}


async function addContentToStoryItem(storyItem: Story[number]): Promise<boolean> {
  const childDetails = await getChildDetailsOrFallback();
  const image = storyItem.image ? storyItem.image : await generateSplitStoryImage(childDetails, storyItem.sentences).catch(() => undefined);
  storyItem.image = image;
  return !!image;
}


export async function addStoryData(checklistId: string): Promise<void> {
  const checklist = await getChecklist(checklistId);
  if (!checklist) {
    throw new Error('Checklist not found');
  }

  let story: Story | undefined = await getStory(checklistId);
  if (!story) {
    story = await generateNewStory(checklist);
    await setStory(checklistId, story);
  }

  const storyItem = story[0];
  await addContentToStoryItem(storyItem);
  await updateStoryItem(checklistId, 0, storyItem);
}

export async function addContentToIndex(checklistId: string, index: number): Promise<boolean> {
  const story = await getStory(checklistId);
  if (!story) {
    throw new Error('Story not found');
  }
  console.log(story);

  const storyItem = story[index];
  if (!storyItem) {
    throw new Error('Invalid index');
  }

  if (storyItem.image) {
    return true;
  }

  const success = await addContentToStoryItem(storyItem);
  if (success) {
    await updateStoryItem(checklistId, index, storyItem);
  }
  return success;
}


