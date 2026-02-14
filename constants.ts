
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

export const CURRENT_USER: User = {
  id: 'me',
  email: 'user@formapp.io',
  name: 'Alex Form',
  avatar: 'https://picsum.photos/seed/alex/200',
  status: 'online',
};

export const MOCK_USERS: User[] = [
  { id: '1', name: 'Nova Prime', email: 'nova@gal.com', avatar: 'https://picsum.photos/seed/nova/200', status: 'online' },
  { id: '2', name: 'Cyber Hunter', email: 'hunter@matrix.io', avatar: 'https://picsum.photos/seed/hunter/200', status: 'away', lastSeen: '2m ago' },
  { id: '3', name: 'Luna Stark', email: 'luna@nebula.net', avatar: 'https://picsum.photos/seed/luna/200', status: 'offline', lastSeen: '1h ago' },
  { id: '4', name: 'FormBot AI', email: 'ai@formapp.io', avatar: 'https://picsum.photos/seed/bot/200', status: 'online' },
];

export const MOCK_CHATS: Chat[] = [
  {
    id: 'c1',
    name: 'Nova Prime',
    avatar: 'https://picsum.photos/seed/nova/200',
    type: 'individual',
    participants: ['me', '1'],
    unreadCount: 2,
    lastMessage: {
      id: 'm1',
      senderId: '1',
      text: 'Did you see the new update for the neural link?',
      timestamp: new Date().toISOString(),
      readStatus: 'read',
      reactions: [],
    }
  },
  {
    id: 'c2',
    name: 'FormBot AI',
    avatar: 'https://picsum.photos/seed/bot/200',
    type: 'individual',
    participants: ['me', '4'],
    unreadCount: 0,
    lastMessage: {
      id: 'm2',
      senderId: '4',
      text: 'Welcome to the future of messaging.',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      readStatus: 'read',
      reactions: [],
    }
  },
  {
    id: 'g1',
    name: 'Dev Operations',
    avatar: 'https://picsum.photos/seed/dev/200',
    type: 'group',
    participants: ['me', '1', '2', '3'],
    unreadCount: 5,
    lastMessage: {
      id: 'm3',
      senderId: '2',
      text: 'Pushing the v2.5 changes to production.',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      readStatus: 'delivered',
      reactions: [],
    }
  }
];

export const MOCK_STATUSES: StatusUpdate[] = [
  {
    id: 's1',
    userId: '1',
    userName: 'Nova Prime',
    userAvatar: 'https://picsum.photos/seed/nova/200',
    mediaUrl: 'https://picsum.photos/seed/status1/800/1200',
    timestamp: '10m ago',
    caption: 'Neon nights in Tokyo 🌃'
  },
  {
    id: 's2',
    userId: '2',
    userName: 'Cyber Hunter',
    userAvatar: 'https://picsum.photos/seed/hunter/200',
    mediaUrl: 'https://picsum.photos/seed/status2/800/1200',
    timestamp: '2h ago',
    caption: 'New setup ready.'
  }
];
