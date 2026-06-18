import { useState, useMemo } from 'react';
import type { Ingredient } from '../types';
import { INGREDIENT_CATEGORIES } from '../types';
import { useStore, STORAGE_KEYS } from '../store/useStore';
import IngredientCard from '../components/IngredientCard';
import AddIngredientForm from '../components/AddIngredientForm';

const ALL_TABS = ['全部', ...INGREDIENT_CATEGORIES];

export default function FridgePage() {
  const { items, add, update, remove } = useStore<Ingredient>(STORAGE_KEYS.ingredients);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('全部');
  const [showAddForm, setShowAddForm] = useState(false);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch = !search || item.name.includes(search);
      const matchCategory = activeTab === '全部' || item.category === activeTab;
      return matchSearch && matchCategory;
    });
  }, [items, search, activeTab]);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="px-4 pt-4 pb-2">
          <h1 className="text-xl font-bold text-gray-800 mb-3">🧊 我的冰箱</h1>
          {/* Search bar */}
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索食材..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-100 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-green-200 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Category tabs */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar px-4 py-2.5">
          {ALL_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeTab === tab
                  ? 'bg-green-500 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Ingredient grid */}
      <div className="px-4 pt-4">
        {filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="text-5xl mb-4">🛒</p>
            <p className="text-gray-400 text-sm">
              {search || activeTab !== '全部'
                ? '没有找到匹配的食材'
                : '冰箱空了，快去添加食材吧 🛒'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredItems.map((item) => (
              <IngredientCard
                key={item.id}
                ingredient={item}
                onUpdate={update}
                onRemove={remove}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating add button */}
      <button
        onClick={() => setShowAddForm(true)}
        className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-green-500 text-white text-2xl shadow-lg flex items-center justify-center active:bg-green-600 active:scale-95 transition-transform z-40"
      >
        +
      </button>

      {/* Add ingredient form */}
      <AddIngredientForm
        isOpen={showAddForm}
        onClose={() => setShowAddForm(false)}
        onAdd={add}
      />
    </div>
  );
}
