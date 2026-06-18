// 家庭成员
export interface FamilyMember {
  id: string;
  name: string;
  avatar: string;       // emoji
  allergies: string[];  // 过敏食材
  preferences: string[]; // 偏好标签：辣/清淡/甜...
}

// 食材
export interface Ingredient {
  id: string;
  name: string;
  category: '蔬菜' | '肉类' | '海鲜' | '蛋奶' | '主食' | '调味品' | '水果' | '其他';
  quantity: number;
  unit: string;
  addedAt: number;
}

// 菜谱
export interface Recipe {
  id: string;
  name: string;
  ingredients: { name: string; amount: string }[];
  steps: string[];
  calories: number;
  caloriesPerServing: number;
  servings: number;
  cookTime: number;
  difficulty: '简单' | '中等' | '较难';
  tags: string[];
  source: 'ai' | 'custom';
  createdAt: number;
}

// 每日菜单
export interface DailyMenu {
  id: string;
  date: string;          // YYYY-MM-DD
  breakfast: string[];   // recipe ids
  lunch: string[];
  dinner: string[];
  members: string[];     // member ids
}

// 食材分类
export const INGREDIENT_CATEGORIES = ['蔬菜', '肉类', '海鲜', '蛋奶', '主食', '调味品', '水果', '其他'] as const;

// 过敏食材预设
export const ALLERGEN_PRESETS = ['花生', '海鲜', '牛奶', '鸡蛋', '大豆', '小麦', '坚果', '芝麻'];

// 口味偏好预设
export const PREFERENCE_PRESETS = ['辣', '清淡', '甜', '酸', '咸', '素食', '低碳水', '重口味'];

// 常见食材预设
export const COMMON_INGREDIENTS: Record<string, string[]> = {
  '蔬菜': ['西红柿', '土豆', '黄瓜', '白菜', '胡萝卜', '青椒', '洋葱', '菠菜', '茄子', '芹菜', '生菜', '西兰花', '南瓜', '冬瓜', '豆芽'],
  '肉类': ['猪肉', '牛肉', '鸡肉', '排骨', '五花肉', '鸡腿', '鸡翅', '肉末', '火腿', '培根'],
  '海鲜': ['虾', '鱼', '蟹', '鱿鱼', '蛤蜊', '三文鱼', '带鱼', '鲈鱼'],
  '蛋奶': ['鸡蛋', '牛奶', '豆腐', '奶酪', '酸奶', '黄油'],
  '主食': ['大米', '面粉', '面条', '馒头', '饺子皮', '红薯', '玉米', '燕麦'],
  '调味品': ['盐', '糖', '酱油', '醋', '料酒', '蚝油', '辣椒', '花椒', '姜', '蒜', '葱'],
  '水果': ['苹果', '香蕉', '橙子', '葡萄', '西瓜', '草莓', '芒果', '柠檬'],
  '其他': ['木耳', '香菇', '腐竹', '粉丝', '紫菜', '芝麻', '花生'],
};
