import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Ingredient } from '../types';
import { INGREDIENT_CATEGORIES, COMMON_INGREDIENTS } from '../types';

interface AddIngredientFormProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (ingredient: Ingredient) => void;
}

const UNIT_OPTIONS = ['个', 'g', 'ml', '包', '根', '块'];

const generateId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export default function AddIngredientForm({ isOpen, onClose, onAdd }: AddIngredientFormProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<string>(INGREDIENT_CATEGORIES[0]);
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState(UNIT_OPTIONS[0]);
  const [quickCategory, setQuickCategory] = useState<string>(INGREDIENT_CATEGORIES[0]);

  const resetForm = () => {
    setName('');
    setCategory(INGREDIENT_CATEGORIES[0]);
    setQuantity(1);
    setUnit(UNIT_OPTIONS[0]);
  };

  const handleQuickSelect = (ingredientName: string) => {
    // Determine category for the selected ingredient
    let foundCategory = '其他';
    for (const [cat, items] of Object.entries(COMMON_INGREDIENTS)) {
      if (items.includes(ingredientName)) {
        foundCategory = cat;
        break;
      }
    }
    onAdd({
      id: generateId(),
      name: ingredientName,
      category: foundCategory as Ingredient['category'],
      quantity: 1,
      unit: '个',
      addedAt: Date.now(),
    });
  };

  const handleSubmit = () => {
    if (!name.trim()) return;
    onAdd({
      id: generateId(),
      name: name.trim(),
      category: category as Ingredient['category'],
      quantity,
      unit,
      addedAt: Date.now(),
    });
    resetForm();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40"
            onClick={onClose}
          />

          {/* Bottom sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl max-h-[85vh] flex flex-col"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-3 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">添加食材</h2>
              <button
                onClick={() => { resetForm(); onClose(); }}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"
              >
                ✕
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
              {/* Quick select section */}
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-2">快速添加</h3>
                {/* Category tabs for quick select */}
                <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 mb-2">
                  {INGREDIENT_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setQuickCategory(cat)}
                      className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        quickCategory === cat
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                {/* Ingredient chips */}
                <div className="flex flex-wrap gap-2">
                  {COMMON_INGREDIENTS[quickCategory]?.map((item) => (
                    <button
                      key={item}
                      onClick={() => handleQuickSelect(item)}
                      className="px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-xs font-medium border border-green-200 active:bg-green-100 transition-colors"
                    >
                      + {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100" />

              {/* Manual input section */}
              <div>
                <h3 className="text-sm font-medium text-gray-600 mb-3">手动输入</h3>

                {/* Name */}
                <div className="mb-3">
                  <label className="text-xs text-gray-500 mb-1 block">食材名称</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="输入食材名称"
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-100"
                  />
                </div>

                {/* Category */}
                <div className="mb-3">
                  <label className="text-xs text-gray-500 mb-1 block">分类</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-100 bg-white"
                  >
                    {INGREDIENT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Quantity + Unit */}
                <div className="flex gap-3 mb-4">
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 mb-1 block">数量</label>
                    <input
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-100"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-gray-500 mb-1 block">单位</label>
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-100 bg-white"
                    >
                      {UNIT_OPTIONS.map((u) => (
                        <option key={u} value={u}>{u}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  onClick={handleSubmit}
                  disabled={!name.trim()}
                  className="w-full py-3 rounded-xl bg-green-500 text-white font-medium text-sm active:bg-green-600 disabled:bg-gray-200 disabled:text-gray-400 transition-colors mb-4"
                >
                  添加到冰箱
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
