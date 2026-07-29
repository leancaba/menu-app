'use client';
import { formatPrice } from '../lib/theme';

export default function OrderSheet({ settings, items, products, onClose, onRemove }) {
  const lines = items
    .map((it) => {
      const product = products.find((p) => p.id === it.productId);
      if (!product) return null;
      return { ...it, product };
    })
    .filter(Boolean);

  const total = lines.reduce((sum, l) => sum + l.product.price * l.qty, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div
        className="absolute inset-0"
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        onClick={onClose}
      />
      <div
        className="sheet-up relative w-full max-w-md rounded-t-[2.5rem] px-7 pt-6 pb-8 max-h-[75vh] flex flex-col"
        style={{ backgroundColor: 'var(--surface)', color: 'var(--text)' }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading text-2xl font-bold">Mi pedido</h2>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="w-9 h-9 rounded-lg border-2 flex items-center justify-center active:scale-90 transition-transform"
            style={{ borderColor: 'var(--muted)' }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M2 2l12 12M14 2L2 14" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar">
          {lines.length === 0 ? (
            <p style={{ color: 'var(--muted)' }}>Todavía no agregaste productos. Tocá el + junto a cada plato para sumarlo a tu pedido.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {lines.map((l) => (
                <li key={l.productId} className="flex items-center gap-3">
                  <button
                    onClick={() => onRemove(l.productId)}
                    aria-label={`Quitar ${l.product.name}`}
                    className="font-bold text-lg active:scale-90 transition-transform"
                    style={{ color: 'var(--accent)' }}
                  >
                    ✕
                  </button>
                  <span className="flex-1 font-medium">
                    {l.qty > 1 ? `${l.qty}x ` : ''}
                    {l.product.name}
                  </span>
                  <span className="font-heading font-semibold">
                    {formatPrice(l.product.price * l.qty, settings.currency)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between pt-5 mt-3 border-t" style={{ borderColor: 'var(--muted)', opacity: lines.length ? 1 : 0.5 }}>
          <span className="font-heading text-sm tracking-widest uppercase" style={{ color: 'var(--muted)' }}>
            Total
          </span>
          <span className="font-heading text-2xl font-extrabold">{formatPrice(total, settings.currency)}</span>
        </div>
      </div>
    </div>
  );
}
