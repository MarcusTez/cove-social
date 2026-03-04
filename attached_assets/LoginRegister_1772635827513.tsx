import { useState } from 'react';

interface LoginRegisterProps {
  onComplete: () => void;
}

export function LoginRegister({ onComplete }: LoginRegisterProps) {
  const [mode, setMode] = useState<'welcome' | 'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Login logic would go here
    onComplete();
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    // Register logic would go here
    onComplete();
  };

  // Welcome/Landing screen
  if (mode === 'welcome') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 flex items-center justify-center px-5">
          <div className="max-w-md mx-auto text-center">
            {/* Logo/Brand name */}
            <h1
              className="mb-6"
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '3.5rem',
                fontWeight: 500,
                lineHeight: '1',
                letterSpacing: '-0.02em',
              }}
            >
              Cove
            </h1>
            
            {/* Main headline */}
            <h2
              className="mb-4"
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.5rem',
                fontWeight: 500,
                lineHeight: '1.3',
              }}
            >
              A different kind of introduction
            </h2>
            
            {/* Description */}
            <p
              className="mb-12"
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '1rem',
                color: 'var(--color-muted-foreground)',
                lineHeight: '1.5',
              }}
            >
              Deliberate connections curated with care. No algorithms, no endless feeds—just considered introductions and the space to begin.
            </p>
          </div>
        </div>

        {/* Bottom CTAs */}
        <div className="px-5 pb-8 space-y-3 max-w-md mx-auto w-full">
          <button
            onClick={() => setMode('register')}
            className="w-full py-3.5 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '1rem',
              fontWeight: 500,
            }}
          >
            Join Cove
          </button>

          <button
            onClick={() => setMode('login')}
            className="w-full py-3.5 border border-border rounded-lg hover:bg-secondary transition-colors"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '1rem',
              fontWeight: 500,
            }}
          >
            Log in
          </button>
        </div>
      </div>
    );
  }

  // Login screen
  if (mode === 'login') {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 flex items-center justify-center px-5">
          <div className="max-w-md mx-auto w-full">
            {/* Logo/Brand name */}
            <h1
              className="mb-12 text-center"
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '3.5rem',
                fontWeight: 500,
                lineHeight: '1',
                letterSpacing: '-0.02em',
              }}
            >
              Cove
            </h1>

            {/* Login form */}
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block mb-2"
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                  }}
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground"
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '1rem',
                  }}
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block mb-2"
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                  }}
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground"
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '1rem',
                  }}
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity"
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '1rem',
                  fontWeight: 500,
                }}
              >
                Log in
              </button>
            </form>

            {/* Switch to register */}
            <p
              className="mt-6 text-center"
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.875rem',
                color: 'var(--color-muted-foreground)',
              }}
            >
              New to Cove?{' '}
              <button
                onClick={() => setMode('register')}
                className="underline hover:opacity-70 transition-opacity"
                style={{ 
                  color: 'var(--color-foreground)',
                  fontSize: '0.875rem',
                }}
              >
                Register here
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Register screen
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto px-5 py-8">
        {/* Back button */}
        <button
          onClick={() => setMode('login')}
          className="mb-8 flex items-center gap-2 text-foreground hover:opacity-70 transition-opacity"
          style={{ fontFamily: 'var(--font-sans)' }}
        >
          <span>←</span>
          <span>Back</span>
        </button>

        {/* Title */}
        <h1
          className="mb-2"
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '2rem',
            fontWeight: 500,
            lineHeight: '1.2',
          }}
        >
          Join Cove
        </h1>

        <p
          className="mb-8"
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '1rem',
            color: 'var(--color-muted-foreground)',
            lineHeight: '1.5',
          }}
        >
          Complete the below to receive your invite code:
        </p>

        {/* Register form */}
        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label
              htmlFor="first-name"
              className="block mb-2"
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              First name
            </label>
            <input
              id="first-name"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="Alex"
              required
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground"
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '1rem',
              }}
            />
          </div>

          <div>
            <label
              htmlFor="last-name"
              className="block mb-2"
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              Last name
            </label>
            <input
              id="last-name"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Smith"
              required
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground"
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '1rem',
              }}
            />
          </div>

          <div>
            <label
              htmlFor="register-email"
              className="block mb-2"
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              Email
            </label>
            <input
              id="register-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground"
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '1rem',
              }}
            />
          </div>

          <div>
            <label
              htmlFor="confirm-email"
              className="block mb-2"
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.875rem',
                fontWeight: 500,
              }}
            >
              Confirm email
            </label>
            <input
              id="confirm-email"
              type="email"
              value={confirmEmail}
              onChange={(e) => setConfirmEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-foreground"
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '1rem',
              }}
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-foreground text-background rounded-lg hover:opacity-90 transition-opacity"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '1rem',
              fontWeight: 500,
            }}
          >
            Submit
          </button>

          {/* Terms */}
          <p
            className="text-center"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.75rem',
              color: 'var(--color-muted-foreground)',
              lineHeight: '1.5',
            }}
          >
            By creating an account, you agree to our{' '}
            <button
              type="button"
              className="underline hover:opacity-70 transition-opacity"
              style={{
                fontSize: '0.75rem',
              }}
            >
              Terms of Service
            </button>{' '}
            and{' '}
            <button
              type="button"
              className="underline hover:opacity-70 transition-opacity"
              style={{
                fontSize: '0.75rem',
              }}
            >
              Privacy Policy
            </button>
          </p>
        </form>

        {/* Switch to login */}
        <p
          className="mt-8 text-center"
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '0.875rem',
            color: 'var(--color-muted-foreground)',
          }}
        >
          Already have an account?{' '}
          <button
            onClick={() => setMode('login')}
            className="underline hover:opacity-70 transition-opacity"
            style={{ 
              color: 'var(--color-foreground)',
              fontSize: '0.875rem',
            }}
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
}