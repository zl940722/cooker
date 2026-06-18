import { useState, useEffect, useCallback } from 'react';

function load<T>(key: string): T[] {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
}

function save<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function useStore<T extends { id: string }>(storageKey: string) {
  const [items, setItems] = useState<T[]>(() => load<T>(storageKey));

  useEffect(() => { save(storageKey, items); }, [items, storageKey]);

  const add = useCallback((item: T) => {
    setItems(prev => [...prev, item]);
  }, []);

  const update = useCallback((id: string, changes: Partial<T>) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, ...changes } : item
    ));
  }, []);

  const remove = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  return { items, add, update, remove, setItems };
}

export const STORAGE_KEYS = {
  members: 'fmp_members',
  ingredients: 'fmp_ingredients',
  recipes: 'fmp_recipes',
  menus: 'fmp_menus',
};
