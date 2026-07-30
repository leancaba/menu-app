'use client';
import { useEffect, useRef, useState } from 'react';

const MAX_IMAGE_BYTES = 1.5 * 1024 * 1024;
const FONT_OPTIONS = ['Sora', 'Work Sans', 'Poppins', 'Plus Jakarta Sans', 'Fraunces', 'Inter'];
const ICON_OPTIONS = ['coffee', 'juice', 'pastry', 'sandwich', 'sparkle', 'plate'];

function uid(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  const [menu, setMenu] = useState(null);
  const [tab, setTab] = useState('apariencia');
  const [status, setStatus] = useState(null); // {type: 'ok'|'error', text}
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('menu-admin-authed') === '1') setAuthed(true);
  }, []);

  useEffect(() => {
    if (!authed) return;
    fetch('/api/menu')
      .then((r) => r.json())
      .then(setMenu);
  }, [authed]);

  async function handleLogin(e) {
    e.preventDefault();
    setAuthError('');
    const res = await fetch('/api/admin-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      sessionStorage.setItem('menu-admin-authed', '1');
      setAuthed(true);
    } else {
      setAuthError('Contraseña incorrecta');
    }
  }

  async function handleSave() {
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch('/api/menu', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(menu),
      });

      const raw = await res.text();
      let data = null;
      try {
        data = raw ? JSON.parse(raw) : null;
      } catch (parseErr) {
        // El servidor respondió algo que no es JSON (por ejemplo una página de
        // error del hosting por payload demasiado grande, o un timeout).
        setStatus({
          type: 'error',
          text: `El servidor respondió con un error inesperado (código ${res.status}). Si acabás de subir una imagen grande, probá con una más liviana. Detalle técnico: ${raw.slice(0, 200) || 'sin cuerpo de respuesta'}`,
        });
        return;
      }

      if (!res.ok) {
        setStatus({ type: 'error', text: (data && data.error) || `No se pudo guardar (código ${res.status}).` });
   } else if (data && (data.mode === 'file' || data.mode === 'kv' || data.mode === 'redis')) {
        setStatus({ type: 'ok', text: 'Cambios guardados correctamente.' });
      } else {
        setStatus({
          type: 'error',
          text: 'Los cambios se aplicaron en esta sesión pero no se pudieron guardar de forma permanente (entorno de solo lectura). Conectá un almacenamiento persistente antes de mostrarlo en producción.',
        });
      }
    } catch (e) {
      setStatus({
        type: 'error',
        text: `No se pudo contactar al servidor (${e?.message || 'error desconocido'}). Revisá tu conexión o si el servidor sigue corriendo.`,
      });
    } finally {
      setSaving(false);
    }
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white px-6">
        <form onSubmit={handleLogin} className="w-full max-w-sm bg-neutral-900 rounded-2xl p-8">
          <h1 className="text-xl font-bold mb-1">Panel de administración</h1>
          <p className="text-neutral-400 text-sm mb-6">Ingresá la contraseña para editar la carta.</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Contraseña"
            className="w-full rounded-lg bg-neutral-800 px-4 py-3 mb-3 outline-none focus:ring-2 focus:ring-amber-500"
          />
          {authError && <p className="text-red-400 text-sm mb-3">{authError}</p>}
          <button type="submit" className="w-full bg-amber-500 text-neutral-900 font-semibold rounded-lg py-3">
            Entrar
          </button>
        </form>
      </div>
    );
  }

  if (!menu) {
    return <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white pb-32">
      <header className="sticky top-0 z-10 bg-neutral-950/95 backdrop-blur border-b border-neutral-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-bold">Administrar carta</h1>
        <div className="flex gap-2">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="text-sm px-4 py-2 rounded-lg border border-neutral-700 hover:bg-neutral-800"
          >
            Ver menú
          </a>
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-sm px-5 py-2 rounded-lg bg-amber-500 text-neutral-900 font-semibold disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </header>

      {status && (
        <div
          className={`mx-6 mt-4 rounded-lg px-4 py-3 text-sm ${
            status.type === 'ok' ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
          }`}
        >
          {status.text}
        </div>
      )}

      <nav className="flex gap-2 px-6 mt-6 mb-6 overflow-x-auto no-scrollbar">
        {[
          ['apariencia', 'Apariencia'],
          ['categorias', 'Categorías'],
          ['productos', 'Productos'],
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
              tab === key ? 'bg-white text-neutral-900' : 'bg-neutral-800 text-neutral-300'
            }`}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className="px-6">
        {tab === 'apariencia' && <AparienciaTab menu={menu} setMenu={setMenu} />}
        {tab === 'categorias' && <CategoriasTab menu={menu} setMenu={setMenu} />}
        {tab === 'productos' && <ProductosTab menu={menu} setMenu={setMenu} />}
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="text-neutral-400">{label}</span>
      {children}
    </label>
  );
}

function TextInput(props) {
  return (
    <input
      {...props}
      className="rounded-lg bg-neutral-800 px-3 py-2.5 outline-none focus:ring-2 focus:ring-amber-500 text-white"
    />
  );
}

function ColorInput({ value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="w-10 h-10 rounded bg-transparent" />
      <TextInput value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

function AparienciaTab({ menu, setMenu }) {
  const [imgError, setImgError] = useState('');
  const fileRef = useRef(null);
  const s = menu.settings;

  function update(patch) {
    setMenu({ ...menu, settings: { ...s, ...patch } });
  }

  async function handleLogoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) {
      setImgError('La imagen supera 1.5 MB. Elegí un archivo más liviano.');
      return;
    }
    setImgError('');
    const dataUrl = await readFileAsDataUrl(file);
    update({ logoImage: dataUrl });
  }

  return (
    <div className="max-w-xl flex flex-col gap-5 pb-10">
      <Field label="Nombre del local">
        <TextInput value={s.brandName} onChange={(e) => update({ brandName: e.target.value })} />
      </Field>

      <Field label="Título de bienvenida">
        <TextInput value={s.welcomeTitle} onChange={(e) => update({ welcomeTitle: e.target.value })} />
      </Field>

      <Field label="Letra del isotipo (si no hay imagen de logo)">
        <TextInput maxLength={2} value={s.logoLetter} onChange={(e) => update({ logoLetter: e.target.value })} />
      </Field>

      <Field label="Logo (imagen, máx. 1.5 MB)">
        <div className="flex items-center gap-3">
          {s.logoImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={s.logoImage} alt="Logo" className="w-14 h-14 object-contain rounded bg-neutral-800" />
          )}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="px-4 py-2 rounded-lg border border-neutral-700 text-sm"
          >
            Subir imagen
          </button>
          {s.logoImage && (
            <button type="button" onClick={() => update({ logoImage: null })} className="text-sm text-red-400">
              Quitar
            </button>
          )}
        </div>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
        {imgError && <span className="text-red-400 text-xs">{imgError}</span>}
      </Field>

      <Field label="Símbolo de moneda">
        <TextInput maxLength={3} value={s.currency} onChange={(e) => update({ currency: e.target.value })} />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Color de fondo">
          <ColorInput value={s.bgColor} onChange={(v) => update({ bgColor: v })} />
        </Field>
        <Field label="Color de superficies (tarjetas)">
          <ColorInput value={s.surfaceColor} onChange={(v) => update({ surfaceColor: v })} />
        </Field>
        <Field label="Color de texto">
          <ColorInput value={s.textColor} onChange={(v) => update({ textColor: v })} />
        </Field>
        <Field label="Color secundario / muted">
          <ColorInput value={s.mutedColor} onChange={(v) => update({ mutedColor: v })} />
        </Field>
        <Field label="Color de acento">
          <ColorInput value={s.accentColor} onChange={(v) => update({ accentColor: v })} />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Tipografía de títulos">
          <select
            value={s.fontHeading}
            onChange={(e) => update({ fontHeading: e.target.value })}
            className="rounded-lg bg-neutral-800 px-3 py-2.5"
          >
            {FONT_OPTIONS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Tipografía de texto">
          <select
            value={s.fontBody}
            onChange={(e) => update({ fontBody: e.target.value })}
            className="rounded-lg bg-neutral-800 px-3 py-2.5"
          >
            {FONT_OPTIONS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <p className="text-xs text-neutral-500">
        Para usar una tipografía nueva agregá su enlace de Google Fonts en app/layout.js.
      </p>
    </div>
  );
}

function CategoriasTab({ menu, setMenu }) {
  function updateCategory(id, patch) {
    setMenu({
      ...menu,
      categories: menu.categories.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    });
  }

  function addCategory() {
    setMenu({
      ...menu,
      categories: [...menu.categories, { id: uid('cat'), label: 'Nueva categoría', featured: false, subcategories: [] }],
    });
  }

  function removeCategory(id) {
    if (!confirm('¿Eliminar esta categoría y sus productos asociados?')) return;
    setMenu({
      ...menu,
      categories: menu.categories.filter((c) => c.id !== id),
      products: menu.products.filter((p) => p.categoryId !== id),
    });
  }

  function addSubcategory(catId) {
    updateCategory(catId, {
      subcategories: [
        ...menu.categories.find((c) => c.id === catId).subcategories,
        { id: uid('sub'), label: 'Nueva subcategoría' },
      ],
    });
  }

  function updateSubcategory(catId, subId, patch) {
    const cat = menu.categories.find((c) => c.id === catId);
    updateCategory(catId, {
      subcategories: cat.subcategories.map((s) => (s.id === subId ? { ...s, ...patch } : s)),
    });
  }

  function removeSubcategory(catId, subId) {
    const cat = menu.categories.find((c) => c.id === catId);
    updateCategory(catId, { subcategories: cat.subcategories.filter((s) => s.id !== subId) });
  }

  return (
    <div className="max-w-2xl flex flex-col gap-6 pb-10">
      {menu.categories.map((cat) => (
        <div key={cat.id} className="rounded-2xl bg-neutral-900 p-5">
          <div className="flex items-center gap-3 mb-3">
            <TextInput value={cat.label} onChange={(e) => updateCategory(cat.id, { label: e.target.value })} />
            <label className="flex items-center gap-2 text-xs text-neutral-400 whitespace-nowrap">
              <input
                type="checkbox"
                checked={cat.featured}
                onChange={(e) => updateCategory(cat.id, { featured: e.target.checked })}
              />
              Destacada
            </label>
            <button onClick={() => removeCategory(cat.id)} className="text-red-400 text-sm whitespace-nowrap">
              Eliminar
            </button>
          </div>

          <div className="pl-3 border-l-2 border-neutral-800 flex flex-col gap-2">
            {cat.subcategories.map((sub) => (
              <div key={sub.id} className="flex items-center gap-2">
                <TextInput
                  value={sub.label}
                  onChange={(e) => updateSubcategory(cat.id, sub.id, { label: e.target.value })}
                />
                <button
                  onClick={() => removeSubcategory(cat.id, sub.id)}
                  className="text-red-400 text-sm whitespace-nowrap"
                >
                  Quitar
                </button>
              </div>
            ))}
            <button onClick={() => addSubcategory(cat.id)} className="text-amber-400 text-sm text-left mt-1">
              + Agregar subcategoría
            </button>
          </div>
        </div>
      ))}

      <button onClick={addCategory} className="rounded-2xl border-2 border-dashed border-neutral-700 py-4 text-neutral-400">
        + Agregar categoría
      </button>
    </div>
  );
}

function ProductosTab({ menu, setMenu }) {
  function updateProduct(id, patch) {
    setMenu({ ...menu, products: menu.products.map((p) => (p.id === id ? { ...p, ...patch } : p)) });
  }

  function removeProduct(id) {
    if (!confirm('¿Eliminar este producto?')) return;
    setMenu({ ...menu, products: menu.products.filter((p) => p.id !== id) });
  }

  function addProduct() {
    const firstCat = menu.categories[0];
    setMenu({
      ...menu,
      products: [
        ...menu.products,
        {
          id: uid('prod'),
          categoryId: firstCat?.id || '',
          subcategoryId: firstCat?.subcategories?.[0]?.id || null,
          name: 'Nuevo producto',
          description: '',
          price: 0,
          image: null,
          icon: 'plate',
        },
      ],
    });
  }

  return (
    <div className="max-w-2xl flex flex-col gap-4 pb-10">
      {menu.products.map((p) => (
        <ProductRow key={p.id} product={p} menu={menu} onChange={(patch) => updateProduct(p.id, patch)} onRemove={() => removeProduct(p.id)} />
      ))}
      <button onClick={addProduct} className="rounded-2xl border-2 border-dashed border-neutral-700 py-4 text-neutral-400">
        + Agregar producto
      </button>
    </div>
  );
}

function ProductRow({ product, menu, onChange, onRemove }) {
  const [imgError, setImgError] = useState('');
  const fileRef = useRef(null);
  const category = menu.categories.find((c) => c.id === product.categoryId);

  async function handleImageUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_IMAGE_BYTES) {
      setImgError('La imagen supera 1.5 MB.');
      return;
    }
    setImgError('');
    const dataUrl = await readFileAsDataUrl(file);
    onChange({ image: dataUrl });
  }

  return (
    <div className="rounded-2xl bg-neutral-900 p-5 flex flex-col gap-3">
      <div className="flex gap-3">
        <TextInput className="flex-1" value={product.name} onChange={(e) => onChange({ name: e.target.value })} />
        <input
          type="number"
          value={product.price}
          onChange={(e) => onChange({ price: Number(e.target.value) })}
          className="w-28 rounded-lg bg-neutral-800 px-3 py-2.5"
        />
      </div>

      <textarea
        value={product.description}
        onChange={(e) => onChange({ description: e.target.value })}
        placeholder="Descripción"
        rows={2}
        className="rounded-lg bg-neutral-800 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-amber-500"
      />

      <div className="grid grid-cols-2 gap-3">
        <select
          value={product.categoryId}
          onChange={(e) => onChange({ categoryId: e.target.value, subcategoryId: null })}
          className="rounded-lg bg-neutral-800 px-3 py-2.5 text-sm"
        >
          {menu.categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>

        <select
          value={product.subcategoryId || ''}
          onChange={(e) => onChange({ subcategoryId: e.target.value || null })}
          className="rounded-lg bg-neutral-800 px-3 py-2.5 text-sm"
          disabled={!category?.subcategories?.length}
        >
          <option value="">Sin subcategoría</option>
          {category?.subcategories?.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={product.icon}
          onChange={(e) => onChange({ icon: e.target.value })}
          className="rounded-lg bg-neutral-800 px-3 py-2.5 text-sm"
        >
          {ICON_OPTIONS.map((i) => (
            <option key={i} value={i}>
              Ícono: {i}
            </option>
          ))}
        </select>

        {product.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded-lg" />
        )}
        <button type="button" onClick={() => fileRef.current?.click()} className="px-4 py-2 rounded-lg border border-neutral-700 text-sm">
          Subir foto
        </button>
        {product.image && (
          <button type="button" onClick={() => onChange({ image: null })} className="text-red-400 text-sm">
            Quitar foto
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
        <button onClick={onRemove} className="ml-auto text-red-400 text-sm">
          Eliminar producto
        </button>
      </div>
      {imgError && <span className="text-red-400 text-xs">{imgError}</span>}
    </div>
  );
}
