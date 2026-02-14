
import React from 'react';
import { 
  MessageSquare, 
  CircleDashed, 
  Settings, 
  Users, 
  Search, 
  MoreVertical, 
  Paperclip, 
  Send, 
  Smile, 
  Check, 
  CheckCheck,
  Image as ImageIcon,
  FileText,
  Video,
  Trash2,
  Edit3,
  LogOut,
  ChevronLeft,
  X,
  Globe,
  Eye,
  EyeOff,
  BadgeCheck,
  ShieldAlert,
  Bell
} from 'lucide-react';

export const ChatIcon = ({ className }: { className?: string }) => <MessageSquare className={className} />;
export const StatusIcon = ({ className }: { className?: string }) => <CircleDashed className={className} />;
export const SettingsIcon = ({ className }: { className?: string }) => <Settings className={className} />;
export const ContactsIcon = ({ className }: { className?: string }) => <Users className={className} />;
export const SearchIcon = ({ className }: { className?: string }) => <Search className={className} />;
export const MoreIcon = ({ className }: { className?: string }) => <MoreVertical className={className} />;
export const AttachIcon = ({ className }: { className?: string }) => <Paperclip className={className} />;
export const SendIcon = ({ className }: { className?: string }) => <Send className={className} />;
export const EmojiIcon = ({ className }: { className?: string }) => <Smile className={className} />;
export const SingleTick = ({ className }: { className?: string }) => <Check className={className} />;
export const DoubleTick = ({ className }: { className?: string }) => <CheckCheck className={className} />;
export const PhotoIcon = ({ className }: { className?: string }) => <ImageIcon className={className} />;
export const DocIcon = ({ className }: { className?: string }) => <FileText className={className} />;
export const VideoIcon = ({ className }: { className?: string }) => <Video className={className} />;
export const TrashIcon = ({ className }: { className?: string }) => <Trash2 className={className} />;
export const EditIcon = ({ className }: { className?: string }) => <Edit3 className={className} />;
export const LogoutIcon = ({ className }: { className?: string }) => <LogOut className={className} />;
export const BackIcon = ({ className }: { className?: string }) => <ChevronLeft className={className} />;
export const CloseIcon = ({ className }: { className?: string }) => <X className={className} />;
export const GlobeIcon = ({ className }: { className?: string }) => <Globe className={className} />;
export const EyeIcon = ({ className }: { className?: string }) => <Eye className={className} />;
export const EyeOffIcon = ({ className }: { className?: string }) => <EyeOff className={className} />;
export const VerifiedIcon = ({ className }: { className?: string }) => <BadgeCheck className={className} />;
export const AdminIcon = ({ className }: { className?: string }) => <ShieldAlert className={className} />;
export const BellIcon = ({ className }: { className?: string }) => <Bell className={className} />;
