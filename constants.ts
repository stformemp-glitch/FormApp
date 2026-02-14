
import { User, Chat, StatusUpdate } from './types';

export const COLORS = {
  bg: '#050505',
  card: '#0f172a',
  accent: '#00f2ff',
  accentSecondary: '#00ff88',
  textMain: '#e2e8f0',
  textMuted: '#94a3b8',
  border: '#1e293b',
};

// Start with an empty user base
export const MOCK_USERS: User[] = [];

// Start with an empty chat history
export const MOCK_CHATS: Chat[] = [];

export const MOCK_STATUSES: StatusUpdate[] = [];
