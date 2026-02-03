// Demonstrates:
// - @factory/filename-match-export: Filename matches exported component name
// - @factory/no-exported-function-expressions: Uses function declaration

interface TypographyProps {
  children: React.ReactNode;
  variant?: 'body' | 'heading' | 'caption';
}

export function Typography({
  children,
  variant = 'body',
}: TypographyProps): React.ReactElement {
  const Tag = variant === 'heading' ? 'h1' : 'span';

  return <Tag>{children}</Tag>;
}
