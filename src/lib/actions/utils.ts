import { z } from "zod";

export class ActionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ActionError";
  }
}

export function createSafeAction<T extends z.ZodTypeAny, R>(
  schema: T,
  action: (data: z.infer<T>) => Promise<R>
) {
  return async (data: z.infer<T>): Promise<{ data?: R; error?: string }> => {
    try {
      const validatedData = schema.parse(data);
      const result = await action(validatedData);
      return { data: result };
    } catch (error) {
      console.error("Action Error:", error);
      if (error instanceof z.ZodError) {
        return { error: error.issues[0].message };
      }
      if (error instanceof ActionError) {
        return { error: error.message };
      }
      return { error: "An unexpected error occurred." };
    }
  };
}
