import { Home, MessageCircle, User, Calendar } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'home' | 'chat' | 'events' | 'profile';
  onTabChange: (tab: 'home' | 'chat' | 'events' | 'profile') => void;
  unreadCount?: number;
}

export function BottomNav({ activeTab, onTabChange, unreadCount }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-border">
      <div className="max-w-md mx-auto flex justify-around items-center h-16 px-4">
        <button
          onClick={() => onTabChange('home')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            activeTab === 'home' ? 'text-foreground' : 'text-muted-foreground'
          }`}
        >
          <Home size={24} strokeWidth={activeTab === 'home' ? 2 : 1.5} />
          <span className="text-xs" style={{ fontFamily: 'var(--font-sans)' }}>Home</span>
        </button>
        
        <button
          onClick={() => onTabChange('chat')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors relative ${
            activeTab === 'chat' ? 'text-foreground' : 'text-muted-foreground'
          }`}
        >
          <div className="relative">
            <MessageCircle size={24} strokeWidth={activeTab === 'chat' ? 2 : 1.5} />
            {unreadCount && unreadCount > 0 && (
              <span 
                className="absolute bg-foreground text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center z-10"
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.625rem',
                  fontWeight: 600,
                  padding: '0 4px',
                  top: '-4px',
                  right: '-4px',
                }}
              >
                {unreadCount}
              </span>
            )}
          </div>
          <span className="text-xs" style={{ fontFamily: 'var(--font-sans)' }}>Chat</span>
        </button>
        
        <button
          onClick={() => onTabChange('events')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            activeTab === 'events' ? 'text-foreground' : 'text-muted-foreground'
          }`}
        >
          <Calendar size={24} strokeWidth={activeTab === 'events' ? 2 : 1.5} />
          <span className="text-xs" style={{ fontFamily: 'var(--font-sans)' }}>Events</span>
        </button>
        
        <button
          onClick={() => onTabChange('profile')}
          className={`flex flex-col items-center justify-center gap-1 transition-colors ${
            activeTab === 'profile' ? 'text-foreground' : 'text-muted-foreground'
          }`}
        >
          <User size={24} strokeWidth={activeTab === 'profile' ? 2 : 1.5} />
          <span className="text-xs" style={{ fontFamily: 'var(--font-sans)' }}>My Profile</span>
        </button>
      </div>
    </nav>
  );
}