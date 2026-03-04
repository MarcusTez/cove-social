import { useState } from 'react';
import { ChevronRight, Plus, Settings as SettingsIcon } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { EditProfileSection } from './EditProfileSection';
import { EditPrompts } from './EditPrompts';
import { Settings } from './Settings';

interface Prompt {
  question: string;
  answer: string;
}

interface MyProfileData {
  photos: (string | null)[];
  name: string;
  age: number;
  location: string;
  gender: string;
  whyHere: string[];
  thisWeek: string[];
  regularRituals: string[];
  londonAreas: string[];
  values: string[];
  lifestyle: string[];
  upcomingPlans: string[];
  idealWeek: string;
  describeWords: string[];
  relationshipStatus: string;
  whereAtInLife: string[];
  friendshipMatters: string[];
  instagram: string;
  linkedin: string;
  prompts: Prompt[];
}

// All option lists
const whyHereOptions = [
  'I\'m new to London and starting from scratch',
  'My friends are all coupled up or moved away',
  'I\'m tired of surface-level small talk',
  'I want friends who actually follow through on plans',
  'I\'m done with the "we should hang out sometime" cycle',
  'My social circle is great, but I want to expand it',
  'I\'ve outgrown my current friend group',
  'I want friends who share my interests and ambitions',
  'I\'m ready to prioritise my social life again',
];

const thisWeekOptions = [
  'Drinks', 'Dinner out', 'Coffee catchups', 'Going out/dancing', 'Hosting at home',
  'Running', 'Pilates/Yoga', 'Gym sessions', 'Cycling', 'Swimming', 'Tennis/Padel',
  'Galleries', 'Museums', 'Theatre/Shows', 'Cinema', 'Book clubs/readings', 
  'Gigs/concerts', 'Shopping/markets', 'Ballet', 'Comedy nights',
  'Industry events/talks', 'Workshops/classes', 'Networking',
  'Park walks', 'Dog walking', 'Day trips', 'Exploring new areas',
];

const regularRitualsOptions = [
  'Pilates', 'Running', 'Yoga', 'Gym', 'Cycling', 'Boxing', 'Swimming', 'Meditation', 
  'Therapy', 'Massage', 'Ice baths', 'Sauna',
  'Friday drinks', 'Sunday roasts', 'Dinner clubs', 'Hosting', 'Brunch gang', 
  'Wine tasting', 'Pub quiz', 'Board games',
  'Writing', 'Photography', 'DJ\'ing', 'Fashion', 'Design', 'Painting', 'Pottery', 
  'Music', 'Dance', 'Cooking',
  'Founder life', 'Networking', 'Side hustles', 'Investing', 'Reading', 'Podcasts', 
  'Mentoring', 'Learning',
  'Museums', 'Theatre', 'Art galleries', 'Film', 'Vintage markets', 'Architecture', 
  'Bookshops', 'Poetry',
  'Fine dining', 'Street food', 'Wine bars', 'Cocktail bars', 'Coffee culture', 
  'Vegan spots',
  'Hiking', 'Wild swimming', 'Camping', 'Climbing', 'Sailing', 'Skiing', 'Surfing', 
  'Foraging',
];

const londonAreasOptions = [
  'Soho', 'Covent Garden', 'Fitzrovia', 'King\'s Cross', 'Marylebone',
  'Shoreditch', 'Hackney', 'Dalston', 'Victoria Park', 'Bethnal Green', 'Stratford', 
  'Canary Wharf',
  'Notting Hill', 'Hammersmith', 'Fulham', 'Shepherd\'s Bush', 'Kensington', 'Chelsea',
  'Clapham', 'Brixton', 'Peckham', 'Greenwich', 'Battersea', 'Wandsworth', 'Dulwich',
  'Camden', 'Islington', 'Highbury', 'Stoke Newington', 'Hampstead', 'Archway',
];

