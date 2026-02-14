
import React, { useState, useRef, useEffect } from 'react';
import { Chat, Message, User } from '../types';
import { 
  AttachIcon, 
  SendIcon, 
  EmojiIcon, 
  MoreIcon, 
  DoubleTick, 
  SingleTick, 
  TrashIcon, 
  EditIcon,
  DocIcon,
  PhotoIcon,
  VideoIcon,
  CloseIcon,
  VerifiedIcon
} from './Icons';
import { format } from 'date-fns';

interface ChatWindowProps {
  chat: Chat;
  currentUser: User;
  messages: Message[];
  onSendMessage: (text: string, media?: { file: File, type: any }) => void;
  onDeleteMessage: (id: string) => void;
  onEditMessage: (id: string, newText: string) => void;
  onReact: (id: string, emoji: string) => void;
  t: (key: string) => string;
  otherUser?: User;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({ 
  chat, 
  currentUser, 
  messages, 
  onSendMessage, 
  onDeleteMessage, 
  onEditMessage,
  onReact,
  t,
  otherUser
}) => {
  const [inputText, setInputText] = useState('');
  const [isAttaching, setIsAttaching] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isReadOnly = otherUser?.isAdmin && !currentUser.isAdmin;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim() || isReadOnly) return;
    if (editingId) {
      onEditMessage(editingId, inputText);
      setEditingId(null);
    } else {
      onSendMessage(inputText);
    }
    setInputText('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isReadOnly) return;
    const file = e.target.files?.[0];
    if (file) {
      const type = file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'document';
      onSendMessage(`Shared a ${type}`, { file, type });
      setIsAttaching(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#050505] relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#00f2ff_1px,transparent_1px)] [background-size:40px_40px]"></div>
      </div>

      <div className="flex items-center justify-between p-4 border-b border-slate-800/50 bg-[#0a0a0c]/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img src={chat.avatar} alt={chat.name} className="w-10 h-10 rounded-xl ring-2 ring-slate-800" />
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0a0a0c]"></div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-slate-100">{chat.name}</h3>
              {otherUser?.isVerified && <VerifiedIcon className="w-4 h-4 text-cyan-400" />}
            </div>
            <p className="text-[10px] text-emerald-400 font-medium tracking-widest uppercase">{otherUser?.isAdmin ? 'System Administrator' : t('activeSync')}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <button className="hover:text-cyan-400 transition-colors"><MoreIcon className="w-5 h-5" /></button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 z-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full opacity-30 text-center">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4 border border-slate-700">
              <SendIcon className="w-8 h-8 text-cyan-400" />
            </div>
            <p className="text-slate-400">{t('establishConnection')}</p>
          </div>
        )}
        {messages.map((msg, idx) => {
          const isMe = msg.senderId === currentUser.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}>
              <div className={`max-w-[75%] relative ${isMe ? 'order-1' : 'order-2'}`}>
                <div className={`absolute top-0 ${isMe ? '-left-20' : '-right-20'} hidden group-hover:flex items-center gap-2 bg-slate-800/80 backdrop-blur-sm rounded-lg p-1 border border-slate-700 z-10 opacity-0 group-hover:opacity-100 transition-opacity`}>
                   <button onClick={() => { setEditingId(msg.id); setInputText(msg.text); }} className="p-1 hover:text-cyan-400"><EditIcon className="w-3.5 h-3.5" /></button>
                   <button onClick={() => onDeleteMessage(msg.id)} className="p-1 hover:text-red-400"><TrashIcon className="w-3.5 h-3.5" /></button>
                </div>

                <div className={`p-3 rounded-2xl shadow-xl transition-all duration-300 ${
                  isMe 
                    ? 'bg-gradient-to-br from-cyan-600/90 to-blue-700/90 text-white rounded-tr-none border border-cyan-400/20' 
                    : 'bg-[#1a1f26] text-slate-200 rounded-tl-none border border-slate-700/50'
                }`}>
                  {msg.mediaUrl && (
                    <div className="mb-2 rounded-lg overflow-hidden border border-white/10">
                      {msg.mediaType === 'image' && <img src={msg.mediaUrl} className="w-full max-h-64 object-cover" />}
                      {msg.mediaType === 'video' && <video src={msg.mediaUrl} controls className="w-full" />}
                      {msg.mediaType === 'document' && (
                        <div className="flex items-center gap-3 p-3 bg-black/20">
                          <DocIcon className="w-6 h-6 text-cyan-400" />
                          <span className="text-xs truncate">{msg.fileName || 'document.pdf'}</span>
                        </div>
                      )}
                    </div>
                  )}
                  <p className="text-sm leading-relaxed tracking-wide font-light">{msg.text}</p>
                  <div className="flex items-center justify-end gap-1.5 mt-1.5">
                    {msg.isEdited && <span className="text-[9px] opacity-50 uppercase tracking-tighter">{t('edited')}</span>}
                    <span className="text-[9px] opacity-50 font-mono tracking-tighter">
                      {format(new Date(msg.timestamp), 'HH:mm')}
                    </span>
                    {isMe && (
                      msg.readStatus === 'read' 
                        ? <DoubleTick className="w-3 h-3 text-cyan-200" /> 
                        : <SingleTick className="w-3 h-3 opacity-50" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-[#0a0a0c]/80 backdrop-blur-md border-t border-slate-800/50 z-20">
        {isReadOnly ? (
          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 text-center">
            <p className="text-xs text-slate-500 font-mono italic">{t('readOnlyAdmin')}</p>
          </div>
        ) : (
          <>
            {editingId && (
              <div className="mb-2 p-2 bg-cyan-950/30 border-l-4 border-cyan-500 rounded-r flex items-center justify-between">
                <div className="text-xs">
                  <p className="text-cyan-400 font-bold uppercase tracking-widest text-[9px]">{t('editingMessage')}</p>
                  <p className="text-slate-400 truncate max-w-md">{messages.find(m => m.id === editingId)?.text}</p>
                </div>
                <button onClick={() => { setEditingId(null); setInputText(''); }} className="text-slate-500 hover:text-white"><CloseIcon className="w-4 h-4" /></button>
              </div>
            )}

            <div className="flex items-end gap-3">
              <div className="relative">
                <button 
                  onClick={() => setIsAttaching(!isAttaching)}
                  className={`p-3 rounded-xl transition-all duration-300 ${isAttaching ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(0,242,255,0.4)]' : 'bg-slate-800 hover:bg-slate-700 text-slate-400'}`}
                >
                  <AttachIcon className="w-5 h-5" />
                </button>
                
                {isAttaching && (
                  <div className="absolute bottom-16 left-0 flex flex-col gap-2 bg-[#1a1f26] border border-slate-700 p-2 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-4 duration-200">
                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-3 p-3 hover:bg-slate-700 rounded-xl transition-colors">
                      <PhotoIcon className="w-5 h-5 text-emerald-400" />
                      <span className="text-xs text-slate-300">{t('image')}</span>
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-3 p-3 hover:bg-slate-700 rounded-xl transition-colors">
                      <VideoIcon className="w-5 h-5 text-cyan-400" />
                      <span className="text-xs text-slate-300">{t('video')}</span>
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-3 p-3 hover:bg-slate-700 rounded-xl transition-colors">
                      <DocIcon className="w-5 h-5 text-amber-400" />
                      <span className="text-xs text-slate-300">{t('file')}</span>
                    </button>
                  </div>
                )}
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} accept="image/*,video/*,application/pdf" />
              </div>

              <div className="flex-1 relative">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder={t('inputPlaceholder')}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 rounded-2xl py-3 px-4 text-sm resize-none max-h-32 focus:outline-none transition-all pr-12 text-slate-200 font-light"
                  rows={1}
                />
                <button className="absolute right-3 bottom-3 p-1 text-slate-500 hover:text-cyan-400 transition-colors">
                  <EmojiIcon className="w-5 h-5" />
                </button>
              </div>

              <button
                onClick={handleSend}
                disabled={!inputText.trim()}
                className={`p-3.5 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  inputText.trim() 
                    ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20 hover:scale-105' 
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
                }`}
              >
                <SendIcon className="w-5 h-5" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
