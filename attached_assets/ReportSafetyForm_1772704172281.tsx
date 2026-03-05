import { useState } from 'react';
import { X } from 'lucide-react';

interface ReportSafetyFormProps {
  onClose: () => void;
}

export function ReportSafetyForm({ onClose }: ReportSafetyFormProps) {
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Submit logic would go here
    alert('Safety report submitted successfully. Our team will review this immediately.');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-background z-50">
      <div className="max-w-md mx-auto min-h-screen flex flex-col">
        {/* Header */}
        <div className="px-5 py-6 border-b border-border flex items-center justify-between">
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.75rem',
              fontWeight: 500,
            }}
          >
            Report a Safety Issue
          </h1>
          <button
            onClick={onClose}
            className="p-2 hover:opacity-70 transition-opacity"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 px-5 py-6 flex flex-col">
          <div className="flex-1 space-y-6">
            {/* Description */}
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.9375rem',
                color: 'var(--color-muted-foreground)',
                lineHeight: 1.6,
              }}
            >
              Your safety is our priority. Please share details about any concerning behavior or violations of our community guidelines.
            </p>

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block mb-2"
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.875rem',
                  color: 'var(--color-muted-foreground)',
                }}
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-foreground"
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '1rem',
                }}
                placeholder="your@email.com"
              />
            </div>

            {/* Subject Field */}
            <div>
              <label
                htmlFor="subject"
                className="block mb-2"
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.875rem',
                  color: 'var(--color-muted-foreground)',
                }}
              >
                Subject
              </label>
              <input
                type="text"
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-foreground"
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '1rem',
                }}
                placeholder="Brief description of the issue"
              />
            </div>

            {/* Message Field */}
            <div>
              <label
                htmlFor="message"
                className="block mb-2"
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.875rem',
                  color: 'var(--color-muted-foreground)',
                }}
              >
                Details
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={8}
                className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-1 focus:ring-foreground resize-none"
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '1rem',
                }}
                placeholder="Please provide as much detail as possible..."
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              className="w-full py-4 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity"
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '1rem',
                fontWeight: 500,
              }}
            >
              Submit report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
