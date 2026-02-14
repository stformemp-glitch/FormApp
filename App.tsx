
import React, { useState, useEffect } from 'react';
import { User, Chat, Message, AppTab, StatusUpdate, Language } from './types';
import { MOCK_USERS, MOCK_STATUSES } from './constants';
import { translations } from './translations';
import { ChatList } from './components/ChatList';
import { ChatWindow } from './components/ChatWindow';
import { StatusSection } from './components/StatusSection';
// Import format from date-fns to handle date formatting in the UI
import { format } from 'date-fns';
import { 
  ChatIcon, StatusIcon, SettingsIcon, ContactsIcon, LogoutIcon, 
  EyeIcon, EyeOffIcon, AdminIcon, VerifiedIcon, TrashIcon, BellIcon
} from './components/Icons';
import { getFormBotReply } from './services/geminiService';

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>('en');
  const [activeTab, setActiveTab] = useState<AppTab>('chats');
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [chats, setChats] = useState<Chat[]>([]); // Zerado sem conversas
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
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
  const [regSexuality, setRegSexuality] = useState('');
  const [regAvatar, setRegAvatar] = useState('https://picsum.photos/seed/user/200');

  // Admin Panel states
  const [banReason, setBanReason] = useState('');
  const [banDuration, setBanDuration] = useState('1');
  const [broadcastMsg, setBroadcastMsg] = useState('');

  const t = (key: string) => translations[language][key] || key;

  const handleLogin = () => {
    // Admin override
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

    // Normal user find (simplified for demo)
    const found = users.find(u => u.email === email);
    if (found) {
      setCurrentUser(found);
      setIsLoggedIn(true);
    } else {
      alert("Neural sync failed: Identity not found.");
    }
  };

  const handleRegister = () => {
    if (!email || !password || !regName) return;
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      email,
      name: regName,
      avatar: regAvatar,
      status: 'online',
      birthDate: regBirth,
      sexuality: regSexuality
    };
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    setIsLoggedIn(true);
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

    setMessages(prev => ({
      ...prev,
      [activeChatId]: [...(prev[activeChatId] || []), newMessage]
    }));

    setChats(prev => prev.map(c => 
      c.id === activeChatId ? { ...c, lastMessage: newMessage } : c
    ));

    // Handle FormBot or AI responses if applicable...
  };

  const startChat = (user: User) => {
    const existing = chats.find(c => c.participants.includes(user.id));
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
      setActiveChatId(newChat.id);
    }
    setActiveTab('chats');
  };

  const handleVerify = (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, isVerified: !u.isVerified } : u));
    alert(t('verifiedSuccess'));
  };

  const handleBan = (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { 
      ...u, 
      isBanned: true, 
      banReason: banReason || "Violation of network protocols.",
      banUntil: new Date(Date.now() + parseInt(banDuration) * 24 * 60 * 60 * 1000).toISOString()
    } : u));
    alert(t('bannedSuccess'));
    setBanReason('');
  };

  const handleBroadcast = () => {
    if (!broadcastMsg) return;
    // Simulate sending to everyone by adding a system message to all users in chats
    alert(t('broadcastSuccess'));
    setBroadcastMsg('');
  };

  if (!isLoggedIn) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#050505] p-6 overflow-y-auto">
        <div className="max-w-md w-full my-12">
          <div className="bg-slate-900/40 backdrop-blur-2xl border border-slate-800/50 p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
            <div className="relative z-10 space-y-6">
              <div className="text-center">
                <h1 className="text-5xl font-black tracking-tighter bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent mb-2">FormApp</h1>
                <p className="text-slate-400 font-light tracking-widest text-xs uppercase">{t('appTagline')}</p>
              </div>

              <div className="flex justify-center gap-2 mb-2">
                 {['en', 'pt', 'es', 'fr'].map(l => (
                   <button key={l} onClick={() => setLanguage(l as Language)} className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase transition-all ${language === l ? 'bg-cyan-500 text-black' : 'bg-slate-800 text-slate-400'}`}>{l}</button>
                 ))}
              </div>

              <div className="space-y-4">
                {isRegistering && (
                  <>
                    <input type="text" placeholder={t('namePlaceholder')} className="w-full bg-[#161b22] border border-slate-800 rounded-2xl p-4 text-sm text-slate-200" value={regName} onChange={e => setRegName(e.target.value)} />
                    <div className="flex gap-4">
                      <input type="date" placeholder={t('birthPlaceholder')} className="flex-1 bg-[#161b22] border border-slate-800 rounded-2xl p-4 text-sm text-slate-200" value={regBirth} onChange={e => setRegBirth(e.target.value)} />
                      <input type="text" placeholder={t('sexualityPlaceholder')} className="flex-1 bg-[#161b22] border border-slate-800 rounded-2xl p-4 text-sm text-slate-200" value={regSexuality} onChange={e => setRegSexuality(e.target.value)} />
                    </div>
                  </>
                )}
                <input type="email" placeholder={t('emailPlaceholder')} className="w-full bg-[#161b22] border border-slate-800 rounded-2xl p-4 text-sm text-slate-200" value={email} onChange={e => setEmail(e.target.value)} />
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} placeholder={t('passwordPlaceholder')} className="w-full bg-[#161b22] border border-slate-800 rounded-2xl p-4 text-sm text-slate-200" value={password} onChange={e => setPassword(e.target.value)} />
                  <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400">
                    {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button onClick={isRegistering ? handleRegister : handleLogin} className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 p-4 rounded-2xl font-bold shadow-lg shadow-cyan-500/20">
                {isRegistering ? t('register') : t('login')}
              </button>

              <button onClick={() => setIsRegistering(!isRegistering)} className="w-full text-xs text-slate-500 hover:text-cyan-400 transition-colors uppercase font-bold tracking-widest">
                {isRegistering ? "Already indexed? Sync Link" : "New Identity? Register"}
              </button>
              
              <p className="text-[10px] text-slate-600 font-mono text-center">{t('encryptedLabel')}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentUser?.isBanned && new Date() < new Date(currentUser.banUntil!)) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-black p-12 text-center">
        <div className="max-w-md animate-pulse">
           <AdminIcon className="w-24 h-24 text-red-500 mx-auto mb-6" />
           <h1 className="text-4xl font-black text-white mb-4 uppercase tracking-tighter">{t('bannedTitle')}</h1>
           <p className="text-red-400 font-mono text-sm mb-8">{t('bannedMessage')}</p>
           <div className="bg-red-950/20 border border-red-900/50 p-6 rounded-3xl text-left">
              <p className="text-[10px] text-red-500 font-bold uppercase mb-2">Neural Link Logs:</p>
              <p className="text-slate-300 text-sm mb-4">"{currentUser.banReason}"</p>
              <p className="text-[10px] text-slate-500 uppercase">Revoked Until: {format(new Date(currentUser.banUntil!), 'PPP')}</p>
           </div>
           <button onClick={() => setIsLoggedIn(false)} className="mt-12 text-slate-500 hover:text-white uppercase font-bold text-xs tracking-widest underline">Terminate Link</button>
        </div>
      </div>
    );
  }

  const activeChat = chats.find(c => c.id === activeChatId);
  const otherUser = activeChat ? users.find(u => u.id === activeChat.participants.find(p => p !== currentUser.id)) : undefined;

  return (
    <div className="h-screen w-full flex bg-[#050505] text-slate-100 overflow-hidden">
      <nav className="w-20 border-r border-slate-800/50 bg-[#0a0a0c] flex flex-col items-center py-8 gap-10">
        <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20 mb-4 animate-pulse">
           <span className="text-black font-black text-xl">F</span>
        </div>
        
        <div className="flex flex-col gap-6 flex-1">
          <NavButton icon={<ChatIcon />} active={activeTab === 'chats'} onClick={() => setActiveTab('chats'} label={t('messages')} />
          <NavButton icon={<StatusIcon />} active={activeTab === 'status'} onClick={() => setActiveTab('status')} label={t('pulse')} />
          <NavButton icon={<ContactsIcon />} active={activeTab === 'contacts'} onClick={() => setActiveTab('contacts')} label={t('net')} />
          <NavButton icon={<SettingsIcon />} active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} label={t('tune')} />
          {currentUser?.isAdmin && (
            <NavButton icon={<AdminIcon />} active={activeTab === 'adminPanel'} onClick={() => setActiveTab('adminPanel')} label="Admin" />
          )}
        </div>

        <div className="flex flex-col gap-6">
           <div className="relative group cursor-pointer">
              <img src={currentUser.avatar} className="w-10 h-10 rounded-xl ring-2 ring-slate-800 group-hover:ring-cyan-500" />
           </div>
           <button onClick={() => setIsLoggedIn(false)} className="p-3 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-2xl">
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
                <ChatWindow chat={activeChat} currentUser={currentUser!} messages={messages[activeChat.id] || []} onSendMessage={handleSendMessage} onDeleteMessage={() => {}} onEditMessage={() => {}} onReact={() => {}} t={t} otherUser={otherUser} />
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-30">
                  <ChatIcon className="w-24 h-24 mb-4" />
                  <p>{t('terminalReady')}</p>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'status' && <div className="flex-1"><StatusSection statuses={MOCK_STATUSES} currentUser={currentUser!} t={t} /></div>}

        {activeTab === 'contacts' && (
          <div className="flex-1 p-12 overflow-y-auto">
             <h2 className="text-4xl font-black mb-12">{t('neuralNet')}</h2>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.filter(u => u.id !== currentUser?.id).map(user => (
                  <div key={user.id} className="p-6 rounded-[2rem] bg-slate-900/40 border border-slate-800 hover:border-cyan-500/30 transition-all group flex flex-col items-center text-center">
                    <div className="relative mb-4">
                      <img src={user.avatar} className="w-24 h-24 rounded-[2rem] object-cover ring-2 ring-slate-800 group-hover:ring-cyan-500" />
                      {user.isVerified && <VerifiedIcon className="absolute -top-2 -right-2 w-6 h-6 text-cyan-400 bg-black rounded-full p-0.5" />}
                    </div>
                    <h3 className="font-bold text-xl">{user.name}</h3>
                    <p className="text-slate-500 text-sm mb-4">{user.email}</p>
                    <button onClick={() => startChat(user)} className="w-full bg-slate-800 hover:bg-cyan-500 hover:text-black p-3 rounded-2xl transition-all font-bold text-xs uppercase">{t('initiateLink')}</button>
                  </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'settings' && (
           <div className="flex-1 p-12">
             <div className="max-w-2xl mx-auto bg-slate-900/30 border border-slate-800 rounded-[3rem] p-12">
                <h2 className="text-3xl font-black mb-8">{t('language')}</h2>
                <div className="grid grid-cols-2 gap-4">
                  {['en', 'pt', 'es', 'fr'].map(l => (
                    <button key={l} onClick={() => setLanguage(l as Language)} className={`p-6 rounded-3xl border transition-all text-left ${language === l ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400' : 'bg-slate-800/30 border-slate-700 text-slate-500'}`}>
                      <p className="font-bold uppercase tracking-widest">{l}</p>
                    </button>
                  ))}
                </div>
             </div>
           </div>
        )}

        {activeTab === 'adminPanel' && currentUser?.isAdmin && (
          <div className="flex-1 p-12 overflow-y-auto">
             <h2 className="text-4xl font-black mb-12 uppercase tracking-tighter text-red-500">System Governance</h2>
             
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="space-y-6">
                  <h3 className="text-xl font-bold flex items-center gap-2"><AdminIcon className="w-6 h-6" /> User Management</h3>
                  <div className="space-y-4">
                    {users.filter(u => !u.isAdmin).map(user => (
                      <div key={user.id} className="p-4 bg-slate-900/50 border border-slate-800 rounded-2xl flex items-center justify-between">
                         <div className="flex items-center gap-3">
                           <img src={user.avatar} className="w-10 h-10 rounded-xl" />
                           <div>
                             <p className="font-bold text-sm flex items-center gap-1">{user.name} {user.isVerified && <VerifiedIcon className="w-3 h-3 text-cyan-400" />}</p>
                             <p className="text-[10px] text-slate-500 uppercase">{user.id}</p>
                           </div>
                         </div>
                         <div className="flex gap-2">
                            <button onClick={() => handleVerify(user.id)} className={`p-2 rounded-lg transition-colors ${user.isVerified ? 'bg-cyan-500/20 text-cyan-400' : 'bg-slate-800 text-slate-400 hover:bg-cyan-500/20'}`}><VerifiedIcon className="w-4 h-4" /></button>
                            <button onClick={() => handleBan(user.id)} className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20"><TrashIcon className="w-4 h-4" /></button>
                         </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-12">
                   <div className="p-8 bg-red-950/10 border border-red-900/30 rounded-[2.5rem] space-y-6">
                      <h3 className="font-bold text-red-500 uppercase tracking-widest text-xs">Revocation Protocols</h3>
                      <input type="text" placeholder={t('reason')} className="w-full bg-black border border-red-900/30 rounded-2xl p-4 text-sm" value={banReason} onChange={e => setBanReason(e.target.value)} />
                      <div className="flex items-center gap-4">
                        <label className="text-xs text-slate-500">{t('duration')}:</label>
                        <input type="number" className="bg-black border border-red-900/30 rounded-xl p-2 w-20 text-center" value={banDuration} onChange={e => setBanDuration(e.target.value)} />
                      </div>
                   </div>

                   <div className="p-8 bg-cyan-950/10 border border-cyan-900/30 rounded-[2.5rem] space-y-6">
                      <h3 className="font-bold text-cyan-500 uppercase tracking-widest text-xs">{t('notifyAll')}</h3>
                      <textarea placeholder="Write system notification..." className="w-full bg-black border border-cyan-900/30 rounded-2xl p-4 text-sm resize-none" rows={4} value={broadcastMsg} onChange={e => setBroadcastMsg(e.target.value)} />
                      <button onClick={handleBroadcast} className="w-full bg-cyan-500 text-black font-black p-4 rounded-2xl flex items-center justify-center gap-2"><BellIcon className="w-4 h-4" /> BROADCAST</button>
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
  <button onClick={onClick} className={`group relative p-4 rounded-2xl transition-all duration-300 flex flex-col items-center gap-1 ${active ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-600 hover:text-slate-400'}`}>
    <div className={`transition-transform duration-300 ${active ? 'scale-110' : 'group-hover:scale-105'}`}>
      {React.cloneElement(icon as React.ReactElement, { className: 'w-6 h-6' })}
    </div>
    <span className={`text-[8px] font-black uppercase tracking-widest transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>{label}</span>
    {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-cyan-400 rounded-r-full shadow-[0_0_10px_rgba(0,242,255,0.8)]"></div>}
  </button>
);

export default App;
