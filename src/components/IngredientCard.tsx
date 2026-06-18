import { useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { Ingredient } from '../types';

interface IngredientCardProps {
  ingredient: Ingredient;
  onUpdate: (id: string, changes: Partial<Ingredient>) => void;
  onRemove: (id: string) => void;
}

const CATEGORY_EMOJI: Record<string, string> = {
  '蔬菜': '🥬', '肉类': '🥩', '海鲜': '🦐', '蛋奶': '🥚',
  '主食': '🍚', '调味品': '🧂', '水果': '🍎', '其他': '📦',
};

export default function IngredientCard({ ingredient, onUpdate, onRemove }: IngredientCardProps) {
  const [showDelete, setShowDelete] = useState(false);
  const emoji = CATEGORY_EMOJI[ingredient.category] || '📦';

  return (
    <div className="relative bg-white rounded-xl p-3 shadow-sm border border-gray-100">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">{ingredient.name}</p>
          <p className="text-xs text-gray-400">{ingredient.category}</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">{ingredient.quantity} {ingredient.unit}</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              if (ingredient.quantity <= 1) onRemove(ingredient.id);
              else onUpdate(ingredient.id, { quantity: ingredient.quantity - 1 });
            }}
            className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-sm active:bg-gray-200"
          >−</button>
          <button
            onClick={() => onUpdate(ingredient.id, { quantity: ingredient.quantity + 1 })}
            className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center text-green-600 text-sm active:bg-green-100"
          >+</button>
          <button
            onClick={() => onRemove(ingredient.id)}
            className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center text-red-400 text-xs active:bg-red-100 ml-1"
          >✕</button>
        </div>
      </div>
    </div>
  );
}
