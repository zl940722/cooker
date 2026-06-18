import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore, STORAGE_KEYS } from '../store/useStore';
import type { FamilyMember } from '../types';
import { ALLERGEN_PRESETS, PREFERENCE_PRESETS } from '../types';

const EMOJI_OPTIONS = ['👨', '👩', '👦', '👧', '👴', '👵', '🧑', '👶', '🧒', '👸', '🤴', '👱'];
const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

export default function SettingsPage() {
  const { items: members, add, update, remove } = useStore<FamilyMember>(STORAGE_KEYS.members);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('👨');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [preferences, setPreferences] = useState<string[]>([]);

  const resetForm = () => {
    setName('');
    setAvatar('👨');
    setAllergies([]);
    setPreferences([]);
    setEditingId(null);
    setShowForm(false);
  };

  const openAdd = () => {
    resetForm();
    setShowForm(true);
  };

  const openEdit = (m: FamilyMember) => {
    setEditingId(m.id);
    setName(m.name);
    setAvatar(m.avatar);
    setAllergies(m.allergies);
    setPreferences(m.preferences);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!name.trim()) return;
    const data = { name: name.trim(), avatar, allergies, preferences };
    if (editingId) {
      update(editingId, data);
    } else {
      add({ ...data, id: genId() });
    }
    resetForm();
  };

  const toggleAllergy = (a: string) => {
    setAllergies(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
  };

  const togglePref = (p: string) => {
    setPreferences(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-100">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-800">👨‍👩‍👧‍👦 家庭成员</h1>
          <button onClick={openAdd} className="px-3 py-1.5 rounded-full bg-orange-500 text-white text-sm font-medium active:scale-95 transition-all">
            + 添加
          </button>
        </div>
      </div>

      {/* Member list */}
      <div className="max-w-lg mx-auto px-4 pt-4 space-y-3">
        {members.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-3">👨‍👩‍👧‍👦</p>
            <p className="text-gray-400">还没有家庭成员，添加一个吧</p>
          </div>
        ) : (
          members.map(m => (
            <div key={m.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-start gap-3">
              <div className="text-3xl w-12 h-12 flex items-center justify-center bg-gray-50 rounded-xl shrink-0">
                {m.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-gray-800">{m.name}</h3>
                {m.allergies.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {m.allergies.map(a => (
                      <span key={a} className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100">⚠️ {a}</span>
                    ))}
                  </div>
                )}
                {m.preferences.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {m.preferences.map(p => (
                      <span key={p} className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100">{p}</span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => openEdit(m)} className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center text-sm active:bg-blue-100">✏️</button>
                <button onClick={() => { if (confirm('确定删除「' + m.name + '」吗？')) remove(m.id); }} className="w-8 h-8 rounded-lg bg-red-50 text-red-500 flex items-center justify-center text-sm active:bg-red-100">🗑️</button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Member Form Modal */}
      <AnimatePresence>
        {showForm && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/40 z-40"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={resetForm}
            />
            <motion.div
              className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto"
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 bg-gray-300 rounded-full" />
              </div>
              <div className="flex items-center justify-between px-5 pb-3">
                <h2 className="text-lg font-bold text-gray-800">{editingId ? '编辑成员' : '添加成员'}</h2>
                <button onClick={resetForm} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">✕</button>
              </div>
              <div className="px-5 pb-8 space-y-5">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">姓名</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="输入姓名"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-base focus:outline-none focus:ring-2 focus:ring-orange-300" />
                </div>
                {/* Emoji */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">头像</label>
                  <div className="grid grid-cols-6 gap-2">
                    {EMOJI_OPTIONS.map(e => (
                      <button key={e} onClick={() => setAvatar(e)}
                        className={"w-full aspect-square rounded-xl text-2xl flex items-center justify-center transition-all " + (avatar === e ? 'bg-orange-100 ring-2 ring-orange-400 scale-110' : 'bg-gray-50')}>
                        {e}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Allergies */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">过敏食材</label>
                  <div className="flex flex-wrap gap-2">
                    {ALLERGEN_PRESETS.map(a => (
                      <button key={a} onClick={() => toggleAllergy(a)}
                        className={"px-3 py-1.5 rounded-full text-sm border transition-all " + (allergies.includes(a) ? 'bg-red-50 border-red-300 text-red-700' : 'bg-gray-50 border-gray-200 text-gray-600')}>
                        ⚠️ {a}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Preferences */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">口味偏好</label>
                  <div className="flex flex-wrap gap-2">
                    {PREFERENCE_PRESETS.map(p => (
                      <button key={p} onClick={() => togglePref(p)}
                        className={"px-3 py-1.5 rounded-full text-sm border transition-all " + (preferences.includes(p) ? 'bg-amber-50 border-amber-300 text-amber-700' : 'bg-gray-50 border-gray-200 text-gray-600')}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                {/* Submit */}
                <button onClick={handleSave} disabled={!name.trim()}
                  className="w-full py-3 rounded-xl bg-orange-500 text-white font-semibold disabled:opacity-40 active:scale-[0.98] transition-all">
                  {editingId ? '保存修改' : '添加成员'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
