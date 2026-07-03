export type AdminLoginFormState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export type AdminSessionView = {
  email: string;
  role: "viewer" | "editor" | "superadmin";
  displayRole: string;
};
