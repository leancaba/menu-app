'use client';
import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'menu-digital-cart';

export function useCart() {
  const [items, setItems] = useState([]); // [{productId, qty}]

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch (e) {
      // ignora almacenamiento no disponible
    }
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      // ignora almacenamiento no disponible
    }
  }, [items]);

  const add = useCallback((productId) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === productId);
      if (existing) {
        return prev.map((i) => (i.productId === productId ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { productId, qty: 1 }];
    });
  }, []);

  const removeOne = useCallback((productId) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === productId);
      if (!existing) return prev;
      if (existing.qty <= 1) return prev.filter((i) => i.productId !== productId);
      return prev.map((i) => (i.productId === productId ? { ...i, qty: i.qty - 1 } : i));
    });
  }, []);

  const removeAll = useCallback((productId) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const count = items.reduce((sum, i) => sum + i.qty, 0);

  return { items, add, removeOne, removeAll, clear, count };
}
