import Logo from './Logo';

export default function SubcategoryScreen({ settings, category, onSelectSubcategory }) {
  return (
    <div className="screen-enter flex flex-col min-h-full px-8 pt-16 pb-40">
      <div className="flex justify-center mb-10" style={{ color: 'var(--accent)' }}>
        <Logo letter={settings.logoLetter} image={settings.logoImage} size={80} />
      </div>

      <p className="text-center font-heading text-sm tracking-widest uppercase mb-6" style={{ color: 'var(--muted)' }}>
        {category.label}
      </p>
      <div className="h-[3px] w-full rounded-full mb-10" style={{ backgroundColor: 'var(--muted)', opacity: 0.4 }} />

      <nav className="flex flex-col items-center gap-8">
        {category.subcategories.map((sub, idx) => (
          <button
            key={sub.id}
            onClick={() => onSelectSubcategory(sub)}
            className={`font-heading transition-opacity active:opacity-60 ${idx === 0 ? 'text-3xl font-bold' : 'text-2xl font-semibold'}`}
            style={{ color: idx === 0 ? 'var(--text)' : 'var(--muted)' }}
          >
            {sub.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
