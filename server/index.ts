import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3272;
const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY;

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', time: Date.now() });
});

// Recipe recommendation endpoint
app.post('/api/recommend', async (req, res) => {
  try {
    const { ingredients, memberCount, allergies, preferences } = req.body;

    if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
      return res.status(400).json({ error: '请提供至少一种食材' });
    }

    const prompt = `你是一位专业的家庭营养师和厨师。请根据以下信息推荐3道菜品：

可用食材：${ingredients.join('、')}
家庭成员人数：${memberCount || 3}人
过敏原（必须严格避免）：${allergies && allergies.length > 0 ? allergies.join('、') : '无'}
口味偏好：${preferences && preferences.length > 0 ? preferences.join('、') : '无特殊偏好'}

要求：
1. 推荐恰好3道菜品
2. 严格避免所有过敏原食材
3. 考虑口味偏好进行搭配
4. 菜品应尽量使用现有食材，可以适当添加常见调味料
5. 每道菜包含完整的营养信息

请严格按照以下JSON数组格式返回，不要添加任何额外文字说明：
[
  {
    "name": "菜品名称",
    "ingredients": [{"name": "食材名", "amount": "用量"}],
    "steps": ["步骤1", "步骤2"],
    "calories": 总热量(数字),
    "caloriesPerServing": 每份热量(数字),
    "servings": 份数(数字),
    "cookTime": 烹饪时间分钟数(数字),
    "difficulty": "简单" 或 "中等" 或 "较难",
    "tags": ["标签1", "标签2"]
  }
]

直接返回JSON数组，不要用markdown代码块包裹。`;

    const response = await fetch(
      'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${DASHSCOPE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'qwen-plus',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DashScope API error:', response.status, errorText);
      return res.status(502).json({ error: 'AI服务请求失败', details: errorText });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return res.status(502).json({ error: 'AI未返回有效内容' });
    }

    // Clean up markdown code fences if present
    let cleaned = content.trim();
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, '');
    cleaned = cleaned.replace(/\n?\s*```$/i, '');
    cleaned = cleaned.trim();

    let recipes;
    try {
      recipes = JSON.parse(cleaned);
    } catch (parseErr) {
      console.error('Failed to parse AI response:', cleaned);
      return res.status(502).json({ error: 'AI返回内容解析失败', raw: cleaned });
    }

    if (!Array.isArray(recipes)) {
      recipes = [recipes];
    }

    res.json({ recipes });
  } catch (error: any) {
    console.error('Recommend endpoint error:', error);
    res.status(500).json({ error: '服务器内部错误', message: error.message });
  }
});

// Serve static files for production
const __dirname_fix = path.dirname(new URL(import.meta.url).pathname);
app.use(express.static(path.resolve(__dirname_fix, '../dist')));

// SPA fallback
app.get('/{*splat}', (_req, res) => {
  res.sendFile(path.resolve(__dirname_fix, '../dist/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Local network access: http://192.168.10.235:${PORT}`);
});
