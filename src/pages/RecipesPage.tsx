import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore, STORAGE_KEYS } from '../store/useStore';
import type { Recipe } from '../types';

const generateId = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

const DIFFICULTY_OPTIONS: Recipe['difficulty'][] = ['简单', '中等', '较难'];

interface FormIngredient {
  name: string;
  amount: string;
}

interface FormState {
  name: string;
  ingredients: FormIngredient[];
  steps: string[];
  calories: string;
  servings: string;
  cookTime: string;
  difficulty: Recipe['difficulty'];
  tags: string;
}

const emptyForm: FormState = {
  name: '',
  ingredients: [{ name: '', amount: '' }],
  steps: [''],
  calories: '',
  servings: '',
  cookTime: '',
  difficulty: '简单',
  tags: '',
};

export default function RecipesPage() {
  const { items: recipes, add, remove } = useStore<Recipe>(STORAGE_KEYS.recipes);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = q ? recipes.filter((r) => r.name.toLowerCase().includes(q)) : recipes;
    return list;
  }, [recipes, search]);

  const aiRecipes = useMemo(() => filtered.filter((r) => r.source === 'ai'), [filtered]);
  const customRecipes = useMemo(() => filtered.filter((r) => r.source === 'custom'), [filtered]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setShowForm(false);
  };

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    const ingredients = form.ingredients.filter((i) => i.name.trim());
    const steps = form.steps.filter((s) => s.trim());
    const tags = form.tags
      .split(/[,，]/)
      .map((t) => t.trim())
      .filter(Boolean);
    const calories = parseInt(form.calories) || 0;
    const servings = parseInt(form.servings) || 1;
    const cookTime = parseInt(form.cookTime) || 0;

    const recipe: Recipe = {
      id: generateId(),
      name: form.name.trim(),
      ingredients,
      steps,
      calories,
      caloriesPerServing: servings > 0 ? Math.round(calories / servings) : calories,
      servings,
      cookTime,
      difficulty: form.difficulty,
      tags,
      source: 'custom',
      createdAt: Date.now(),
    };
    add(recipe);
    resetForm();
  };

  // Form helpers
  const addIngredientRow = () =>
    setForm((f) => ({ ...f, ingredients: [...f.ingredients, { name: '', amount: '' }] }));
  const removeIngredientRow = (idx: number) =>
    setForm((f) => ({ ...f, ingredients: f.ingredients.filter((_, i) => i !== idx) }));
  const updateIngredient = (idx: number, field: keyof FormIngredient, val: string) =>
    setForm((f) => ({
      ...f,
      ingredients: f.ingredients.map((ing, i) => (i === idx ? { ...ing, [field]: val } : ing)),
    }));

  const addStepRow = () => setForm((f) => ({ ...f, steps: [...f.steps, ''] }));
  const removeStepRow = (idx: number) =>
    setForm((f) => ({ ...f, steps: f.steps.filter((_, i) => i !== idx) }));
  const updateStep = (idx: number, val: string) =>
    setForm((f) => ({ ...f, steps: f.steps.map((s, i) => (i === idx ? val : s)) }));

  const renderRecipeCard = (recipe: Recipe) => {
    const isExpanded = expandedId === recipe.id;
    return (
      <div key={recipe.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div
          className="p-4 cursor-pointer active:bg-gray-50 transition-colors"
          onClick={() => toggleExpand(recipe.id)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-bold text-gray-800 truncate">{recipe.name}</h3>
              <div className="flex flex-wrap gap-2 mt-1.5">
                <span className="text-xs bg-orange-50 text-orange-600 px-2 py-0.5 rounded-full">
                  🔥 {recipe.calories}kcal
                </span>
                <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                  ⏱ {recipe.cookTime}分钟
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    recipe.difficulty === '简单'
                      ? 'bg-green-50 text-green-600'
                      : recipe.difficulty === '中等'
                      ? 'bg-yellow-50 text-yellow-600'
                      : 'bg-red-50 text-red-600'
                  }`}
                >
                  {recipe.difficulty}
                </span>
              </div>
              {recipe.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {recipe.tags.map((tag, i) => (
                    <span key={i} className="text-xs text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 ml-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  remove(recipe.id);
                }}
                className="w-7 h-7 rounded-full bg-red-50 text-red-400 text-xs flex items-center justify-center active:scale-90 transition-transform"
              >
                🗑
              </button>
              <span className="text-gray-400 text-sm">{isExpanded ? '▲' : '▼'}</span>
            </div>
          </div>
        </div>

        {/* Expanded details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
                {/* Servings info */}
                <p className="text-xs text-gray-500">
                  份量: {recipe.servings}人份 · 每份 {recipe.caloriesPerServing}kcal
                </p>

                {/* Ingredients */}
                {recipe.ingredients.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-1.5">🥬 食材</h4>
                    <ul className="space-y-1">
                      {recipe.ingredients.map((ing, i) => (
                        <li key={i} className="text-xs text-gray-600 flex justify-between bg-gray-50 rounded-lg px-3 py-1.5">
                          <span>{ing.name}</span>
                          <span className="text-gray-400">{ing.amount}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Steps */}
                {recipe.steps.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-1.5">👩‍🍳 步骤</h4>
                    <ol className="space-y-1.5">
                      {recipe.steps.map((step, i) => (
                        <li key={i} className="text-xs text-gray-600 flex gap-2">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-[10px] font-bold">
                            {i + 1}
                          </span>
                          <span className="leading-5">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-800 mb-3">📖 自定义菜谱管理</h1>
          {/* Search */}
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
              placeholder="搜索菜谱..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-100 text-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-orange-200 transition-all"
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
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 pt-4 space-y-6">
        {recipes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-5xl mb-4">📖</p>
            <p className="text-gray-500 text-sm">还没有菜谱，去AI推荐页生成或手动添加 📖</p>
          </div>
        ) : (
          <>
            {/* AI推荐 */}
            <section>
              <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="text-lg">🤖</span> AI推荐
                <span className="text-xs font-normal text-gray-400">({aiRecipes.length})</span>
              </h2>
              {aiRecipes.length === 0 ? (
                <p className="text-xs text-gray-400 py-2 pl-1">暂无AI推荐菜谱</p>
              ) : (
                <div className="space-y-3">{aiRecipes.map(renderRecipeCard)}</div>
              )}
            </section>

            {/* 自定义 */}
            <section>
              <h2 className="text-base font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="text-lg">✏️</span> 自定义
                <span className="text-xs font-normal text-gray-400">({customRecipes.length})</span>
              </h2>
              {customRecipes.length === 0 ? (
                <p className="text-xs text-gray-400 py-2 pl-1">暂无自定义菜谱，点击下方按钮添加</p>
              ) : (
                <div className="space-y-3">{customRecipes.map(renderRecipeCard)}</div>
              )}
            </section>
          </>
        )}

        {/* Show empty when filtered returns nothing */}
        {recipes.length > 0 && filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm">没有找到匹配的菜谱</p>
          </div>
        )}
      </div>

      {/* Floating add button */}
      <button
        onClick={() => setShowForm(true)}
        className="fixed bottom-24 right-6 w-14 h-14 rounded-full bg-orange-500 text-white text-2xl shadow-lg shadow-orange-200 flex items-center justify-center active:bg-orange-600 active:scale-95 transition-transform z-40"
      >
        +
      </button>

      {/* Create Recipe Bottom Sheet Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center"
            onClick={resetForm}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white w-full max-w-lg rounded-t-3xl max-h-[85vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="p-4 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
                <h3 className="text-lg font-bold text-gray-800">新建菜谱</h3>
                <button
                  onClick={resetForm}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"
                >
                  ✕
                </button>
              </div>

              {/* Form Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">菜名 *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    placeholder="例：番茄炒蛋"
                    className="w-full px-3 py-2.5 rounded-xl bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 border border-gray-200"
                  />
                </div>

                {/* Ingredients */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">食材</label>
                  <div className="space-y-2">
                    {form.ingredients.map((ing, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={ing.name}
                          onChange={(e) => updateIngredient(idx, 'name', e.target.value)}
                          placeholder="食材名"
                          className="flex-1 px-3 py-2 rounded-lg bg-gray-50 text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-200"
                        />
                        <input
                          type="text"
                          value={ing.amount}
                          onChange={(e) => updateIngredient(idx, 'amount', e.target.value)}
                          placeholder="用量"
                          className="w-24 px-3 py-2 rounded-lg bg-gray-50 text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-200"
                        />
                        {form.ingredients.length > 1 && (
                          <button
                            onClick={() => removeIngredientRow(idx)}
                            className="w-7 h-7 rounded-full bg-red-50 text-red-400 text-xs flex items-center justify-center flex-shrink-0"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={addIngredientRow}
                    className="mt-2 text-xs text-orange-500 font-medium"
                  >
                    + 添加食材
                  </button>
                </div>

                {/* Steps */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">步骤</label>
                  <div className="space-y-2">
                    {form.steps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs font-bold mt-2">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={step}
                          onChange={(e) => updateStep(idx, e.target.value)}
                          placeholder={`步骤 ${idx + 1}`}
                          className="flex-1 px-3 py-2 rounded-lg bg-gray-50 text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-200"
                        />
                        {form.steps.length > 1 && (
                          <button
                            onClick={() => removeStepRow(idx)}
                            className="w-7 h-7 rounded-full bg-red-50 text-red-400 text-xs flex items-center justify-center flex-shrink-0 mt-1"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={addStepRow}
                    className="mt-2 text-xs text-orange-500 font-medium"
                  >
                    + 添加步骤
                  </button>
                </div>

                {/* Numeric fields row */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">热量(kcal)</label>
                    <input
                      type="number"
                      value={form.calories}
                      onChange={(e) => setForm((f) => ({ ...f, calories: e.target.value }))}
                      placeholder="0"
                      className="w-full px-3 py-2.5 rounded-xl bg-gray-50 text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">份量(人)</label>
                    <input
                      type="number"
                      value={form.servings}
                      onChange={(e) => setForm((f) => ({ ...f, servings: e.target.value }))}
                      placeholder="1"
                      className="w-full px-3 py-2.5 rounded-xl bg-gray-50 text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-200"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">时间(分)</label>
                    <input
                      type="number"
                      value={form.cookTime}
                      onChange={(e) => setForm((f) => ({ ...f, cookTime: e.target.value }))}
                      placeholder="0"
                      className="w-full px-3 py-2.5 rounded-xl bg-gray-50 text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-200"
                    />
                  </div>
                </div>

                {/* Difficulty */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">难度</label>
                  <select
                    value={form.difficulty}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, difficulty: e.target.value as Recipe['difficulty'] }))
                    }
                    className="w-full px-3 py-2.5 rounded-xl bg-gray-50 text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-200"
                  >
                    {DIFFICULTY_OPTIONS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">标签</label>
                  <input
                    type="text"
                    value={form.tags}
                    onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))}
                    placeholder="用逗号分隔，例：家常,快手,下饭"
                    className="w-full px-3 py-2.5 rounded-xl bg-gray-50 text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-200"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="p-4 border-t border-gray-100 flex-shrink-0">
                <button
                  onClick={handleSubmit}
                  disabled={!form.name.trim()}
                  className={`w-full py-3.5 rounded-2xl text-white font-semibold text-base transition-all active:scale-[0.98] ${
                    form.name.trim()
                      ? 'bg-orange-500 shadow-lg shadow-orange-200'
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  ✅ 保存菜谱
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
