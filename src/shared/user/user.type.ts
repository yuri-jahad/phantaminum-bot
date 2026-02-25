export type USER_ROLE = "admin" | "modo" | "staff" | "user"

export interface User {
  id: string;
  username: string
  role: USER_ROLE
  avatar: string | null
}
