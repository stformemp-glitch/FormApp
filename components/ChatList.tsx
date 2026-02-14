
import React from 'react';
import { Chat, User } from '../types';
import { DoubleTick, SingleTick, SearchIcon, VerifiedIcon } from './Icons';
import { format } from 'date-fns';

interface ChatListProps {
  chats: Chat[];
  activeChatId: string | null;
  onChatSelect: (chat: Chat) => void;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  t: (key: string) => string;
  users: User[];
}

export const ChatList: React.FC<ChatListProps> = ({ 
  chats, 
  activeChatId, 
  onChatSelect, 
  searchQuery, 
  onSearchChange,
  t,
  users
}) => {
  const filteredChats = chats.filter(chat => 
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getChatUser = (chat: Chat) => {
    const otherId = chat.participants.find(p => p !== 'me');
    return users.find(u => u.id === otherId);
  };

  return (
    <div className="flex flex-col h-full border-r border-slate-800/50 bg-[#0a0a0c]">
      <div className="p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">{t('messages')}</h2>
        </div>
        
        <div className="relative group">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-cyan-400 transition-colors" />
          <input 
            type="text" 
            placeholder={t('searchPlaceholder')}
            className="w-full bg-[#161b22] border border-slate-800/50 rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 space-y-1">
        {filteredChats.map(chat => {
          const chatUser = getChatUser(chat);
          return (
            <button
              key={chat.id}
              onClick={() => onChatSelect(chat)}
              className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all duration-200 group ${
                activeChatId === chat.id 
                  ? 'bg-slate-800/40 border border-slate-700/50 shadow-lg shadow-cyan-900/10' 
                  : 'hover:bg-slate-800/20 border border-transparent'
              }`}
            >
              <div className="relative flex-shrink-0">
                <img src={chat.avatar} alt={chat.name} className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-800 group-hover:ring-cyan-500/30 transition-all" />
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#0a0a0c]"></div>
              </div>
              
              <div className="flex-1 min-w-0 text-left">
                <div className="flex justify-between items-center mb-0.5">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="font-semibold text-slate-200 truncate">{chat.name}</span>
                    {chatUser?.isVerified && <VerifiedIcon className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />}
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {chat.lastMessage ? format(new Date(chat.lastMessage.timestamp), 'HH:mm') : ''}
                  </span>
                </div>
                
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 min-w-0">
                    {chat.lastMessage?.senderId === 'me' && (
                      chat.lastMessage.readStatus === 'read' 
                        ? <DoubleTick className="w-3.5 h-3.5 text-cyan-400" /> 
                        : <SingleTick className="w-3.5 h-3.5 text-slate-500" />
                    )}
                    <p className="text-xs text-slate-400 truncate font-light tracking-wide">
                      {chat.lastMessage?.text || t('noMessages')}
                    </p>
                  </div>
                  
                  {chat.unreadCount > 0 && (
                    <span className="bg-cyan-500 text-[10px] font-bold text-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-[0_0_8px_rgba(0,242,255,0.4)]">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
