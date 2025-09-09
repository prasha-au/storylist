import { GoogleGenAI, Modality } from '@google/genai';
import { ChildDetails, StoryGenerateResponse } from './schemas';
import z from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import { getSetting } from './indexeddb';


type ImageDataUrl = `data:image/${string};base64,${string}`;

async function getAiInstance() {
  const apiKey = await getSetting<string>('GEMINI_API_KEY');
  return new GoogleGenAI({ apiKey: apiKey || undefined });
}

export async function generateStory(childDescription: string, tasks: string[]): Promise<z.infer<typeof StoryGenerateResponse>> {
  const ai = await getAiInstance();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    config: {
      responseMimeType: 'application/json',
      responseSchema: zodToJsonSchema(StoryGenerateResponse),
    },
    contents: [
      {
        role: 'user',
        parts: [{ text: `
For the list of daily task dot points below generate a small story for a child.
I want you to turn these mundane daily tasks into a thrilling story of conquest and victory.
It is alright to stretch the imagination so long as the story relates loosely back to the task.
You must ensure contiuity through the dot points and the story must flow from one task to the next.

Present each item in an array 'storySegments'.
Each segment should match a task dot point and be an object containing 'task' which is the original
task text and 'storyParts' which contains the 3 sentences of the story for that task.

<childDetails>
${childDescription}
</childDetails>

<tasks>\n${tasks.map(t => `- ${t}`).join('\n')}\n</tasks>
          ` }],
      }
    ]
  });

  return StoryGenerateResponse.parse(JSON.parse(response.text ?? '{}'));
}




export async function generateCharacterImage(childDescription: string): Promise<ImageDataUrl> {
  const ai = await getAiInstance();

  const REQUEST_TEXT = `
Generate a single character image for the child described below.
Ensure the character is in a neutral pose with a transparent background.
The character should be in cartoon style animation for a child. Keep it light hearted and simple.

<childDetails>
${childDescription}
</childDetails>

`;
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image-preview',
    config: {
      responseModalities: [Modality.IMAGE],
    },
    contents: [
      {
        role: 'user',
        parts: [{ text: REQUEST_TEXT }]
      }
    ]
  });

  if (!response.data) {
    throw new Error('Unable to generate character image.');
  }
  console.log(response.data);
  return `data:image/png;base64,${response.data}`;
}


export async function generateSplitStoryImage(
  childInfo: ChildDetails,
  sentences: string[]
): Promise<ImageDataUrl> {
  const ai = await getAiInstance();

const REQUEST_TEXT = `

Generate a single image. Each quarter of the image should illustrate one of the given sentences below.
DO NOT generate any whitespace or borders around the images or attempt to split the frames in any way.
The images MUST be placed left to right top to bottom in the order the sentences are given.
DO NOT include the sentence or any other text in the image.

The frames should be generated in cartoon style animation for a child. Keep it light hearted and simple.
This image is part of a larger storybook that relates back to a daily task.
It is fine for the image to be outlandish and fantasy based. Ensure that the scene is exiciting and adventurous.

The provided image contains the child character you should place into the scenes.
You must ensure the character's features are consistent with this image.

<childDetails>
${childInfo.description}
</childDetails>

<sentences>
${JSON.stringify(sentences, null, 2)}
</sentences>
`;

  const [_childImageHeader, base64EncodedChildImage] = childInfo.image.split(',');

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image-preview',
    config: {
      responseModalities: [Modality.IMAGE],
    },
    contents: [
      {
        role: 'user',
        parts: [
          { text: REQUEST_TEXT },
          { inlineData: { mimeType: 'image/png', data: base64EncodedChildImage } }
        ]
      }
    ]
  });

  if (!response.data) {
    throw new Error('Unable to generate image.');
  }
  return `data:image/png;base64,${response.data}`;
}

