// Demonstrates:
// - @factory/filename-match-export: Filename matches exported component name
// - @factory/no-exported-function-expressions: Uses function declaration
// - @factory/no-plain-html-text-elements: Text wrapped in Typography component

import { type ButtonProps } from '../types';
import { ButtonVariant } from '../enums';

import { Typography } from './Typography';

export function Button({
  variant = ButtonVariant.Primary,
  disabled = false,
  children,
  onClick,
}: ButtonProps): React.ReactElement {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      type="button"
    >
      <Typography>{children}</Typography>
    </button>
  );
}
