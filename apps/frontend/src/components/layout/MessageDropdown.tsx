// apps/frontend/src/components/layout/MessageDropdown.tsx
import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Mail, Star, Trash2, MoreVertical } from 'lucide-react';
import type { AppMessage } from '../../types/notifications';
import { NavLink, useNavigate } from 'react-router-dom';

interface MessageDropdownProps {
  messages: AppMessage[];
  messageCount: number;
  onMessageClick?: (messageId: string) => void;
  onMarkAsRead?: (messageId: string) => void;
  onDeleteMessage?: (messageId: string) => void;
}

export default function MessageDropdown({
  messages,
  messageCount,
  onMessageClick,
  onMarkAsRead,
  onDeleteMessage
}: MessageDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadMessages = messages.filter(m => !m.read);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 lg:p-2.5 text-white hover:bg-white/10 rounded-lg transition-all group"
        aria-label="Messages"
      >
        <MessageSquare className="w-5 h-5" />
        {messageCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1 shadow-lg group-hover:scale-110 transition-transform">
            {messageCount > 9 ? '9+' : messageCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">Messages</h3>
              <span className="text-xs text-gray-500">
                {unreadMessages.length} non lu{unreadMessages.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Messages List */}
          <div className="max-h-[400px] overflow-y-auto">
            {messages.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Mail className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">Aucun message</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => {
                    onMessageClick?.(message.id);
                    if (!message.read) {
                      onMarkAsRead?.(message.id);
                    }
                  }}
                  className={`px-4 py-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !message.read ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0 text-white font-semibold text-sm">
                      {message.avatar || message.sender.charAt(0).toUpperCase()}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className={`text-sm font-medium truncate ${!message.read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {message.sender}
                        </p>
                        <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                          {message.timestamp}
                        </span>
                      </div>
                      <p className={`text-sm truncate mb-1 ${!message.read ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                        {message.subject}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {message.preview}
                      </p>
                    </div>

                    {/* Indicators */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {message.important && (
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      )}
                      {!message.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
            <button className="w-full text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors" 
                onClick={() => navigate('/app/messages')}
            >
              Voir tous les messages
            </button>
          </div>
        </div>
      )}
    </div>
  );
}