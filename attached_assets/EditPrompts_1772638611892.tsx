import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface Prompt {
  question: string;
  answer: string;
}

interface EditPromptsProps {
  availablePrompts: string[];
  currentPrompts: Prompt[];
  onSave: (prompts: Prompt[]) => void;
  onClose: () => void;
}

export function EditPrompts({ availablePrompts, currentPrompts, onSave, onClose }: EditPromptsProps) {
  const [prompts, setPrompts] = useState<Prompt[]>(currentPrompts.length > 0 ? currentPrompts : []);
  const [showDropdown, setShowDropdown] = useState<number | null>(null);

  const handleAddPrompt = () => {
    if (prompts.length < 3) {
      setPrompts([...prompts, { question: '', answer: '' }]);
      setShowDropdown(prompts.length);
    }
  };

  const handleSelectPrompt = (index: number, question: string) => {
    const newPrompts = [...prompts];
    newPrompts[index] = { question, answer: newPrompts[index]?.answer || '' };
    setPrompts(newPrompts);
    setShowDropdown(null);
  };

  const handleAnswerChange = (index: number, answer: string) => {
    const newPrompts = [...prompts];
    newPrompts[index] = { ...newPrompts[index], answer };
    setPrompts(newPrompts);
  };

  const handleRemovePrompt = (index: number) => {
    setPrompts(prompts.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const validPrompts = prompts.filter(p => p.question && p.answer.trim());
    onSave(validPrompts);
  };

  const canAddMore = prompts.length < 3;
  const usedQuestions = prompts.map(p => p.question).filter(Boolean);
  const availableOptions = availablePrompts.filter(q => !usedQuestions.includes(q));

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto">
        <div className="px-5 py-6 border-b border-border flex items-center justify-between">
          <button
            onClick={onClose}
            className="hover:opacity-70 transition-opacity"
            style={{ fontFamily: 'var(--font-sans)', fontSize: '1rem' }}
          >
            Cancel
          </button>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.25rem',
              fontWeight: 500,
            }}
          >
            Get to know me
          </h1>
          <button
            onClick={handleSave}
            className="hover:opacity-70 transition-opacity"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '1rem',
              fontWeight: 500,
            }}
          >
            Save
          </button>
        </div>

        <div className="px-5 py-6 space-y-6">
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.9375rem',
              color: 'var(--color-muted-foreground)',
              lineHeight: '1.5',
            }}
          >
            Choose 1-3 prompts to help people get to know you better
          </p>

          {prompts.map((prompt, index) => (
            <div key={index} className="space-y-3">
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(showDropdown === index ? null : index)}
                  className="w-full px-4 py-3 border border-border rounded-lg flex items-center justify-between hover:bg-secondary transition-colors"
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.9375rem',
                  }}
                >
                  <span className={prompt.question ? '' : 'text-muted-foreground'}>
                    {prompt.question || 'Select a prompt...'}
                  </span>
                  <ChevronDown
                    size={20}
                    className={`transition-transform ${showDropdown === index ? 'rotate-180' : ''}`}
                  />
                </button>

                {showDropdown === index && (
                  <div className="absolute z-10 w-full mt-2 bg-background border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {availableOptions.length === 0 ? (
                      <div
                        className="px-4 py-3 text-center text-muted-foreground"
                        style={{ fontFamily: 'var(--font-sans)', fontSize: '0.875rem' }}
                      >
                        No more prompts available
                      </div>
                    ) : (
                      availableOptions.map((option, optIndex) => (
                        <button
                          key={optIndex}
                          onClick={() => handleSelectPrompt(index, option)}
                          className="w-full px-4 py-3 text-left hover:bg-secondary transition-colors border-b border-border last:border-b-0"
                          style={{
                            fontFamily: 'var(--font-sans)',
                            fontSize: '0.9375rem',
                          }}
                        >
                          {option}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {prompt.question && (
                <div>
                  <textarea
                    value={prompt.answer}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                    placeholder="Your answer..."
                    rows={4}
                    className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground resize-none"
                    style={{
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.9375rem',
                      lineHeight: '1.5',
                    }}
                  />
                </div>
              )}

              <button
                onClick={() => handleRemovePrompt(index)}
                className="text-sm hover:opacity-70 transition-opacity"
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.875rem',
                  color: 'var(--color-muted-foreground)',
                }}
              >
                Remove prompt
              </button>
            </div>
          ))}

          {canAddMore && (
            <button
              onClick={handleAddPrompt}
              className="w-full py-3 border border-border rounded-lg hover:bg-secondary transition-colors"
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.9375rem',
                fontWeight: 500,
              }}
            >
              + Add prompt ({prompts.length}/3)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
