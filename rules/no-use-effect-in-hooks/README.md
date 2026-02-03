# @factory/no-use-effect-in-hooks

Disallow `useEffect` and similar effect hooks inside custom hooks.

## Rationale

Custom hooks should be composable building blocks, not side-effect containers:

- Side effects in hooks make them harder to test
- Components should control when side effects run
- Hidden effects make data flow harder to understand
- Violates the principle of least surprise

## Rule Details

This rule disallows calling any hook ending in "effect" (like `useEffect`, `useLayoutEffect`, `useMountEffect`) inside custom hooks (functions starting with `use`).

**Note:** Using effects in regular React components is fine - this rule only targets custom hooks.

## Examples

### Incorrect

```tsx
// Custom hook with useEffect
function useUserData(userId: string) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, [userId]);

  return user;
}

// Custom hook with useLayoutEffect
const useWindowSize = () => {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
};
```

### Correct

```tsx
// Hook returns query function, component controls fetching
function useUserQuery(userId: string) {
  return useQuery(['user', userId], () => fetchUser(userId));
}

// Component manages the effect
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser(userId).then(setUser);
  }, [userId]);

  return <div>{user?.name}</div>;
}

// Hook for derived state (no effects)
function useFormattedDate(date: Date) {
  return useMemo(() => formatDate(date), [date]);
}
```
