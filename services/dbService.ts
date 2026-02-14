
import { User, Chat, Message } from '../types';

const STORAGE_KEY = 'formapp_neural_vault_v1';

interface DatabaseSchema {
  users: User[];
  chats: Chat[];
  messages: Record<string, Message[]>;
}

const getInitialDB = (): DatabaseSchema => ({
  users: [],
  chats: [],
  messages: {}
});

export const db = {
  get: (): DatabaseSchema => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return getInitialDB();
    try {
      return JSON.parse(data);
    } catch {
      return getInitialDB();
    }
  },

  save: (data: DatabaseSchema) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  addUser: (user: User) => {
    const current = db.get();
    if (current.users.find(u => u.email === user.email)) return false;
    current.users.push(user);
    db.save(current);
    return true;
  },

  getUserByEmail: (email: string) => {
    return db.get().users.find(u => u.email === email);
  },

  updateUser: (updatedUser: User) => {
    const current = db.get();
    current.users = current.users.map(u => u.id === updatedUser.id ? updatedUser : u);
    db.save(current);
  },

  saveMessage: (chatId: string, message: Message) => {
    const current = db.get();
    if (!current.messages[chatId]) current.messages[chatId] = [];
    current.messages[chatId].push(message);
    
    // Update last message in chat
    const chatIndex = current.chats.findIndex(c => c.id === chatId);
    if (chatIndex !== -1) {
      current.chats[chatIndex].lastMessage = message;
    }
    
    db.save(current);
  },

  updateMessages: (chatId: string, messages: Message[]) => {
    const current = db.get();
    current.messages[chatId] = messages;
    db.save(current);
  },

  createChat: (chat: Chat) => {
    const current = db.get();
    if (!current.chats.find(c => c.id === chat.id)) {
      current.chats.push(chat);
      db.save(current);
    }
  },

  updateChats: (chats: Chat[]) => {
    const current = db.get();
    current.chats = chats;
    db.save(current);
  }
};
