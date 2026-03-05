import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface FullProfileProps {
  name: string;
  photos: string[];
  location: string;
  gender: string;
  prompts: { question: string; answer: string; }[];
  thisWeek: string[];
  regularRituals: string[];
  upcomingPlans: string[];
  onBack: () => void;
  onMessage: () => void;
}

export function FullProfile({
  name,
  photos,
  location,
  gender,
  prompts,
  thisWeek,
  regularRituals,
  upcomingPlans,
  onBack,
  onMessage,
}: FullProfileProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const handlePhotoClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    if (x < width / 2) {
      // Left side - previous photo
      setCurrentPhotoIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
    } else {
      // Right side - next photo
      setCurrentPhotoIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-md mx-auto">
        {/* Photo Carousel */}
        <div className="relative">
          <div
            className="relative w-full aspect-square bg-secondary cursor-pointer"
            onClick={handlePhotoClick}
          >
            <ImageWithFallback
              src={photos[currentPhotoIndex]}
              alt={`${name} ${currentPhotoIndex + 1}`}
              className="w-full h-full object-cover"
            />

            {/* Photo indicators */}
            <div className="absolute top-4 left-0 right-0 flex gap-1 px-4">
              {photos.map((_, index) => (
                <div
                  key={index}
                  className="flex-1 h-0.5 rounded-full transition-all"
                  style={{
                    backgroundColor: index === currentPhotoIndex ? 'white' : 'rgba(255,255,255,0.3)',
                  }}
                />
              ))}
            </div>

            {/* Back button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBack();
              }}
              className="absolute top-4 left-4 w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/40 transition-colors z-10"
            >
              <ArrowLeft size={20} />
            </button>
          </div>
        </div>

        {/* Profile Content */}
        <div className="px-5 py-6 space-y-8">
          {/* Name, Location & Gender */}
          <div>
            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '2rem',
                fontWeight: 500,
                lineHeight: '1.2',
                marginBottom: '0.5rem',
              }}
            >
              {name}
            </h1>
            <p
              className="text-muted-foreground"
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.9375rem',
              }}
            >
              {location}
            </p>
            <p
              className="text-muted-foreground"
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.9375rem',
              }}
            >
              {gender}
            </p>
          </div>

          {/* Prompts */}
          {prompts.map((prompt, index) => (
            <div key={index}>
              <p
                className="text-muted-foreground mb-3"
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.8125rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {prompt.question}
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.9375rem',
                  lineHeight: '1.5',
                }}
              >
                {prompt.answer}
              </p>
            </div>
          ))}

          {/* This week */}
          <div>
            <p
              className="text-muted-foreground mb-3"
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.8125rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              This week I'm probably...
            </p>
            <div className="flex flex-wrap gap-2">
              {thisWeek.map((activity, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-secondary border border-border rounded-full text-sm"
                  style={{ fontFamily: 'var(--font-sans)' }}
                >
                  {activity}
                </span>
              ))}
            </div>
          </div>

          {/* Regular Rituals */}
          <div>
            <p
              className="text-muted-foreground mb-3"
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.8125rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Regular rituals
            </p>
            <div className="flex flex-wrap gap-2">
              {regularRituals.map((ritual, index) => (
                <span
                  key={index}
                  className="bg-secondary border border-border px-4 py-2 rounded-full"
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.875rem',
                  }}
                >
                  {ritual}
                </span>
              ))}
            </div>
          </div>

          {/* Upcoming Plans */}
          <div>
            <p
              className="text-muted-foreground mb-3"
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.8125rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Upcoming Plans
            </p>
            <div className="flex flex-wrap gap-2">
              {upcomingPlans.map((plan, index) => (
                <span
                  key={index}
                  className="bg-secondary border border-border px-4 py-2 rounded-full"
                  style={{
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.875rem',
                  }}
                >
                  {plan}
                </span>
              ))}
            </div>
          </div>

          {/* Message CTA */}
          <div className="sticky bottom-0 pb-6 pt-4 bg-gradient-to-t from-background via-background to-transparent">
            <button
              onClick={onMessage}
              className="w-full bg-primary text-primary-foreground px-8 py-4 rounded-full hover:opacity-90 transition-opacity"
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '0.9375rem',
                fontWeight: 500,
              }}
            >
              Message {name}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}