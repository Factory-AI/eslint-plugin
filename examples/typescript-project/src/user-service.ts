import { UserRole } from './enums';
import { NotFoundError } from './errors';

import type { User } from './types';

const users: Map<string, User> = new Map();

export function createUser(name: string, email: string): User {
  const user: User = {
    id: crypto.randomUUID(),
    name,
    email,
    role: UserRole.User,
    createdAt: new Date(),
  };
  users.set(user.id, user);
  return user;
}

export function getUserById(id: string): User {
  const user = users.get(id);
  if (!user) {
    throw new NotFoundError('User', id);
  }
  return user;
}

export function listUsers(): User[] {
  return Array.from(users.values());
}
