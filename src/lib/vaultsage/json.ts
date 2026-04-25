export function extractJson(text: string): unknown | null {
  const direct = safeParse(text);
  if (direct !== undefined) return direct;

  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) {
    const fenced = safeParse(fence[1]);
    if (fenced !== undefined) return fenced;
  }

  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start >= 0 && end > start) {
    const sliced = safeParse(text.slice(start, end + 1));
    if (sliced !== undefined) return sliced;
  }

  return null;
}

function safeParse(s: string): unknown | undefined {
  try {
    return JSON.parse(s);
  } catch {
    return undefined;
  }
}
