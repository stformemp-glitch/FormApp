
import React, { useState, useEffect, useRef } from 'react';
import { User, Chat, Message, AppTab, StatusUpdate, Language } from './types';
import { MOCK_STATUSES } from './constants';
import { translations } from './translations';
import { ChatList } from './components/ChatList';
import { ChatWindow } from './components/ChatWindow';
import { StatusSection } from './components/StatusSection';
import { db } from './services/dbService';
import { format } from 'date-fns';
import { 
  ChatIcon, StatusIcon, SettingsIcon, ContactsIcon, LogoutIcon, 
  EyeIcon, EyeOffIcon, AdminIcon, VerifiedIcon, TrashIcon, BellIcon,
  GlobeIcon, PhotoIcon
} from './components/Icons';

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>('pt');
  const [activeTab, setActiveTab] = useState<AppTab>('chats');
  
  // App Data State
  const [users, setUsers] = useState<User[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [regName, setRegName] = useState('');
  const [regBirth, setRegBirth] = useState('');
  const [regGender, setRegGender] = useState('');
  const [regAvatar, setRegAvatar] = useState(`https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Admin Panel states
  const [banReason, setBanReason] = useState('');
  const [banDuration, setBanDuration] = useState('1');
  const [broadcastMsg, setBroadcastMsg] = useState('');

  const t = (key: string) => translations[language][key] || key;

  // Initialization: Load from DB
  useEffect(() => {
    const stored = db.get();
    setUsers(stored.users);
    setChats(stored.chats);
    setMessages(stored.messages);
  }, []);

  const handleLogin = () => {
    // Admin Override
    if (email === 'admin' && password === 'studioforma2026') {
      const adminUser: User = {
        id: 'admin',
        email: 'admin',
        name: 'System Admin',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=admin',
        status: 'online',
        isAdmin: true,
        isVerified: true
      };
      setCurrentUser(adminUser);
      setIsLoggedIn(true);
      return;
    }

    const found = users.find(u => u.email === email);
    if (found) {
      // In a real app we'd hash and check password. Here we simulate.
      setCurrentUser(found);
      setIsLoggedIn(true);
    } else {
      alert("Neural sync failed: Identity not found in the grid.");
    }
  };

  const handleRegister = () => {
    if (!email || !password || !regName) {
      alert("Registration failed: Essential neural markers missing.");
      return;
    }

    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name: regName,
      avatar: regAvatar,
      status: 'online',
      birthDate: regBirth,
      gender: regGender
    };

    const success = db.addUser(newUser);
    if (success) {
      setUsers(prev => [...prev, newUser]);
      setCurrentUser(newUser);
      setIsLoggedIn(true);
    } else {
      alert("This email is already indexed in the neural network.");
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setRegAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async (text: string, media?: { file: File, type: any }) => {
    if (!activeChatId || !currentUser) return;

    const newMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: currentUser.id,
      text,
      timestamp: new Date().toISOString(),
      readStatus: 'sent',
      reactions: [],
      mediaUrl: media ? URL.createObjectURL(media.file) : undefined,
      mediaType: media?.type,
      fileName: media?.file.name
    };

    // Save to State
    setMessages(prev => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), newMessage]
    }));

    setChats(prev => prev.map(c => 
      c.id === activeChatId ? { ...c, lastMessage: newMessage } : c
    ));

    // Persist
    db.saveMessage(activeChatId, newMessage);
  };

  const handleDeleteMessage = (id: string) => {
    if (!activeChatId) return;
    const updated = (messages[activeChatId] || []).filter(m => m.id !== id);
    setMessages(prev => ({ ...prev, [activeChatId]: updated }));
    db.updateMessages(activeChatId, updated);
  };

  const handleEditMessage = (id: string, newText: string) => {
    if (!activeChatId) return;
    const updated = (messages[activeChatId] || []).map(m => m.id === id ? { ...m, text: newText, isEdited: true } : m);
    setMessages(prev => ({ ...prev, [activeChatId]: updated }));
    db.updateMessages(activeChatId, updated);
  };

  const handleReact = (id: string, emoji: string) => {
    if (!activeChatId || !currentUser) return;
    const updated = (messages[activeChatId] || []).map(m => {
      if (m.id === id) {
        const cleaned = m.reactions.filter(r => r.userId !== currentUser.id);
        const hasSame = m.reactions.find(r => r.userId === currentUser.id && r.emoji === emoji);
        if (hasSame) return { ...m, reactions: cleaned };
        return { ...m, reactions: [...cleaned, { emoji, userId: currentUser.id }] };
      }
      return m;
    });
    setMessages(prev => ({ ...prev, [activeChatId]: updated }));
    db.updateMessages(activeChatId, updated);
  };

  const startChat = (user: User) => {
    const existing = chats.find(c => c.participants.includes(user.id) && c.participants.includes(currentUser?.id || ''));
    if (existing) {
      setActiveChatId(existing.id);
    } else {
      const newChat: Chat = {
        id: `chat_${Math.random().toString(36).substr(2, 9)}`,
        name: user.name,
        avatar: user.avatar,
        type: 'individual',
        participants: [currentUser?.id || 'me', user.id],
        unreadCount: 0
      };
      setChats(prev => [...prev, newChat]);
      db.createChat(newChat);
      setActiveChatId(newChat.id);
    }
    setActiveTab('chats');
  };

  const handleVerify = (userId: string) => {
    const updatedUsers = users.map(u => u.id === userId ? { ...u, isVerified: !u.isVerified } : u);
    setUsers(updatedUsers);
    const updatedUser = updatedUsers.find(u => u.id === userId);
    if (updatedUser) db.updateUser(updatedUser);
    alert(t('verifiedSuccess'));
  };

  const handleBan = (userId: string) => {
    const until = new Date(Date.now() + parseInt(banDuration) * 24 * 60 * 60 * 1000).toISOString();
    const updatedUsers = users.map(u => u.id === userId ? { 
      ...u, 
      isBanned: true, 
      banReason: banReason || "Violation of network protocols.",
      banUntil: until
    } : u);
    setUsers(updatedUsers);
    const updatedUser = updatedUsers.find(u => u.id === userId);
    if (updatedUser) db.updateUser(updatedUser);
    alert(t('bannedSuccess'));
    setBanReason('');
  };

  const handleBroadcast = () => {
    if (!broadcastMsg || !currentUser?.isAdmin) return;
    
    users.forEach(targetUser => {
      if (targetUser.id === currentUser.id) return;
      
      const chatId = `chat_admin_${targetUser.id}`;
      const newMessage: Message = {
        id: `broadcast_${Math.random().toString(36).substr(2, 9)}`,
        senderId: currentUser.id,
        text: `[NEURAL ALERT]: ${broadcastMsg}`,
        timestamp: new Date().toISOString(),
        readStatus: 'sent',
        reactions: [],
      };

      setMessages(prev => {
        const updated = [...(prev[chatId] || []), newMessage];
        db.updateMessages(chatId, updated);
        return { ...prev, [chatId]: updated };
      });

      setChats(prev => {
        const existing = prev.find(c => c.id === chatId);
        let updatedChats;
        if (existing) {
          updatedChats = prev.map(c => c.id === chatId ? { ...c, lastMessage: newMessage } : c);
        } else {
          const newChat: Chat = {
            id: chatId,
            name: targetUser.name,
            avatar: targetUser.avatar,
            type: 'individual',
            participants: [currentUser.id, targetUser.id],
            unreadCount: 1,
            lastMessage: newMessage
          };
          updatedChats = [...prev, newChat];
        }
        db.updateChats(updatedChats);
        return updatedChats;
      });
    });

    alert(t('broadcastSuccess'));
    setBroadcastMsg('');
  };

  // Render Login/Register
  if (!isLoggedIn) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#050505] p-6 overflow-y-auto">
        <div className="max-w-md w-full my-12 animate-in fade-in zoom-in duration-500">
          <div className="bg-slate-900/40 backdrop-blur-2xl border border-slate-800/50 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden ring-1 ring-white/10">
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/20 blur-[80px] rounded-full"></div>
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/20 blur-[80px] rounded-full"></div>
            
            <div className="relative z-10 space-y-6">
              <div className="text-center">
                <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-r from-cyan-400 via-blue-400 to-emerald-400 bg-clip-text text-transparent mb-2 animate-pulse">FormApp</h1>
                <p className="text-slate-500 font-light tracking-widest text-[10px] uppercase opacity-80">{t('appTagline')}</p>
              </div>

              <div className="flex justify-center gap-2 mb-2">
                 {['en', 'pt', 'es', 'fr'].map(l => (
                   <button key={l} onClick={() => setLanguage(l as Language)} className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase transition-all duration-300 ${language === l ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/30' : 'bg-slate-800/50 text-slate-500 hover:text-slate-300'}`}>{l}</button>
                 ))}
              </div>

              <div className="space-y-4">
                {isRegistering && (
                  <div className="flex flex-col items-center gap-6 mb-4">
                    <div 
                      onClick={() => avatarInputRef.current?.click()}
                      className="group relative w-24 h-24 cursor-pointer rounded-[2rem] overflow-hidden border-2 border-dashed border-slate-700 hover:border-cyan-500 transition-all shadow-lg shadow-cyan-500/10"
                    >
                      <img src={regAvatar} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="Avatar Preview" />
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <PhotoIcon className="w-6 h-6 text-cyan-400 mb-1" />
                         <span className="text-[8px] uppercase font-black text-cyan-400">{t('profilePicture')}</span>
                      </div>
                      <input type="file" ref={avatarInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
                    </div>
                    
                    <div className="w-full space-y-4 animate-in slide-in-from-top-4 duration-500">
                      <input type="text" placeholder={t('namePlaceholder')} className="w-full bg-black/40 border border-slate-800/50 rounded-2xl p-4 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all" value={regName} onChange={e => setRegName(e.target.value)} />
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[8px] uppercase font-black text-slate-600 ml-1">{t('birthPlaceholder')}</label>
                          <input type="date" className="w-full bg-black/40 border border-slate-800/50 rounded-2xl p-4 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 transition-all" value={regBirth} onChange={e => setRegBirth(e.target.value)} />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[8px] uppercase font-black text-slate-600 ml-1">{t('genderPlaceholder')}</label>
                          <select className="w-full bg-black/40 border border-slate-800/50 rounded-2xl p-4 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 transition-all appearance-none" value={regGender} onChange={e => setRegGender(e.target.value)}>
                            <option value="" disabled className="bg-[#0a0a0c]">Select</option>
                            <option value="male" className="bg-[#0a0a0c]">Male</option>
                            <option value="female" className="bg-[#0a0a0c]">Female</option>
                            <option value="other" className="bg-[#0a0a0c]">Non-Binary</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                <input type="email" placeholder={t('emailPlaceholder')} className="w-full bg-black/40 border border-slate-800/50 rounded-2xl p-4 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all" value={email} onChange={e => setEmail(e.target.value)} />
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} placeholder={t('passwordPlaceholder')} className="w-full bg-black/40 border border-slate-800/50 rounded-2xl p-4 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all" value={password} onChange={e => setPassword(e.target.value)} />
                  <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400 transition-colors">
                    {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button onClick={isRegistering ? handleRegister : handleLogin} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 p-4 rounded-2xl font-black text-xs uppercase tracking-widest text-white shadow-xl shadow-cyan-500/20 hover:scale-[1.02] active:scale-95 transition-all">
                {isRegistering ? t('register') : t('login')}
              </button>

              <button onClick={() => setIsRegistering(!isRegistering)} className="w-full text-[10px] text-slate-600 hover:text-cyan-400 transition-colors uppercase font-black tracking-[0.2em]">
                {isRegistering ? "Já Indexado? Sincronizar" : "Nova Identidade? Registrar"}
              </button>
              
              <p className="text-[9px] text-slate-700 font-mono text-center tracking-tighter">{t('encryptedLabel')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle Banned User
  if (currentUser?.isBanned && new Date() < new Date(currentUser.banUntil!)) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-black p-12 text-center">
        <div className="max-w-md animate-in fade-in duration-1000">
           <AdminIcon className="w-24 h-24 text-red-600 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]" />
           <h1 className="text-4xl font-black text-white mb-4 uppercase tracking-tighter neon-text">{t('bannedTitle')}</h1>
           <p className="text-red-500/80 font-mono text-xs mb-8 uppercase tracking-widest">{t('bannedMessage')}</p>
           <div className="bg-red-950/10 border border-red-900/40 p-8 rounded-[2.5rem] text-left backdrop-blur-xl">
              <p className="text-[9px] text-red-500 font-black uppercase mb-4 tracking-widest">Protocol Logs // Violation detected:</p>
              <p className="text-slate-300 text-sm mb-6 font-light leading-relaxed italic">"{currentUser.banReason}"</p>
              <div className="flex justify-between items-center opacity-40">
                <p className="text-[9px] text-slate-500 uppercase font-mono">Status: Revoked</p>
                <p className="text-[9px] text-slate-500 uppercase font-mono">Until: {format(new Date(currentUser.banUntil!), 'PPP')}</p>
              </div>
           </div>
           <button onClick={() => setIsLoggedIn(false)} className="mt-12 text-slate-700 hover:text-white uppercase font-black text-[10px] tracking-[0.3em] transition-all">Terminar Link</button>
        </div>
      </div>
    );
  }

  const activeChat = chats.find(c => c.id === activeChatId);
  const otherUser = activeChat ? users.find(u => u.id === activeChat.participants.find(p => p !== currentUser?.id)) : undefined;

  return (
    <div className="h-screen w-full flex bg-[#050505] text-slate-100 overflow-hidden">
      <nav className="w-20 border-r border-slate-800/30 bg-[#0a0a0c]/80 backdrop-blur-xl flex flex-col items-center py-8 gap-10 z-50">
        <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)] mb-4 group cursor-pointer">
           <span className="text-black font-black text-xl group-hover:scale-110 transition-transform">F</span>
        </div>
        
        <div className="flex flex-col gap-8 flex-1">
          <NavButton icon={<ChatIcon />} active={activeTab === 'chats'} onClick={() => setActiveTab('chats')} label={t('messages')} />
          <NavButton icon={<StatusIcon />} active={activeTab === 'status'} onClick={() => setActiveTab('status')} label={t('pulse')} />
          <NavButton icon={<ContactsIcon />} active={activeTab === 'contacts'} onClick={() => setActiveTab('contacts')} label={t('net')} />
          <NavButton icon={<SettingsIcon />} active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} label={t('tune')} />
          {currentUser?.isAdmin && (
            <NavButton icon={<AdminIcon />} active={activeTab === 'adminPanel'} onClick={() => setActiveTab('adminPanel')} label="Admin" />
          )}
        </div>

        <div className="flex flex-col gap-6">
           <div className="relative group cursor-pointer">
              <img src={currentUser?.avatar} className="w-10 h-10 rounded-xl ring-2 ring-slate-800 group-hover:ring-cyan-500/50 transition-all" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0a0a0c]"></div>
           </div>
           <button onClick={() => setIsLoggedIn(false)} className="p-3 text-slate-600 hover:text-red-500 hover:bg-red-500/5 rounded-2xl transition-all">
            <LogoutIcon className="w-6 h-6" />
           </button>
        </div>
      </nav>

      <div className="flex-1 flex overflow-hidden">
        {activeTab === 'chats' && (
          <>
            <div className="w-80 flex-shrink-0">
              <ChatList chats={chats} activeChatId={activeChatId} onChatSelect={c => setActiveChatId(c.id)} searchQuery={searchQuery} onSearchChange={setSearchQuery} t={t} users={users} />
            </div>
            <div className="flex-1">
              {activeChat ? (
                <ChatWindow 
                  chat={activeChat} 
                  currentUser={currentUser!} 
                  messages={messages[activeChat.id] || []} 
                  onSendMessage={handleSendMessage} 
                  onDeleteMessage={handleDeleteMessage} 
                  onEditMessage={handleEditMessage} 
                  onReact={handleReact} 
                  t={t} 
                  otherUser={otherUser} 
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-20 select-none">
                  <ChatIcon className="w-32 h-32 mb-6 text-slate-800" />
                  <p className="font-black text-[10px] uppercase tracking-[0.4em] text-slate-600">{t('terminalReady')}</p>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'status' && <div className="flex-1"><StatusSection statuses={MOCK_STATUSES} currentUser={currentUser!} t={t} /></div>}

        {activeTab === 'contacts' && (
          <div className="flex-1 p-12 overflow-y-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="max-w-6xl mx-auto">
               <h2 className="text-4xl font-black mb-12 bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent">{t('neuralNet')}</h2>
               {users.filter(u => u.id !== currentUser?.id).length === 0 ? (
                 <div className="py-20 text-center border-2 border-dashed border-slate-800/50 rounded-[3rem]">
                   <ContactsIcon className="w-16 h-16 mx-auto mb-4 text-slate-800" />
                   <p className="text-slate-600 font-light tracking-widest uppercase text-xs">No identities indexed in the grid yet.</p>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {users.filter(u => u.id !== currentUser?.id).map(user => (
                      <div key={user.id} className="p-8 rounded-[2.5rem] bg-slate-900/20 border border-slate-800/50 hover:border-cyan-500/30 transition-all duration-500 group flex flex-col items-center text-center relative overflow-hidden backdrop-blur-sm">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="relative mb-6">
                          <img src={user.avatar} className="w-24 h-24 rounded-[2rem] object-cover ring-4 ring-slate-800/50 group-hover:ring-cyan-500/20 transition-all duration-500" />
                          {user.isVerified && <VerifiedIcon className="absolute -top-3 -right-3 w-8 h-8 text-cyan-400 bg-black rounded-full p-1 border border-cyan-500/20 shadow-lg shadow-cyan-500/20" />}
                        </div>
                        <h3 className="font-bold text-xl mb-1 text-slate-200">{user.name}</h3>
                        <p className="text-slate-500 text-[10px] font-mono mb-8 uppercase tracking-widest">{user.email}</p>
                        <button onClick={() => startChat(user)} className="w-full bg-slate-800/50 hover:bg-cyan-500 hover:text-black p-4 rounded-2xl transition-all font-black text-[10px] uppercase tracking-[0.2em]">{t('initiateLink')}</button>
                      </div>
                    ))}
                 </div>
               )}
             </div>
          </div>
        )}

        {activeTab === 'settings' && (
           <div className="flex-1 p-12 overflow-y-auto animate-in fade-in duration-500">
             <div className="max-w-2xl mx-auto bg-slate-900/10 border border-slate-800/40 rounded-[3rem] p-12 backdrop-blur-xl">
                <h2 className="text-3xl font-black mb-12 flex items-center gap-4"><GlobeIcon className="w-8 h-8 text-cyan-500" /> {t('language')}</h2>
                <div className="grid grid-cols-1 gap-4">
                  {['en', 'pt', 'es', 'fr'].map(l => (
                    <button key={l} onClick={() => setLanguage(l as Language)} className={`p-8 rounded-[2rem] border transition-all duration-300 text-left flex items-center justify-between group ${language === l ? 'bg-cyan-500/5 border-cyan-500 text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.05)]' : 'bg-slate-800/20 border-slate-800/50 text-slate-500 hover:border-slate-700'}`}>
                      <span className="font-black uppercase tracking-[0.4em] text-xs">{l}</span>
                      {language === l && <div className="w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_8px_rgba(0,242,255,1)]"></div>}
                    </button>
                  ))}
                </div>
             </div>
           </div>
        )}

        {activeTab === 'adminPanel' && currentUser?.isAdmin && (
          <div className="flex-1 p-12 overflow-y-auto animate-in fade-in duration-700 bg-[radial-gradient(circle_at_top_right,#0c1a25,transparent)]">
             <div className="max-w-7xl mx-auto">
               <div className="flex items-center justify-between mb-16">
                  <div>
                    <h2 className="text-5xl font-black uppercase tracking-tighter text-red-500 neon-text mb-2">System Governance</h2>
                    <p className="text-slate-600 font-mono text-[10px] uppercase tracking-[0.4em]">Advanced Administrative Protocols // v4.2.0</p>
                  </div>
                  <div className="px-6 py-3 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-3 animate-pulse">
                     <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                     <span className="text-[10px] text-red-500 font-black tracking-widest uppercase">Admin Mode Active</span>
                  </div>
               </div>
               
               <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                  <div className="lg:col-span-7 space-y-8">
                    <div className="bg-slate-900/20 border border-slate-800/50 rounded-[3rem] p-8 backdrop-blur-md">
                      <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-3"><ContactsIcon className="w-4 h-4 text-cyan-400" /> Neural Identities</h3>
                      {users.filter(u => u.id !== 'admin').length === 0 ? (
                        <div className="py-12 text-center opacity-30">
                          <p className="text-xs italic">No neural nodes connected to the grid.</p>
                        </div>
                      ) : (
                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                          {users.filter(u => u.id !== 'admin').map(user => (
                            <div key={user.id} className="p-5 bg-black/40 border border-slate-800/50 rounded-2xl flex items-center justify-between hover:border-cyan-500/30 transition-all group">
                               <div className="flex items-center gap-4">
                                 <img src={user.avatar} className="w-12 h-12 rounded-xl ring-2 ring-slate-800 group-hover:ring-cyan-500/20" />
                                 <div>
                                   <p className="font-bold text-sm text-slate-200 flex items-center gap-2">{user.name} {user.isVerified && <VerifiedIcon className="w-3.5 h-3.5 text-cyan-400" />}</p>
                                   <p className="text-[9px] text-slate-500 uppercase font-mono tracking-widest">{user.id}</p>
                                   <p className="text-[8px] text-slate-600 font-mono uppercase tracking-tighter">Sex: {user.gender} // Born: {user.birthDate}</p>
                                 </div>
                               </div>
                               <div className="flex gap-2">
                                  <button onClick={() => handleVerify(user.id)} className={`p-3 rounded-xl transition-all duration-300 ${user.isVerified ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' : 'bg-slate-800 text-slate-500 hover:bg-cyan-500/20 hover:text-cyan-400'}`} title="Verify Identity"><VerifiedIcon className="w-5 h-5" /></button>
                                  <button onClick={() => handleBan(user.id)} className="p-3 bg-red-500/5 text-red-500/60 border border-red-500/10 rounded-xl hover:bg-red-500/20 hover:text-red-500 hover:border-red-500/40 transition-all" title="Revoke Access"><TrashIcon className="w-5 h-5" /></button>
                               </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="lg:col-span-5 space-y-8">
                     <div className="p-10 bg-red-950/5 border border-red-900/20 rounded-[3rem] space-y-8 backdrop-blur-md relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 blur-[50px] -z-10"></div>
                        <h3 className="font-black text-red-500 uppercase tracking-[0.4em] text-[10px] flex items-center gap-3"><AdminIcon className="w-4 h-4" /> Revocation Protocols</h3>
                        <div className="space-y-6">
                          <div className="space-y-2">
                             <label className="text-[9px] text-slate-500 uppercase font-black tracking-widest ml-1">{t('reason')}</label>
                             <input type="text" placeholder="Protocol violation ID..." className="w-full bg-black/60 border border-red-900/20 rounded-2xl p-4 text-sm focus:outline-none focus:border-red-500/50 transition-all text-slate-200" value={banReason} onChange={(e) => setBanReason(e.target.value)} />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[9px] text-slate-500 uppercase font-black tracking-widest ml-1">{t('duration')} (Sols)</label>
                             <input type="number" className="w-full bg-black/60 border border-red-900/20 rounded-2xl p-4 text-sm focus:outline-none focus:border-red-500/50 transition-all text-slate-200" value={banDuration} onChange={(e) => setBanDuration(e.target.value)} />
                          </div>
                        </div>
                     </div>

                     <div className="p-10 bg-cyan-950/5 border border-cyan-900/20 rounded-[3rem] space-y-8 backdrop-blur-md relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-[50px] -z-10"></div>
                        <h3 className="font-black text-cyan-500 uppercase tracking-[0.4em] text-[10px] flex items-center gap-3"><BellIcon className="w-4 h-4" /> {t('notifyAll')}</h3>
                        <div className="space-y-6">
                           <textarea placeholder="Encrypt global alert packet..." className="w-full bg-black/60 border border-cyan-900/20 rounded-2xl p-4 text-sm resize-none focus:outline-none focus:border-cyan-500/50 transition-all text-slate-200 min-h-[120px]" value={broadcastMsg} onChange={(e) => setBroadcastMsg(e.target.value)} />
                           <button onClick={handleBroadcast} className="w-full bg-cyan-500 text-black font-black text-[10px] uppercase tracking-[0.3em] p-5 rounded-2xl flex items-center justify-center gap-3 hover:bg-cyan-400 hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] active:scale-95 transition-all">
                             <BellIcon className="w-5 h-5" /> Execute Broadcast
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface NavButtonProps {
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
  label: string;
}

const NavButton: React.FC<NavButtonProps> = ({ icon, active, onClick, label }) => (
  <button onClick={onClick} className={`group relative p-4 rounded-2xl transition-all duration-300 flex flex-col items-center gap-1.5 ${active ? 'bg-cyan-500/5 text-cyan-400' : 'text-slate-600 hover:text-slate-400'}`}>
    <div className={`transition-all duration-300 ${active ? 'scale-110 drop-shadow-[0_0_8px_rgba(0,242,255,0.5)]' : 'group-hover:scale-105'}`}>
      {React.cloneElement(icon as React.ReactElement, { className: 'w-6 h-6' })}
    </div>
    <span className={`text-[8px] font-black uppercase tracking-[0.3em] transition-opacity duration-500 ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>{label}</span>
    {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-cyan-500 rounded-r-full shadow-[0_0_15px_rgba(0,242,255,1)] animate-in slide-in-from-left duration-300"></div>}
  </button>
);

export default App;
