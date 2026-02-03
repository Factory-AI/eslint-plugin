// @factory/types-file-organization: Type definitions must live in types.ts files

import { type ButtonVariant, type UserStatus } from './enums';

export interface User {
  id: string;
  name: string;
  email: string;
  status: UserStatus;
}

export interface ButtonProps {
  variant: ButtonVariant;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

export interface CardProps {
  title: string;
  children: React.ReactNode;
}
