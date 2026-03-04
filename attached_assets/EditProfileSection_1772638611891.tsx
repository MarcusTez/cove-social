import { useState } from 'react';
import { X } from 'lucide-react';

interface EditProfileSectionProps {
  title: string;
  type: 'multi-select' | 'single-select' | 'text';
  options?: string[];
  currentValue: string | string[];
  onSave: (value: string | string[]) => void;
  onClose: () => void;
  maxSelections?: number;
  note?: string;
}

export function EditProfileSection({
  title,
  type,
  options = [],
  currentValue,
  onSave,
  onClose,
  maxSelections,
  note,
}: EditProfileSectionProps) {
  const [selectedValues, setSelectedValues] = useState<string[]>(
    Array.isArray(currentValue) ? currentValue : [currentValue]
  );
  const [textValue, setTextValue] = useState<string>(
    typeof currentValue === 'string' ? currentValue : ''
  );

  const handleToggle = (value: string) => {
    if (type === 'single-select') {
      setSelectedValues([value]);
    } else {
      if (selectedValues.includes(value)) {
        setSelectedValues(selectedValues.filter((v) => v !== value));
      } else {
        if (maxSelections && selectedValues.length >= maxSelections) {
          return;
        }
        setSelectedValues([...selectedValues, value]);
      }
    }
  };

  const handleSave = () => {
    if (type === 'text') {
      onSave(textValue);
    } else if (type === 'single-select') {
      onSave(selectedValues[0] || '');
    } else {
      onSave(selectedValues);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background">
      <div className="max-w-md mx-auto h-full flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.25rem',
              fontWeight: 500,
            }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 -mr-2 hover:bg-secondary rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-6">
          {type === 'text' ? (
            <div>
              <input
                type="text"
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
                className="w-full bg-secondary border border-border rounded-xl px-4 py-3 outline-none focus:border-foreground/20 transition-colors"
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.9375rem',
                }}
                placeholder="Enter value..."
              />
            </div>
          ) : (
            <div className="space-y-2">
              {options.map((option) => {
                const isSelected = selectedValues.includes(option);
                const isDisabled =
                  !isSelected && maxSelections && selectedValues.length >= maxSelections;

                return (
                  <button
                    key={option}
                    onClick={() => handleToggle(option)}
                    disabled={isDisabled}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-secondary border-border hover:bg-accent'
                    } ${isDisabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.9375rem',
                    }}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          )}

          {/* Note */}
          {note && (
            <p
              className="mt-4 text-muted-foreground text-center"
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.875rem',
              }}
            >
              {note}
            </p>
          )}

          {/* Selection counter for multi-select with max */}
          {type === 'multi-select' && maxSelections && (
            <p
              className="mt-4 text-center text-muted-foreground"
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.875rem',
              }}
            >
              {selectedValues.length} / {maxSelections} selected
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-border">
          <button
            onClick={handleSave}
            disabled={
              (type === 'text' && !textValue.trim()) ||
              (type !== 'text' && selectedValues.length === 0)
            }
            className="w-full bg-primary text-primary-foreground px-8 py-4 rounded-full hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.9375rem',
              fontWeight: 500,
            }}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
