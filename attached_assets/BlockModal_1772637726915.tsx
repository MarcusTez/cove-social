interface BlockModalProps {
  name: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function BlockModal({ name, isOpen, onClose, onConfirm }: BlockModalProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-2xl max-w-sm w-full p-6 shadow-xl">
          <h3
            className="mb-3"
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.25rem',
              fontWeight: 500,
            }}
          >
            Block {name}?
          </h3>
          
          <p
            className="mb-6 text-muted-foreground"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.9375rem',
              lineHeight: '1.5',
            }}
          >
            Blocking will remove this chat and you won't be introduced again.
          </p>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 bg-secondary border border-border text-secondary-foreground px-6 py-3 rounded-full hover:bg-accent transition-colors"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 bg-destructive text-destructive-foreground px-6 py-3 rounded-full hover:opacity-90 transition-opacity"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              Block
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
