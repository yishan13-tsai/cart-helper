import { z } from 'zod';
import { askJson } from '../chat';

const ListItemSchema = z.array(
  z.object({
    name: z.string().min(1),
    quantity: z.number().int().positive().default(1),
  }),
);

export type ParsedListItem = z.infer<typeof ListItemSchema>[number];

export async function parseListText(
  text: string,
  locale: string,
  signal?: AbortSignal,
): Promise<ParsedListItem[]> {
  const prompt = `你是購物清單解析助手。從以下文字中找出所有商品，回傳 JSON 陣列：
[{"name": "<商品名>", "quantity": <整數，預設1>}]
規則：
- 只回 JSON 陣列，不要加任何解釋或 markdown
- 數量無法判斷時設為 1
- 用 ${locale} 回傳商品名稱

輸入：
${text}`;

  const { data } = await askJson(prompt, undefined, {
    schema: ListItemSchema,
    contextualFileIds: [],
    timeoutMs: 30_000,
    signal,
  });
  return data;
}
