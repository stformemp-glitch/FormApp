
export type UserStatus = 'online' | 'offline' | 'away';
export type Language = 'en' | 'pt' | 'es' | 'fr';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar: string;
  status: UserStatus;
  lastSeen?: string;
  // New Fields
  birthDate?: string;
  sexuality?: string;
  isVerified?: boolean;
  isAdmin?: boolean;
  isBanned?: boolean;
  banReason?: string;
  banUntil?: string;
}

export interface Reaction {
  emoji: string;
  userId: string;
}

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  readStatus: 'sent' | 'delivered' | 'read';
  reactions: Reaction[];
  isEdited?: boolean;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'document';
  fileName?: string;
  replyToId?: string;
}

export interface Chat {
  id: string;
  name: string;
  avatar: string;
  type: 'individual' | 'group';
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
}

export interface StatusUpdate {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  mediaUrl: string;
  timestamp: string;
  caption?: string;
}

export type AppTab = 'chats' | 'status' | 'settings' | 'contacts' | 'adminPanel';
