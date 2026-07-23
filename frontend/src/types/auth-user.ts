export type AuthUser = Readonly<{
  id: string;
  full_name: string;
  email: string;
  isActive: boolean;
  avatar: string;
  role: string;
}>;