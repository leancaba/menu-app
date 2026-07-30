export default function BottomBar({ onBack, onOpenOrder, count }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-between items-center gap-3 px-6 pb-6 pt-10 pointer-events-none bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/90 to-transparent">
      {onBack ? (
        <button
          onClick={onBack}
          aria-label="Volver"
          className="pointer-events-auto flex items-center justify-center w-14 h-14 rounded-full border-2 shrink-0 active:scale-95 transition-transform"
          style={{ borderColor: 'var(--muted)', color: 'var(--text)' }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M11 6l-6 6 6 6" />
          </svg>
        </button>
      ) : (
        <span />
      )}

      <button
        onClick={onOpenOrder}
        className="pointer-events-auto relative flex items-center gap-2 px-7 py-4 rounded-full font-heading font-semibold shadow-lg active:scale-95 transition-transform"
        style={{ backgroundColor: 'var(--accent)', color: 'var(--bg)' }}
      >
        Mi pedido
        {count > 0 && (
          <span
            className="absolute -top-2 -right-2 min-w-[26px] h-[26px] px-1 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ backgroundColor: 'var(--bg)', color: 'var(--accent)', border: '2px solid var(--accent)' }}
          >
            {count}
          </span>
        )}
      </button>
    </div>
  );
}
