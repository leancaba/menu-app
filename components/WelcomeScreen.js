import Logo from './Logo';

export default function WelcomeScreen({ settings, categories, onSelectCategory }) {
  return (
    <div className="screen-enter flex flex-col min-h-full px-8 pt-16 pb-40">
      <div className="flex justify-center mb-10" style={{ color: 'var(--accent)' }}>
        <Logo letter={settings.logoLetter} image={settings.logoImage} size={92} />
      </div>

      <h1 className="font-heading text-4xl font-extrabold leading-tight mb-4">
        {settings.welcomeTitle}
      </h1>
      <div className="h-[3px] w-24 rounded-full mb-10" style={{ backgroundColor: 'var(--text)' }} />

      <nav className="flex flex-col gap-7">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat)}
            className={`text-left font-heading transition-opacity active:opacity-60 ${
              cat.featured ? 'text-3xl font-bold' : 'text-2xl font-semibold'
            }`}
            style={{ color: cat.featured ? 'var(--text)' : 'var(--muted)' }}
          >
            {cat.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
