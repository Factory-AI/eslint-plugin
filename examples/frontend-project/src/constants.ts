// @factory/constants-file-organization: Constants must live in constants.ts files

export const API_BASE_URL = 'https://api.example.com';

export const MAX_RETRY_ATTEMPTS = 3;

export const DEFAULT_PAGE_SIZE = 20;

export const BUTTON_STYLES = {
  primary: {
    backgroundColor: '#007bff',
    color: '#ffffff',
  },
  secondary: {
    backgroundColor: '#6c757d',
    color: '#ffffff',
  },
  danger: {
    backgroundColor: '#dc3545',
    color: '#ffffff',
  },
} as const;