const valuesOptions = [
  'I\'m building something and want ambitious friends',
  'Personal growth is non-negotiable',
  'I\'m obsessed with learning new things',
  'I want friends who challenge me',
  'Wellness is my religion',
  'I optimize everything (sleep, diet, routine)',
  'Movement is my meditation',
  'Self-care isn\'t selfish',
  'Fashion/art/music is my love language',
  'I collect experiences, not things',
  'I need culture like I need air',
  'Aesthetics matter to me',
  'Give me dinner parties over nightclubs',
  'I\'m the person who organizes everything',
  'Quality time over large groups',
  'I love hosting and bringing people together',
  'Spontaneous plans are the best plans',
];

const lifestyleOptions = [
  'I\'m always planning the next trip',
  'Passport stamps are my love language',
  'I need regular escapes from the city',
  'Solo travel is my therapy',
  'Weekend getaways over staying home',
  'I love discovering hidden gems in London',
  'I know the best spots before they\'re cool',
  'East London is my spiritual home',
  'I live for rooftop bars and secret gardens',
];

const upcomingPlansOptions = [
  'International trip', 'Beach/island getaway', 'Ski trip', 'Festival season', 
  'UK weekend away', 'Solo travel adventure',
  'Gigs/concerts', 'Race/sporting event', 'Theatre/show tickets', 
  'Exhibition/gallery opening', 'Wine tasting/food event', 'Festival',
  'Weekly dinner crew', 'Running club', 'Workout buddy', 'Sunday coffee walks', 
  'Cinema/culture buddy',
];

const idealWeekOptions = [
  'Packed calendar — something every night',
  '2-3 solid plans, rest is chill time',
  '1 big thing, mostly low-key',
  'Spontaneous — I don\'t plan ahead',
];

const describeWordsOptions = [
  'Adventurous', 'Ambitious', 'Authentic', 'Calm', 'Caring', 'Creative', 'Curious', 
  'Driven', 'Easy-going', 'Energetic', 'Extroverted', 'Funny', 'Genuine', 'Grounded', 
  'Independent', 'Introverted', 'Kind', 'Laid-back', 'Loyal', 'Optimistic', 
  'Organized', 'Outgoing', 'Passionate', 'Playful', 'Reliable', 'Sarcastic', 
  'Spontaneous', 'Thoughtful', 'Warm', 'Witty',
];

const genderOptions = [
  'Woman',
  'Man',
  'Non-binary',
  'Prefer to self-describe',
];

const relationshipStatusOptions = [
  'Single and dating',
  'Single and not dating',
  'In a relationship',
  'Married/partnered',
  'It\'s complicated',
];

const whereAtInLifeOptions = [
  'Climbing the corporate ladder',
  'Founder/building my own thing',
  'Freelance/portfolio life',
  'Career break/sabbatical',
  'Just started a new job/industry',
  'Prefer not to say',
  'New to London',
  'Moved neighborhoods recently',
  'Friend group shifted',
  'Coming out of a breakup',
  'Fresh out of a long relationship',
  'Just moved back to London',
  'Building a career',
  'Building a business',
  'Building a social life',
  'Building healthier habits',
  'Building creative projects',
  'Just want to have more fun',
];

const friendshipMattersOptions = [
  'Ambitious/driven energy',
  'Wellness-focused lifestyle',
  'Politically progressive',
  'Environmentally conscious',
  'Spiritual/open-minded',
  'LGBTQ+ friendly',
  'Up for spontaneous plans',
  'Prefers planned-ahead hangouts',
  'Doesn\'t smoke',
  'Drinks socially',
  'Doesn\'t drink',
];

const promptOptions = [
  'This week I\'m probably…',
  'Favourite song right now',
  'A small ritual I care about…',
  'Best meal I\'ve had recently',
  'Last thing that made me laugh',
  'A place that feels like home',
  'Something I\'m learning',
  'My ideal Sunday looks like…',
  'A non-negotiable for me',
  'Something I\'m looking forward to',
  'My go-to coffee order',
  'A hidden talent',
  'Something that surprised me lately',
  'My current obsession',
];

