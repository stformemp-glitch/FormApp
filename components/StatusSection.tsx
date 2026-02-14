
import React, { useState } from 'react';
import { StatusUpdate, User } from '../types';
import { BackIcon, CloseIcon } from './Icons';
import { format } from 'date-fns';

interface StatusSectionProps {
  statuses: StatusUpdate[];
  currentUser: User;
  t: (key: string) => string;
}

export const StatusSection: React.FC<StatusSectionProps> = ({ statuses, currentUser, t }) => {
  const [activeStatus, setActiveStatus] = useState<StatusUpdate | null>(null);

  return (
    <div className="flex flex-col h-full bg-[#0a0a0c]">
      <div className="p-6">
        <h2 className="text-3xl font-black bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent mb-8">{t('pulse')}</h2>
        
        <div className="space-y-8">
          <section>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">{t('myStatus')}</h3>
            <div className="flex items-center gap-4 p-4 rounded-3xl bg-slate-900/40 border border-slate-800/50 group cursor-pointer hover:border-emerald-500/30 transition-all">
              <div className="relative">
                <img src={currentUser.avatar} alt="me" className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-500/50 p-0.5" />
                <div className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-500 text-black rounded-full flex items-center justify-center font-bold text-lg shadow-[0_0_10px_rgba(16,185,129,0.5)]">+</div>
              </div>
              <div>
                <h4 className="font-semibold text-slate-200">{t('shareMoment')}</h4>
                <p className="text-xs text-slate-500 font-light">{t('uploadNeural')}</p>
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">{t('recentUpdates')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {statuses.map(status => (
                <div 
                  key={status.id}
                  onClick={() => setActiveStatus(status)}
                  className="relative h-64 rounded-3xl overflow-hidden cursor-pointer group hover:scale-[1.02] transition-transform duration-300 border border-slate-800"
                >
                  <img src={status.mediaUrl} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="flex items-center gap-2 mb-2">
                      <img src={status.userAvatar} className="w-8 h-8 rounded-xl ring-2 ring-cyan-500/50" />
                      <span className="text-xs font-bold text-white drop-shadow-md">{status.userName}</span>
                    </div>
                    <p className="text-xs text-slate-300 line-clamp-1 italic font-light">"{status.caption}"</p>
                    <span className="text-[10px] text-slate-500 mt-1 block">{status.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Fullscreen Status Viewer */}
      {activeStatus && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          <div className="relative w-full h-full md:max-w-lg md:h-[90vh] flex flex-col">
            {/* Progress Bar */}
            <div className="absolute top-4 left-4 right-4 h-1 bg-white/20 rounded-full overflow-hidden">
               <div className="h-full bg-cyan-400 animate-[progress_5s_linear_forwards]"></div>
            </div>
            
            <button 
              onClick={() => setActiveStatus(null)}
              className="absolute top-8 right-4 z-10 p-2 bg-black/40 text-white rounded-full hover:bg-black/60 transition-colors"
            >
              <CloseIcon className="w-6 h-6" />
            </button>

            <img src={activeStatus.mediaUrl} className="w-full h-full object-contain bg-neutral-900" />
            
            <div className="absolute bottom-10 left-0 right-0 p-8 text-center bg-gradient-to-t from-black via-black/40 to-transparent">
               <div className="flex items-center justify-center gap-3 mb-4">
                 <img src={activeStatus.userAvatar} className="w-10 h-10 rounded-xl" />
                 <div className="text-left">
                    <p className="font-bold text-white">{activeStatus.userName}</p>
                    <p className="text-xs text-slate-400">{activeStatus.timestamp}</p>
                 </div>
               </div>
               <p className="text-lg text-white font-light tracking-wide">{activeStatus.caption}</p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
};
