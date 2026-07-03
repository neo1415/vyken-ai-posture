import { z } from "zod";

export class AdminAuthValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdminAuthValidationError";
  }
}

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export function validateAdminLoginInput(input: {
  email: FormDataEntryValue | null;
  password: FormDataEntryValue | null;
}) {
  const parsed = loginSchema.safeParse({
    email: typeof input.email === "string" ? input.email : "",
    password: typeof input.password === "string" ? input.password : "",
  });

  if (!parsed.success) {
    const message =
      parsed.error.issues[0]?.message ?? "Invalid login credentials.";
    throw new AdminAuthValidationError(message);
  }

  return parsed.data;
}