const mockProfileData: MyProfileData = {
  photos: [
    'https://images.unsplash.com/photo-1762522921456-cdfe882d36c3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b3VuZyUyMHByb2Zlc3Npb25hbCUyMHdvbWFuJTIwcG9ydHJhaXQlMjBzbWlsaW5nfGVufDF8fHx8MTc3MjQ1NzQ3N3ww&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1763259405177-0121bf79da0d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHByb2Zlc3Npb25hbCUyMGxpZmVzdHlsZSUyMG91dGRvb3IlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NzI0NTk5MTF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    null,
  ],
  name: 'Lena',
  age: 28,
  location: 'London',
  gender: 'Woman',
  whyHere: [
    'I want friends who share my interests and ambitions',
    'My social circle is great, but I want to expand it',
  ],
  thisWeek: ['Dinner out', 'Running', 'Comedy nights', 'Pilates/Yoga', 'Park walks'],
  regularRituals: ['Yoga', 'Running', 'Cooking', 'Networking', 'Museums', 'Coffee culture'],
  londonAreas: ['Shoreditch', 'Soho', 'Clapham'],
  values: [
    'Personal growth is non-negotiable',
    'I need culture like I need air',
    'Quality time over large groups',
  ],
  lifestyle: [
    'I love discovering hidden gems in London',
    'Weekend getaways over staying home',
  ],
  upcomingPlans: ['Gigs/concerts', 'UK weekend away', 'Weekly dinner crew'],
  idealWeek: '2-3 solid plans, rest is chill time',
  describeWords: ['Ambitious', 'Curious', 'Warm', 'Authentic', 'Creative'],
  relationshipStatus: 'Single and dating',
  whereAtInLife: ['Climbing the corporate ladder', 'Building a social life', 'Building healthier habits'],
  friendshipMatters: ['Ambitious/driven energy', 'Wellness-focused lifestyle', 'Up for spontaneous plans'],
  instagram: '@lena.creates',
  linkedin: 'https://www.linkedin.com/in/lena-creates/',
  prompts: [
    { question: 'This week I\'m probably…', answer: 'Exploring new coffee shops in Shoreditch or planning my next weekend escape' },
    { question: 'Favourite song right now', answer: 'Anything by Phoebe Bridgers on repeat' },
    { question: 'A small ritual I care about…', answer: 'Sunday morning yoga followed by a long walk through Victoria Park' },
  ],
};

