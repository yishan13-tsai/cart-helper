import { z } from 'zod';

export const UploadSuccessSchema = z.object({
  file_id: z.string().uuid(),
  name: z.string(),
  file_size: z.number().int().nonnegative(),
  fileb_content_type: z.string(),
  mime_type: z.string().nullable().optional(),
});
export type UploadSuccess = z.infer<typeof UploadSuccessSchema>;

export const FileProcessingStatusItemSchema = z.object({
  file_id: z.string().uuid(),
  file_exists: z.boolean().optional(),
  task_summary_status: z.string(),
  task_snapshot_status: z.string(),
  processing_progress: z.number().optional(),
});
export type FileProcessingStatusItem = z.infer<typeof FileProcessingStatusItemSchema>;

export const FileProcessingStatusResponseSchema = z.object({
  result: z.array(FileProcessingStatusItemSchema),
});

export const ChatV2ResultSchema = z.object({
  result: z.string(),
  suggested_questions: z.array(z.string()).default([]),
  general_file_tool_results: z
    .array(
      z.object({
        id: z.string(),
        file_name: z.string(),
        tool_name: z.string(),
      }),
    )
    .nullable()
    .optional(),
  new_chat_id: z.string().uuid().nullable().optional(),
});
export type ChatV2Result = z.infer<typeof ChatV2ResultSchema>;
