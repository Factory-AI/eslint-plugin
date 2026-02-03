# @factory/no-dynamic-styled-components

Disallow creating styled-components inside functions or React components.

## Rationale

Creating styled-components inside functions causes performance and testing issues:

- Components are recreated on every render, losing memoization benefits
- React sees a new component type each render, causing unnecessary DOM updates
- Testing libraries may produce warnings about component recreation
- CSS-in-JS optimizations like static extraction don't work

## Rule Details

This rule requires that all styled-component definitions be at module scope, not inside functions or component bodies.

## Examples

### Incorrect

```tsx
// Styled component created inside function component
function Card({ highlighted }) {
  const Container = styled.div`
    background: ${highlighted ? 'yellow' : 'white'};
  `;

  return <Container>Content</Container>;
}

// Styled component inside arrow function
const Button = () => {
  const StyledButton = styled.button`
    padding: 8px;
  `;
  return <StyledButton>Click</StyledButton>;
};
```

### Correct

```tsx
// Styled components at module scope
const Container = styled.div<{ $highlighted: boolean }>`
  background: ${(props) => (props.$highlighted ? 'yellow' : 'white')};
`;

const StyledButton = styled.button`
  padding: 8px;
`;

function Card({ highlighted }) {
  return <Container $highlighted={highlighted}>Content</Container>;
}

const Button = () => {
  return <StyledButton>Click</StyledButton>;
};
```