export function MyProfile() {
  const [profileData, setProfileData] = useState<MyProfileData>(mockProfileData);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const handlePhotoUpload = (index: number) => {
    setSelectedPhotoIndex(index);
    // Trigger file input
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const newPhotos = [...profileData.photos];
          newPhotos[index] = event.target?.result as string;
          setProfileData({ ...profileData, photos: newPhotos });
        };
        reader.readAsDataURL(file);
      }
      setSelectedPhotoIndex(null);
    };
    input.click();
  };

  const toggleSection = (sectionId: string) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const handleSave = (field: keyof MyProfileData, value: string | string[]) => {
    setProfileData({ ...profileData, [field]: value });
    setEditingSection(null);
  };

  // Show settings screen
  if (showSettings) {
    return <Settings onClose={() => setShowSettings(false)} />;
  }

  // Render edit modal if editing
  if (editingSection === 'basic') {
    // For basic info, we'll need a more complex edit screen
    // For now, redirect to individual field edits
    // In a real app, you might want to create a combined edit screen
    return (
      <div className="max-w-md mx-auto min-h-screen bg-background">
        <div className="px-5 py-6 border-b border-border">
          <button
            onClick={() => setEditingSection(null)}
            className="text-sm"
            style={{ fontFamily: 'var(--font-sans)' }}
          >
            ← Back
          </button>
          <h1
            className="mt-4"
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.75rem',
              fontWeight: 500,
              lineHeight: '1.2',
            }}
          >
            Basic Information
          </h1>
        </div>
        <div className="px-5 py-6 space-y-4">
          <button
            onClick={() => setEditingSection('name')}
            className="w-full flex items-center justify-between p-4 border border-border rounded-lg"
          >
            <div className="text-left">
              <p className="text-sm text-muted-foreground mb-1" style={{ fontFamily: 'var(--font-sans)' }}>Name</p>
              <p style={{ fontFamily: 'var(--font-sans)' }}>{profileData.name}</p>
            </div>
            <ChevronRight size={20} />
          </button>
          <button
            onClick={() => setEditingSection('location')}
            className="w-full flex items-center justify-between p-4 border border-border rounded-lg"
          >
            <div className="text-left">
              <p className="text-sm text-muted-foreground mb-1" style={{ fontFamily: 'var(--font-sans)' }}>Location</p>
              <p style={{ fontFamily: 'var(--font-sans)' }}>{profileData.location}</p>
            </div>
            <ChevronRight size={20} />
          </button>
          <button
            onClick={() => setEditingSection('gender')}
            className="w-full flex items-center justify-between p-4 border border-border rounded-lg"
          >
            <div className="text-left">
              <p className="text-sm text-muted-foreground mb-1" style={{ fontFamily: 'var(--font-sans)' }}>Gender</p>
              <p style={{ fontFamily: 'var(--font-sans)' }}>{profileData.gender}</p>
            </div>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    );
  }

  if (editingSection === 'why') {
    return (
      <EditProfileSection
        title="Why you're here"
        type="multi-select"
        options={whyHereOptions}
        currentValue={profileData.whyHere}
        onSave={(value) => handleSave('whyHere', value)}
        onClose={() => setEditingSection(null)}
      />
    );
  }

  if (editingSection === 'week') {
    return (
      <EditProfileSection
        title="What you're doing this week"
        type="multi-select"
        options={thisWeekOptions}
        currentValue={profileData.thisWeek}
        onSave={(value) => handleSave('thisWeek', value)}
        onClose={() => setEditingSection(null)}
      />
    );
  }

  if (editingSection === 'rituals') {
    return (
      <EditProfileSection
        title="Your regular rituals"
        type="multi-select"
        options={regularRitualsOptions}
        currentValue={profileData.regularRituals}
        onSave={(value) => handleSave('regularRituals', value)}
        onClose={() => setEditingSection(null)}
      />
    );
  }

  if (editingSection === 'areas') {
    return (
      <EditProfileSection
        title="Where you spend time"
        type="multi-select"
        options={londonAreasOptions}
        currentValue={profileData.londonAreas}
        onSave={(value) => handleSave('londonAreas', value)}
        onClose={() => setEditingSection(null)}
        note="We'll prioritize matches near you - but you'll still see people across London."
      />
    );
  }

  if (editingSection === 'values') {
    return (
      <EditProfileSection
        title="Your values & lifestyle"
        type="multi-select"
        options={valuesOptions}
        currentValue={profileData.values}
        onSave={(value) => handleSave('values', value)}
        onClose={() => setEditingSection(null)}
      />
    );
  }

  if (editingSection === 'lifestyle') {
    return (
      <EditProfileSection
        title="Lifestyle preferences"
        type="multi-select"
        options={lifestyleOptions}
        currentValue={profileData.lifestyle}
        onSave={(value) => handleSave('lifestyle', value)}
        onClose={() => setEditingSection(null)}
      />
    );
  }

  if (editingSection === 'plans') {
    return (
      <EditProfileSection
        title="Upcoming plans"
        type="multi-select"
        options={upcomingPlansOptions}
        currentValue={profileData.upcomingPlans}
        onSave={(value) => handleSave('upcomingPlans', value)}
        onClose={() => setEditingSection(null)}
      />
    );
  }

  if (editingSection === 'ideal') {
    return (
      <EditProfileSection
        title="Ideal social week"
        type="single-select"
        options={idealWeekOptions}
        currentValue={profileData.idealWeek}
        onSave={(value) => handleSave('idealWeek', value)}
        onClose={() => setEditingSection(null)}
        note="Helps us match you with similar energy"
      />
    );
  }

  if (editingSection === 'words') {
    return (
      <EditProfileSection
        title="Words that describe you"
        type="multi-select"
        options={describeWordsOptions}
        currentValue={profileData.describeWords}
        onSave={(value) => handleSave('describeWords', value)}
        onClose={() => setEditingSection(null)}
        maxSelections={5}
      />
    );
  }

  if (editingSection === 'gender') {
    return (
      <EditProfileSection
        title="Gender"
        type="single-select"
        options={genderOptions}
        currentValue={profileData.gender}
        onSave={(value) => handleSave('gender', value)}
        onClose={() => setEditingSection(null)}
      />
    );
  }

  if (editingSection === 'relationship') {
    return (
      <EditProfileSection
        title="Relationship status"
        type="single-select"
        options={relationshipStatusOptions}
        currentValue={profileData.relationshipStatus}
        onSave={(value) => handleSave('relationshipStatus', value)}
        onClose={() => setEditingSection(null)}
      />
    );
  }

  if (editingSection === 'life') {
    return (
      <EditProfileSection
        title="Where you're at in life"
        type="multi-select"
        options={whereAtInLifeOptions}
        currentValue={profileData.whereAtInLife}
        onSave={(value) => handleSave('whereAtInLife', value)}
        onClose={() => setEditingSection(null)}
      />
    );
  }

  if (editingSection === 'friendship') {
    return (
      <EditProfileSection
        title="What matters in friendships"
        type="multi-select"
        options={friendshipMattersOptions}
        currentValue={profileData.friendshipMatters}
        onSave={(value) => handleSave('friendshipMatters', value)}
        onClose={() => setEditingSection(null)}
      />
    );
  }

  if (editingSection === 'name') {
    return (
      <EditProfileSection
        title="Name"
        type="text"
        currentValue={profileData.name}
        onSave={(value) => handleSave('name', value)}
        onClose={() => setEditingSection(null)}
      />
    );
  }

  if (editingSection === 'location') {
    return (
      <EditProfileSection
        title="Location"
        type="text"
        currentValue={profileData.location}
        onSave={(value) => handleSave('location', value)}
        onClose={() => setEditingSection(null)}
      />
    );
  }

  if (editingSection === 'instagram') {
    return (
      <EditProfileSection
        title="Instagram handle"
        type="text"
        currentValue={profileData.instagram}
        onSave={(value) => handleSave('instagram', value)}
        onClose={() => setEditingSection(null)}
      />
    );
  }

  if (editingSection === 'linkedin') {
    return (
      <EditProfileSection
        title="LinkedIn profile"
        type="text"
        currentValue={profileData.linkedin}
        onSave={(value) => handleSave('linkedin', value)}
        onClose={() => setEditingSection(null)}
      />
    );
  }

  if (editingSection === 'prompts') {
    return (
      <EditPrompts
        availablePrompts={promptOptions}
        currentPrompts={profileData.prompts}
        onSave={(value) => handleSave('prompts', value as any)}
        onClose={() => setEditingSection(null)}
      />
    );
  }

  return (
    <div className="max-w-md mx-auto pb-24">
      {/* Header */}
      <div className="px-5 py-6 border-b border-border flex items-center justify-between">
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.75rem',
            fontWeight: 500,
            lineHeight: '1.2',
          }}
        >
          My Profile
        </h1>
        <button
          onClick={() => setShowSettings(true)}
          className="p-2 hover:opacity-70 transition-opacity"
          aria-label="Settings"
        >
          <SettingsIcon size={24} />
        </button>
      </div>

      <div className="px-5 py-6 space-y-6">
        {/* Photos Section */}
        <div>
          <h2
            className="mb-3"
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.125rem',
              fontWeight: 500,
            }}
          >
            Photos
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {profileData.photos.map((photo, index) => (
              <button
                key={index}
                onClick={() => handlePhotoUpload(index)}
                className="aspect-square rounded-xl overflow-hidden bg-secondary border border-border hover:opacity-80 transition-opacity"
              >
                {photo ? (
                  <ImageWithFallback
                    src={photo}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Plus size={24} className="text-muted-foreground" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Basic Information */}
        <div className="border-t border-border pt-6">
          <button
            onClick={() => setEditingSection('basic')}
            className="w-full flex items-center justify-between mb-3"
          >
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.125rem',
                fontWeight: 500,
              }}
            >
              Basic Information
            </h2>
            <div className="flex items-center gap-2">
              <span
                className="text-muted-foreground"
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.75rem',
                }}
              >
                Visible
              </span>
              <ChevronRight
                size={20}
              />
            </div>
          </button>
          
          <div className="space-y-2" style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9375rem' }}>
            <p><span className="text-muted-foreground">Name:</span> {profileData.name}</p>
            <p><span className="text-muted-foreground">Age:</span> {profileData.age}</p>
            <p><span className="text-muted-foreground">Location:</span> {profileData.location}</p>
            <p><span className="text-muted-foreground">Gender:</span> {profileData.gender}</p>
          </div>
        </div>

        {/* Prompts */}
        <div className="border-t border-border pt-6">
          <button
            onClick={() => setEditingSection('prompts')}
            className="w-full flex items-center justify-between mb-3"
          >
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.125rem',
                fontWeight: 500,
              }}
            >
              Prompts
            </h2>
            <div className="flex items-center gap-2">
              <span
                className="text-muted-foreground"
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.75rem',
                }}
              >
                Visible
              </span>
              <ChevronRight
                size={20}
              />
            </div>
          </button>
          
          <div className="space-y-2" style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9375rem' }}>
            {profileData.prompts && profileData.prompts.length > 0 ? (
              <>
                {profileData.prompts.map((prompt, index) => (
                  <p key={index}>
                    <span className="text-muted-foreground">{prompt.question}</span>
                    <br />
                    {prompt.answer}
                  </p>
                ))}
              </>
            ) : (
              <p className="text-muted-foreground">No prompts added yet</p>
            )}
          </div>
        </div>

        {/* This Week */}
        <ProfileSection
          title="What you're doing this week"
          items={profileData.thisWeek}
          onEdit={() => setEditingSection('week')}
          isVisible={true}
        />

        {/* Regular Rituals */}
        <ProfileSection
          title="Your regular rituals"
          items={profileData.regularRituals}
          onEdit={() => setEditingSection('rituals')}
          isVisible={true}
        />

        {/* Why You're Here */}
        <ProfileSection
          title="Why you're here"
          items={profileData.whyHere}
          onEdit={() => setEditingSection('why')}
          isVisible={false}
        />

        {/* London Areas */}
        <ProfileSection
          title="Where you spend time"
          items={profileData.londonAreas}
          onEdit={() => setEditingSection('areas')}
          isVisible={false}
        />

        {/* Values & Lifestyle */}
        <ProfileSection
          title="Your values & lifestyle"
          items={profileData.values}
          onEdit={() => setEditingSection('values')}
          isVisible={false}
        />

        {/* Lifestyle Preferences */}
        <ProfileSection
          title="Lifestyle preferences"
          items={profileData.lifestyle}
          onEdit={() => setEditingSection('lifestyle')}
          isVisible={false}
        />

        {/* Upcoming Plans */}
        <ProfileSection
          title="Upcoming plans"
          items={profileData.upcomingPlans}
          onEdit={() => setEditingSection('plans')}
          isVisible={false}
        />

        {/* Ideal Week */}
        <div className="border-t border-border pt-6">
          <button
            onClick={() => setEditingSection('ideal')}
            className="w-full flex items-center justify-between mb-3"
          >
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.125rem',
                fontWeight: 500,
              }}
            >
              Ideal social week
            </h2>
            <div className="flex items-center gap-2">
              <span
                className="text-muted-foreground"
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.75rem',
                }}
              >
                Hidden
              </span>
              <ChevronRight
                size={20}
              />
            </div>
          </button>
          
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9375rem' }}>
            {profileData.idealWeek}
          </p>
        </div>

        {/* Describe Words */}
        <ProfileSection
          title="Words that describe you"
          items={profileData.describeWords}
          onEdit={() => setEditingSection('words')}
        />

        {/* Relationship Status */}
        <div className="border-t border-border pt-6">
          <button
            onClick={() => setEditingSection('relationship')}
            className="w-full flex items-center justify-between mb-3"
          >
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.125rem',
                fontWeight: 500,
              }}
            >
              Relationship status
            </h2>
            <div className="flex items-center gap-2">
              <span
                className="text-muted-foreground"
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.75rem',
                }}
              >
                Hidden
              </span>
              <ChevronRight
                size={20}
              />
            </div>
          </button>
          
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9375rem' }}>
            {profileData.relationshipStatus}
          </p>
        </div>

        {/* Where at in Life */}
        <ProfileSection
          title="Where you're at in life"
          items={profileData.whereAtInLife}
          onEdit={() => setEditingSection('life')}
        />

        {/* Friendship Matters */}
        <ProfileSection
          title="What matters in friendships"
          items={profileData.friendshipMatters}
          onEdit={() => setEditingSection('friendship')}
        />

        {/* Social Verification */}
        <div className="border-t border-border pt-6">
          <div className="flex items-center justify-between mb-3">
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.125rem',
                fontWeight: 500,
              }}
            >
              Social verification
            </h2>
            <div className="flex items-center gap-2">
              <span
                className="text-muted-foreground"
                style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.75rem',
                }}
              >
                Hidden
              </span>
            </div>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => setEditingSection('instagram')}
              className="w-full flex items-center justify-between p-3 border border-border rounded-lg hover:bg-secondary transition-colors"
            >
              <div className="text-left">
                <p className="text-muted-foreground text-sm mb-0.5" style={{ fontFamily: 'var(--font-sans)' }}>Instagram</p>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9375rem' }}>{profileData.instagram}</p>
              </div>
              <ChevronRight size={20} />
            </button>
            
            <button
              onClick={() => setEditingSection('linkedin')}
              className="w-full flex items-center justify-between p-3 border border-border rounded-lg hover:bg-secondary transition-colors"
            >
              <div className="text-left">
                <p className="text-muted-foreground text-sm mb-0.5" style={{ fontFamily: 'var(--font-sans)' }}>LinkedIn</p>
                <p style={{ fontFamily: 'var(--font-sans)', fontSize: '0.9375rem' }} className="truncate max-w-[200px]">{profileData.linkedin}</p>
              </div>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ProfileSectionProps {
  title: string;
  items: string[];
  onEdit: () => void;
  isVisible?: boolean;
}

function ProfileSection({ title, items, onEdit, isVisible = false }: ProfileSectionProps) {
  return (
    <div className="border-t border-border pt-6">
      <button
        onClick={onEdit}
        className="w-full flex items-center justify-between mb-3"
      >
        <h2
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: '1.125rem',
            fontWeight: 500,
          }}
        >
          {title}
        </h2>
        <div className="flex items-center gap-2">
          <span
            className="text-muted-foreground"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.75rem',
            }}
          >
            {isVisible ? 'Visible' : 'Hidden'}
          </span>
          <ChevronRight
            size={20}
          />
        </div>
      </button>

      <div className="flex flex-wrap gap-2">
        {items.map((item, index) => (
          <span
            key={index}
            className="bg-secondary border border-border px-3 py-1.5 rounded-full"
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: '0.875rem',
            }}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}