import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import type { Ingredient, FamilyMember, Recipe } from '../types';
import { useStore, STORAGE_KEYS } from '../store/useStore';
import RecipeCard from '../components/RecipeCard';

export default function RecommendPage() {
  const { items: ingredients } = useStore<Ingredient>(STORAGE_KEYS.ingredients);
  const { items: members } = useStore<FamilyMember>(STORAGE_KEYS.members);
  const { items: savedRecipes, add: addRecipe } = useStore<Recipe>(STORAGE_KEYS.recipes);

  const [memberCount, setMemberCount] = useState<number>(
    Math.max(1, Math.min(members.length || 2, 6))
  );
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  // Collect all allergies and preferences from members
  const { allergies, preferences } = useMemo(() => {
    const allergySet = new Set<string>();
    const prefSet = new Set<string>();
    members.forEach((m) => {
      m.allergies?.forEach((a) => allergySet.add(a));
      m.preferences?.forEach((p) => prefSet.add(p));
    });
    return {
      allergies: Array.from(allergySet),
      preferences: Array.from(prefSet),
    };
  }, [members]);

  // Track which recipes are already saved
  const savedIds = useMemo(() => new Set(savedRecipes.map((r) => r.id)), [savedRecipes]);

  const fetchRecommend = async () => {
    setLoading(true);
    setError(false);
    setHasFetched(true);

    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ingredients: ingredients.map((i) => i.name),
          memberCount,
          allergies,
          preferences,
        }),
      });

      if (!res.ok) throw new Error('API error');

      const data = await res.json();
      // Expect data to be an array of recipes or { recipes: [...] }
      const resultRecipes: Recipe[] = Array.isArray(data) ? data : data.recipes || [];
      setRecipes(resultRecipes);
    } catch {
      setError(true);
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = (recipe: Recipe) => {
    const recipeToSave: Recipe = {
      ...recipe,
      id: recipe.id || `recipe_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      source: 'ai',
      createdAt: recipe.createdAt || Date.now(),
    };
    addRecipe(recipeToSave);
  };

  const isFridgeEmpty = ingredients.length === 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="px-4 pt-4 pb-3">
          <h1 className="text-xl font-bold text-gray-800">🤖 AI智能推荐</h1>
          <p className="text-xs text-gray-500 mt-1">根据冰箱食材智能推荐家常菜</p>
        </div>
      </div>

      <div className="px-4 pt-4 space-y-5">
        {/* Ingredient count */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">🧊</span>
              <span className="text-sm text-gray-700">冰箱食材</span>
            </div>
            <span className="text-sm font-bold text-green-600">{ingredients.length} 种</span>
          </div>
        </div>

        {/* Member count selector */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">👨‍👩‍👧‍👦</span>
            <span className="text-sm text-gray-700">用餐人数</span>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <button
                key={n}
                onClick={() => setMemberCount(n)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  memberCount === n
                    ? 'bg-blue-500 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 active:bg-gray-200'
                }`}
              >
                {n}人
              </button>
            ))}
          </div>
        </div>

        {/* Recommend button */}
        {!isFridgeEmpty ? (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={fetchRecommend}
            disabled={loading}
            className="w-full py-4 rounded-2xl text-white font-bold text-base shadow-lg bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 active:from-blue-600 active:via-blue-700 active:to-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
          >
            {loading ? '推荐中...' : '🤖 AI推荐菜谱'}
          </motion.button>
        ) : (
          <div className="bg-amber-50 rounded-xl p-6 text-center border border-amber-100">
            <p className="text-3xl mb-2">🛒</p>
            <p className="text-sm text-amber-700 font-medium">冰箱还没有食材</p>
            <p className="text-xs text-amber-500 mt-1">请先去冰箱添加食材，再来获取推荐</p>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-10 h-10 border-3 border-blue-200 border-t-blue-500 rounded-full mb-4"
              style={{ borderWidth: '3px' }}
            />
            <p className="text-sm text-gray-500 animate-pulse">AI正在思考菜谱...</p>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-3xl mb-2">😥</p>
            <p className="text-sm text-red-500 font-medium mb-3">推荐失败，请重试</p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={fetchRecommend}
              className="px-6 py-2 rounded-xl bg-blue-500 text-white text-sm font-medium active:bg-blue-600"
            >
              重新推荐
            </motion.button>
          </div>
        )}

        {/* Results */}
        {!loading && !error && hasFetched && recipes.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm font-semibold text-gray-700 flex items-center gap-1">
              <span>✨</span> 为你推荐 {recipes.length} 道菜谱
            </p>
            {recipes.map((recipe) => (
              <RecipeCard
                key={recipe.id || recipe.name}
                recipe={recipe}
                onSave={handleSave}
                saved={savedIds.has(recipe.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
