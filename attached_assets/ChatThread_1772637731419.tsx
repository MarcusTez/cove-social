import { useState } from 'react';
import { ArrowLeft, MoreVertical, Send } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { BlockModal } from './BlockModal';
import { ReportModal } from './ReportModal';

interface Message {
  id: number;
  text: string;
  sender: 'me' | 'them';
  timestamp: string;
}

interface ChatThreadProps {
  name: string;
  photoUrl: string;
  messages: Message[];
  onBack: () => void;
  onViewProfile: () => void;
}

export function ChatThread({ name, photoUrl, messages, onBack, onViewProfile }: ChatThreadProps) {
  const [messageText, setMessageText] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const handleSend = () => {
    if (messageText.trim()) {
      console.log('Send message:', messageText);
      setMessageText('');
    }
  };

  const handleBlock = () => {
    console.log('User blocked:', name);
    setShowBlockModal(false);
    setShowMenu(false);
    // Navigate back to chat list
    onBack();
  };

  const handleReport = (reason: string) => {
    console.log('User reported:', name, 'Reason:', reason);
    setShowReportModal(false);
    setShowMenu(false);
    // Could show a success toast here
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-3 flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 -ml-2 hover:bg-secondary rounded-full transition-colors"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
          <ImageWithFallback
            src={photoUrl}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>

        <h2
          className="flex-1"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.125rem',
            fontWeight: 500,
          }}
        >
          {name}
        </h2>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 -mr-2 hover:bg-secondary rounded-full transition-colors"
          >
            <MoreVertical size={20} />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <div
                className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-20"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onViewProfile();
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-secondary transition-colors text-sm"
                >
                  View intro profile
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setShowBlockModal(true);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-secondary transition-colors text-sm"
                >
                  Block user
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setShowReportModal(true);
                  }}
                  className="w-full px-4 py-3 text-left hover:bg-secondary transition-colors text-sm text-destructive"
                >
                  Report user
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[75%] ${
                message.sender === 'me'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground border border-border'
              } rounded-2xl px-4 py-2.5`}
            >
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.9375rem',
                  lineHeight: '1.5',
                }}
              >
                {message.text}
              </p>
              <p
                className={`text-xs mt-1 ${
                  message.sender === 'me' ? 'opacity-70' : 'text-muted-foreground'
                }`}
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                {message.timestamp}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Composer */}
      <div className="bg-card border-t border-border px-4 py-3 pb-safe">
        <div className="flex items-end gap-2">
          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Message..."
            className="flex-1 bg-secondary border border-border rounded-full px-4 py-2.5 outline-none focus:border-foreground/20 transition-colors"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.9375rem',
            }}
          />
          <button
            onClick={handleSend}
            disabled={!messageText.trim()}
            className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity flex-shrink-0"
          >
            <Send size={18} />
          </button>
        </div>
      </div>

      {/* Modals */}
      <BlockModal
        name={name}
        isOpen={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        onConfirm={handleBlock}
      />
      <ReportModal
        name={name}
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSubmit={handleReport}
      />
    </div>
  );
}