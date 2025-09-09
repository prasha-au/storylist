import { z } from 'zod';


export const StoryGenerateResponse = z.object({
  story: z.array(z.object({
    originalTask: z.string(),
    sentences: z.array(z.string()).length(4),
  }))
});

export const StoryItemSchema = z.object({
  checklistText: z.string(),
  sentences: z.array(z.string()).length(3),
  image: z.string().optional(),
  voice: z.string().optional(),
});

export const StorySchema = z.array(StoryItemSchema);

export type Story = z.infer<typeof StorySchema>;


export const ChecklistItemsSchema = z.array(z.object({
  text: z.string(),
  completed: z.boolean().default(false),
}));

export type ChecklistItems = z.infer<typeof ChecklistItemsSchema>;


export interface ChildDetails {
  description: string;
  image: string;
}
