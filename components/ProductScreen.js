'use client';
import { useState } from 'react';
import Logo from './Logo';
import ProductIcon from './ProductIcon';
import { formatPrice } from '../lib/theme';

export default function ProductScreen({ settings, title, products, onAdd }) {
  const [expandedId, setExpandedId] = useState(null);

  return (
    <div className="screen-enter flex flex-col min-h-full pt-14 pb-44">
      <div className="px-8">
        <div className="flex justify-center mb-8" style={{ color: 'var(--accent)' }}>
          <Logo letter={settings.logoLetter} image={settings.logoImage} size={64} />
        </div>
        <p className="text-xs tracking-widest uppercase mb-2" style={{ color: 'var(--muted)' }}>
          agregar a tu pedido
        </p>
        <div className="h-[3px] w-full rounded-full mb-2" style={{ backgroundColor: 'var(--muted)', opacity: 0.4 }} />
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-8">
        {products.length === 0 && (
          <p className="mt-10 text-center" style={{ color: 'var(--muted)' }}>
            Todavía no hay productos cargados en esta sección.
          </p>
        )}

        {products.map((p) => {
          const isOpen = expandedId === p.id;
          return (
            <div key={p.id} className="border-b py-4" style={{ borderColor: 'var(--muted)', borderOpacity: 0.2 }}>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onAdd(p.id)}
                  aria-label={`Agregar ${p.name}`}
                  className="w-8 h-8 rounded-md border-2 flex items-center justify-center shrink-0 active:scale-90 transition-transform font-bold text-lg"
                  style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
                >
                  +
                </button>

                <button
                  onClick={() => setExpandedId(isOpen ? null : p.id)}
                  className="flex-1 flex items-center justify-between text-left gap-3"
                >
                  <span className={`font-heading text-lg ${isOpen ? 'font-bold' : 'font-semibold'}`} style={{ color: isOpen ? 'var(--text)' : 'var(--muted)' }}>
                    {p.name}
                  </span>
                  <span className="flex items-center gap-2 shrink-0" style={{ color: 'var(--muted)' }}>
                    <svg width="34" height="10" viewBox="0 0 34 10" fill="none">
                      <path d="M0 5h30M25 1l5 4-5 4" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                    <span className="font-heading font-bold" style={{ color: 'var(--text)' }}>
                      {formatPrice(p.price, settings.currency)}
                    </span>
                  </span>
                </button>
              </div>

              {isOpen && (
                <div className="rise-in mt-3 ml-11">
                  {p.description && (
                    <p className="text-sm mb-3" style={{ color: 'var(--muted)' }}>
                      {p.description}
                    </p>
                  )}
                  <div
                    className="rounded-2xl h-40 flex items-center justify-center overflow-hidden"
                    style={{ backgroundColor: 'var(--surface)' }}
                  >
                    {p.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <div style={{ color: 'var(--accent)' }}>
                        <ProductIcon icon={p.icon} size={80} />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
