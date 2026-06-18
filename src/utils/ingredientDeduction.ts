import type { Ingredient, Recipe } from '../types';

/**
 * 根据菜单中的菜谱扣减冰箱食材库存
 * @param recipes 菜单中的菜谱列表
 * @param ingredients 当前冰箱食材
 * @returns 扣减后的食材列表
 */
export function deductIngredients(
  recipes: Recipe[],
  ingredients: Ingredient[]
): Ingredient[] {
  // 收集所有需要的食材
  const needed: Record<string, number> = {};
  for (const recipe of recipes) {
    for (const ing of recipe.ingredients) {
      const name = ing.name.trim();
      // 尝试解析amount中的数字
      const match = ing.amount.match(/(\d+\.?\d*)/);
      const qty = match ? parseFloat(match[1]) : 1;
      needed[name] = (needed[name] || 0) + qty;
    }
  }

  // 扣减
  const result: Ingredient[] = [];
  for (const item of ingredients) {
    const name = item.name.trim();
    if (needed[name] && needed[name] > 0) {
      const remaining = item.quantity - needed[name];
      if (remaining > 0) {
        result.push({ ...item, quantity: remaining });
      }
      // remaining <= 0: 不加入结果（等于删除）
      delete needed[name]; // 标记已处理
    } else {
      result.push(item);
    }
  }

  return result;
}

/**
 * 检查冰箱食材是否足够做这些菜
 * @returns 缺少的食材列表
 */
export function checkMissingIngredients(
  recipes: Recipe[],
  ingredients: Ingredient[]
): { name: string; needed: number; have: number }[] {
  const needed: Record<string, number> = {};
  for (const recipe of recipes) {
    for (const ing of recipe.ingredients) {
      const name = ing.name.trim();
      const match = ing.amount.match(/(\d+\.?\d*)/);
      const qty = match ? parseFloat(match[1]) : 1;
      needed[name] = (needed[name] || 0) + qty;
    }
  }

  const missing: { name: string; needed: number; have: number }[] = [];
  const ingredientMap: Record<string, number> = {};
  for (const item of ingredients) {
    ingredientMap[item.name.trim()] = item.quantity;
  }

  for (const [name, qty] of Object.entries(needed)) {
    const have = ingredientMap[name] || 0;
    if (have < qty) {
      missing.push({ name, needed: qty, have });
    }
  }

  return missing;
}
