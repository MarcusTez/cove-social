import { ImageWithFallback } from './figma/ImageWithFallback';

interface Chat {
  id: number;
  name: string;
  photoUrl: string;
  lastMessage: string;
  timestamp: string;
  unread?: boolean;
}

interface ChatListProps {
  chats: Chat[];
  onChatSelect: (chatId: number) => void;
}

export function ChatList({ chats, onChatSelect }: ChatListProps) {
  return (
    <div className="divide-y divide-border">
      {chats.map((chat) => (
        <button
          key={chat.id}
          onClick={() => onChatSelect(chat.id)}
          className="w-full flex items-start gap-3 p-4 hover:bg-secondary/50 transition-colors text-left"
        >
          {/* Photo */}
          <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
            <ImageWithFallback
              src={chat.photoUrl}
              alt={chat.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between gap-2 mb-1">
              <h3 
                className="truncate"
                style={{ 
                  fontFamily: 'var(--font-serif)',
                  fontSize: '1.125rem',
                  fontWeight: chat.unread ? 600 : 500,
                }}
              >
                {chat.name}
              </h3>
              <div className="flex items-center gap-2 flex-shrink-0">
                {chat.unread && (
                  <span 
                    className="bg-foreground text-white rounded-full min-w-[20px] h-[20px] flex items-center justify-center"
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.625rem',
                      fontWeight: 600,
                      padding: '0 5px',
                    }}
                  >
                    1
                  </span>
                )}
                <span 
                  className="text-xs"
                  style={{ 
                    fontFamily: 'var(--font-sans)',
                    color: chat.unread ? 'var(--foreground)' : 'var(--muted-foreground)',
                    fontWeight: chat.unread ? 500 : 400,
                  }}
                >
                  {chat.timestamp}
                </span>
              </div>
            </div>
            <p 
              className="truncate"
              style={{ 
                fontFamily: 'var(--font-sans)',
                fontSize: '0.9375rem',
                color: chat.unread ? 'var(--foreground)' : 'var(--muted-foreground)',
                fontWeight: chat.unread ? 500 : 400,
              }}
            >
              {chat.lastMessage}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}