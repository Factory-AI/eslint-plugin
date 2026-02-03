// Demonstrates:
// - @factory/filename-match-export: Filename matches exported component name
// - @factory/no-exported-function-expressions: Uses function declaration
// - @factory/no-plain-html-text-elements: Text wrapped in Typography component
// - @factory/no-exported-string-union-types: Uses enum instead of string union

import { type User } from '../types';
import { UserStatus } from '../enums';

import { Card } from './Card';
import { Typography } from './Typography';

interface UserCardProps {
  user: User;
}

export function UserCard({ user }: UserCardProps): React.ReactElement {
  const statusLabel = getStatusLabel(user.status);

  return (
    <Card title={user.name}>
      <Typography>{user.email}</Typography>
      <Typography variant="caption">{statusLabel}</Typography>
    </Card>
  );
}

function getStatusLabel(status: UserStatus): string {
  switch (status) {
    case UserStatus.Active:
      return 'Active';
    case UserStatus.Inactive:
      return 'Inactive';
    case UserStatus.Pending:
      return 'Pending';
    default:
      return 'Unknown';
  }
}
