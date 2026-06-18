import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore, STORAGE_KEYS } from '../store/useStore';
import type { Recipe, DailyMenu, FamilyMember } from '../types';

const generateId = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

type MealType = 'breakfast' | 'lunch' | 'dinner';

const MEAL_CONFIG: { key: MealType; icon: string; label: string }[] = [
  { key: 'breakfast', icon: '🌅', label: '早餐' },
  { key: 'lunch', icon: '☀️', label: '午餐' },
  { key: 'dinner', icon: '🌙', label: '晚餐' },
];

function getTomorrow(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

function shiftDate(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function MenuPage() {
  const { items: recipes } = useStore<Recipe>(STORAGE_KEYS.recipes);
  const { items: menus, add: addMenu, update: updateMenu, setItems: setMenus } = useStore<DailyMenu>(STORAGE_KEYS.menus);
  const { items: members } = useStore<FamilyMember>(STORAGE_KEYS.members);

  const [date, setDate] = useState(getTomorrow);
  const [breakfast, setBreakfast] = useState<string[]>([]);
  const [lunch, setLunch] = useState<string[]>([]);
  const [dinner, setDinner] = useState<string[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<MealType>('breakfast');
  const [saved, setSaved] = useState(false);

  // Load existing menu for selected date
  const existingMenu = useMemo(
    () => menus.find((m) => m.date === date),
    [menus, date]
  );

  // When date changes or existingMenu changes, sync state
  useMemo(() => {
    if (existingMenu) {
      setBreakfast(existingMenu.breakfast);
      setLunch(existingMenu.lunch);
      setDinner(existingMenu.dinner);
      setSelectedMembers(existingMenu.members);
    } else {
      setBreakfast([]);
      setLunch([]);
      setDinner([]);
      setSelectedMembers([]);
    }
    setSaved(false);
  }, [existingMenu?.id]);

  const recipeMap = useMemo(() => {
    const map = new Map<string, Recipe>();
    recipes.forEach((r) => map.set(r.id, r));
    return map;
  }, [recipes]);

  const mealState = { breakfast, lunch, dinner };
  const mealSetter = {
    breakfast: setBreakfast,
    lunch: setLunch,
    dinner: setDinner,
  };

  const addRecipeToMeal = (mealType: MealType, recipeId: string) => {
    mealSetter[mealType]((prev) =>
      prev.includes(recipeId) ? prev : [...prev, recipeId]
    );
  };

  const removeRecipeFromMeal = (mealType: MealType, recipeId: string) => {
    mealSetter[mealType]((prev) => prev.filter((id) => id !== recipeId));
  };

  const totalCalories = useMemo(() => {
    const allIds = [...breakfast, ...lunch, ...dinner];
    return allIds.reduce((sum, id) => {
      const r = recipeMap.get(id);
      return sum + (r?.calories || 0);
    }, 0);
  }, [breakfast, lunch, dinner, recipeMap]);

  const isEmpty = breakfast.length === 0 && lunch.length === 0 && dinner.length === 0;

  const openPicker = (mealType: MealType) => {
    setPickerTarget(mealType);
    setPickerOpen(true);
  };

  const handleSave = () => {
    const menuData = {
      date,
      breakfast,
      lunch,
      dinner,
      members: selectedMembers,
    };
    if (existingMenu) {
      updateMenu(existingMenu.id, menuData);
    } else {
      addMenu({ ...menuData, id: generateId() });
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleMember = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header with date picker */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-800 text-center mb-3">🍽️ 明日菜单规划</h1>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setDate(shiftDate(date, -1))}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 active:scale-90 transition-transform"
            >
              ◀
            </button>
            <span className="text-base font-semibold text-gray-800 min-w-[120px] text-center">
              {date}
            </span>
            <button
              onClick={() => setDate(shiftDate(date, 1))}
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 active:scale-90 transition-transform"
            >
              ▶
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        {/* Empty state */}
        {isEmpty && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-5xl mb-4">👨‍🍳</p>
            <p className="text-gray-500 text-sm">还没有规划菜单，从菜谱库选几道菜吧 👨‍🍳</p>
          </div>
        )}

        {/* Meal Sections */}
        {MEAL_CONFIG.map(({ key, icon, label }) => {
          const ids = mealState[key];
          return (
            <div key={key} className="bg-white rounded-2xl p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-gray-800">
                  {icon} {label}
                </h2>
                <button
                  onClick={() => openPicker(key)}
                  className="text-xs px-3 py-1.5 rounded-full bg-orange-50 text-orange-600 font-medium active:scale-95 transition-transform"
                >
                  + 添加菜品
                </button>
              </div>

              {ids.length === 0 ? (
                <p className="text-xs text-gray-400 py-2">暂无菜品</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {ids.map((recipeId) => {
                    const recipe = recipeMap.get(recipeId);
                    if (!recipe) return null;
                    return (
                      <div
                        key={recipeId}
                        className="flex items-center gap-2 bg-orange-50 rounded-xl px-3 py-2 text-sm"
                      >
                        <span className="text-gray-800 font-medium">{recipe.name}</span>
                        <span className="text-xs text-gray-400">{recipe.calories}kcal</span>
                        <button
                          onClick={() => removeRecipeFromMeal(key, recipeId)}
                          className="w-5 h-5 rounded-full bg-red-100 text-red-500 text-xs flex items-center justify-center ml-1 active:scale-90 transition-transform"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Calories Summary */}
        {!isEmpty && (
          <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl p-4 flex items-center justify-between">
            <span className="text-sm text-gray-600 font-medium">🔥 今日总热量</span>
            <span className="text-lg font-bold text-orange-600">{totalCalories} kcal</span>
          </div>
        )}

        {/* Family Members Selection */}
        {members.length > 0 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm">
            <h2 className="text-base font-bold text-gray-800 mb-3">👨‍👩‍👧‍👦 选择用餐成员</h2>
            <div className="flex flex-wrap gap-2">
              {members.map((member) => (
                <label
                  key={member.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all ${
                    selectedMembers.includes(member.id)
                      ? 'bg-orange-100 border border-orange-300'
                      : 'bg-gray-50 border border-transparent'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(member.id)}
                    onChange={() => toggleMember(member.id)}
                    className="hidden"
                  />
                  <span className="text-lg">{member.avatar}</span>
                  <span className="text-sm text-gray-700">{member.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={isEmpty}
          className={`w-full py-3.5 rounded-2xl text-white font-semibold text-base transition-all active:scale-[0.98] ${
            saved
              ? 'bg-green-500'
              : isEmpty
              ? 'bg-gray-300 cursor-not-allowed'
              : 'bg-orange-500 shadow-lg shadow-orange-200'
          }`}
        >
          {saved ? '✅ 已保存' : '💾 保存菜单'}
        </button>
      </div>

      {/* Recipe Picker Modal */}
      <AnimatePresence>
        {pickerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center"
            onClick={() => setPickerOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-white w-full max-w-lg rounded-t-3xl max-h-[70vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800">选择菜品</h3>
                <button
                  onClick={() => setPickerOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"
                >
                  ✕
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {recipes.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400 text-sm">还没有菜谱，先去菜谱管理页添加吧 📖</p>
                  </div>
                ) : (
                  recipes.map((recipe) => {
                    const alreadyAdded = mealState[pickerTarget].includes(recipe.id);
                    return (
                      <button
                        key={recipe.id}
                        disabled={alreadyAdded}
                        onClick={() => {
                          addRecipeToMeal(pickerTarget, recipe.id);
                          setPickerOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all ${
                          alreadyAdded
                            ? 'bg-gray-50 opacity-50'
                            : 'bg-gray-50 active:bg-orange-50 active:scale-[0.98]'
                        }`}
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-800">{recipe.name}</p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {recipe.calories}kcal · {recipe.cookTime}分钟 · {recipe.difficulty}
                          </p>
                        </div>
                        <span className="text-xs text-orange-500 font-medium">
                          {alreadyAdded ? '已添加' : '+ 添加'}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
