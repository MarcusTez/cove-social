export function Events() {
  return (
    <div className="max-w-md mx-auto">
      <div className="px-5 py-6 border-b border-border">
        <h1 
          style={{ 
            fontFamily: 'var(--font-serif)',
            fontSize: '1.75rem',
            fontWeight: 500,
            lineHeight: '1.2',
          }}
        >
          Events
        </h1>
      </div>
      
      <div className="px-5 py-12 flex flex-col items-center justify-center text-center">
        <div className="max-w-sm">
          <h2
            className="mb-4"
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.5rem',
              fontWeight: 500,
              lineHeight: '1.3',
            }}
          >
            Events are coming soon
          </h2>
          
          <p
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '1rem',
              color: 'var(--color-muted-foreground)',
              lineHeight: '1.5',
            }}
          >
            We're curating a selection of gallery openings, film nights, talks, dinners, and cultural moments happening across the city.
          </p>
          
          <p
            className="mt-4"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '1rem',
              color: 'var(--color-muted-foreground)',
              lineHeight: '1.5',
            }}
          >
            Soon you'll be able to discover interesting things to do and find people from Cove to go with.
          </p>
        </div>
      </div>
    </div>
  );
}