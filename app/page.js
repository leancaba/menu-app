'use client';
import { useEffect, useState } from 'react';
import WelcomeScreen from '../components/WelcomeScreen';
import SubcategoryScreen from '../components/SubcategoryScreen';
import ProductScreen from '../components/ProductScreen';
import BottomBar from '../components/BottomBar';
import OrderSheet from '../components/OrderSheet';
import { useCart } from '../lib/useCart';
import { themeStyle } from '../lib/theme';

export default function HomePage() {
  const [menu, setMenu] = useState(null);
  const [step, setStep] = useState({ screen: 'welcome' });
  const [orderOpen, setOrderOpen] = useState(false);
  const cart = useCart();

  useEffect(() => {
    fetch('/api/menu')
      .then((r) => r.json())
      .then(setMenu)
      .catch(() => setMenu(null));
  }, []);

  if (!menu) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1B140F] text-[#F6EFE4]">
        Cargando carta...
      </div>
    );
  }

  const { settings, categories, products } = menu;

  function selectCategory(cat) {
    if (cat.subcategories && cat.subcategories.length > 0) {
      setStep({ screen: 'subcategory', categoryId: cat.id });
    } else {
      setStep({ screen: 'products', categoryId: cat.id, subcategoryId: null });
    }
  }

  function selectSubcategory(sub) {
    setStep((prev) => ({ screen: 'products', categoryId: prev.categoryId, subcategoryId: sub.id }));
  }

  function goBack() {
    if (step.screen === 'products') {
      const cat = categories.find((c) => c.id === step.categoryId);
      if (cat && cat.subcategories && cat.subcategories.length > 0) {
        setStep({ screen: 'subcategory', categoryId: step.categoryId });
        return;
      }
      setStep({ screen: 'welcome' });
      return;
    }
    if (step.screen === 'subcategory') {
      setStep({ screen: 'welcome' });
    }
  }

  let content = null;
  let showBack = false;

  if (step.screen === 'welcome') {
    content = <WelcomeScreen settings={settings} categories={categories} onSelectCategory={selectCategory} />;
  } else if (step.screen === 'subcategory') {
    const cat = categories.find((c) => c.id === step.categoryId);
    content = <SubcategoryScreen settings={settings} category={cat} onSelectSubcategory={selectSubcategory} />;
    showBack = true;
  } else if (step.screen === 'products') {
    const cat = categories.find((c) => c.id === step.categoryId);
    const sub = cat?.subcategories?.find((s) => s.id === step.subcategoryId);
    const list = products.filter(
      (p) => p.categoryId === step.categoryId && (!step.subcategoryId || p.subcategoryId === step.subcategoryId)
    );
    content = (
      <ProductScreen
        settings={settings}
        title={sub ? sub.label : cat.label}
        products={list}
        onAdd={cart.add}
      />
    );
    showBack = true;
  }

  return (
    <main className="min-h-screen font-body" style={themeStyle(settings)}>
      {content}
      <BottomBar onBack={showBack ? goBack : null} onOpenOrder={() => setOrderOpen(true)} count={cart.count} />
      {orderOpen && (
        <OrderSheet
          settings={settings}
          items={cart.items}
          products={products}
          onClose={() => setOrderOpen(false)}
          onRemove={cart.removeOne}
        />
      )}
    </main>
  );
}
