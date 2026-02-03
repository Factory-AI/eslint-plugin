// Demonstrates:
// - @factory/filename-match-export: Filename matches exported component name
// - @factory/no-exported-function-expressions: Uses function declaration
// - @factory/no-plain-html-text-elements: Text wrapped in Typography component

import { type CardProps } from '../types';

import { Typography } from './Typography';

export function Card({ title, children }: CardProps): React.ReactElement {
  return (
    <div>
      <Typography variant="heading">{title}</Typography>
      <div>{children}</div>
    </div>
  );
}
