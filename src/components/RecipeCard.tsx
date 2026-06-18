import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Recipe } from '../types';

interface RecipeCardProps {
  recipe: Recipe;
  onSave: (recipe: Recipe) => void;
  saved: boolean;
}

const DIFFICULTY_CONFIG: Record<string, { bg: string; text: string; emoji: string }> = {
  '简单': { bg: 'bg-green-50', text: 'text-green-600', emoji: '🟢' },
  '中等': { bg: 'bg-yellow-50', text: 'text-yellow-600', emoji: '🟡' },
  '较难': { bg: 'bg-red-50', text: 'text-red-600', emoji: '🔴' },
};

export default function RecipeCard({ recipe, onSave, saved }: RecipeCardProps) {
  const [expanded, setExpanded] = useState(false);
  const difficulty = DIFFICULTY_CONFIG[recipe.difficulty] || DIFFICULTY_CONFIG['中等'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
    >
      {/* Card header */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-base font-bold text-gray-800 mb-1">{recipe.name}</h3>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-gray-500">🔥 {recipe.calories}kcal</span>
              <span className="text-xs text-gray-500">⏱ {recipe.cookTime}分钟</span>
              <span
                className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs font-medium ${difficulty.bg} ${difficulty.text}`}
              >
                {difficulty.emoji} {recipe.difficulty}
              </span>
            </div>
          </div>
        </div>

        {/* Tags */}
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {recipe.tags.map((tag, i) => (
              <span
                key={i}
                className="px-2 py-0.5 bg-blue-50 text-blue-500 rounded-full text-xs"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Expand / collapse toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-blue-500 font-medium"
        >
          {expanded ? '收起详情' : '查看详情'}
          <motion.svg
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </motion.svg>
        </button>
      </div>

      {/* Expandable detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-gray-50">
              {/* Ingredients */}
              <div className="pt-3 mb-3">
                <p className="text-sm font-semibold text-gray-700 mb-2">🥘 食材</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {recipe.ingredients.map((ing, i) => (
                    <div key={i} className="flex items-center gap-1 text-xs text-gray-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-300 flex-shrink-0" />
                      <span>{ing.name}</span>
                      <span className="text-gray-400">{ing.amount}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Steps */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">👨‍🍳 步骤</p>
                <ol className="space-y-2">
                  {recipe.steps.map((step, i) => (
                    <li key={i} className="flex gap-2 text-xs text-gray-600">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500 text-white text-[10px] flex items-center justify-center font-bold">
                        {i + 1}
                      </span>
                      <span className="pt-0.5 leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save button */}
      <div className="px-4 pb-4">
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => !saved && onSave(recipe)}
          disabled={saved}
          className={`w-full py-2.5 rounded-xl text-sm font-medium transition-colors ${
            saved
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white active:from-blue-600 active:to-blue-700'
          }`}
        >
          {saved ? '✅ 已保存到菜谱库' : '📥 保存到菜谱库'}
        </motion.button>
      </div>
    </motion.div>
  );
}
