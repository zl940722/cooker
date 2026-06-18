import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { FamilyMember } from '../types';
import { ALLERGEN_PRESETS, PREFERENCE_PRESETS } from '../types';

const EMOJI_OPTIONS = ['👨', '👩', '👦', '👧', '👴', '👵', '🧑', '👶', '🐱', '🐶', '🧒', '👸'];

interface MemberFormProps {
  visible: boolean;
  member: FamilyMember | null; // null = add mode
  onSave: (data: Omit<FamilyMember, 'id'>) => void;
  onClose: () => void;
}

export default function MemberForm({ visible, member, onSave, onClose }: MemberFormProps) {
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('👨');
  const [allergies, setAllergies] = useState<string[]>([]);
  const [preferences, setPreferences] = useState<string[]>([]);

  // Reset form when member changes or form opens
  useEffect(() => {
    if (member) {
      setName(member.name);
      setAvatar(member.avatar);
      setAllergies(member.allergies);
      setPreferences(member.preferences);
    } else {
      setName('');
      setAvatar('👨');
      setAllergies([]);
      setPreferences([]);
    }
  }, [member, visible]);

  const toggleAllergy = (item: string) => {
    setAllergies(prev =>
      prev.includes(item) ? prev.filter(a => a !== item) : [...prev, item]
    );
  };

  const togglePreference = (item: string) => {
    setPreferences(prev =>
      prev.includes(item) ? prev.filter(p => p !== item) : [...prev, item]
    );
  };

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave({ name: trimmed, avatar, allergies, preferences });
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/40 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal Panel */}
          <motion.div
            className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl max-h-[90vh] overflow-y-auto"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-gray-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-3">
              <h2 className="text-lg font-bold text-gray-800">
                {member ? '编辑成员' : '添加成员'}
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 text-lg"
              >
                ✕
              </button>
            </div>

            {/* Form Body */}
            <div className="px-5 pb-8 space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  姓名
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="输入家庭成员姓名"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-base focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300"
                />
              </div>

              {/* Emoji Avatar Picker */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  头像
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {EMOJI_OPTIONS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => setAvatar(emoji)}
                      className={`w-full aspect-square rounded-xl text-2xl flex items-center justify-center transition-all ${
                        avatar === emoji
                          ? 'bg-orange-100 ring-2 ring-orange-400 scale-110'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Allergies */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  过敏食材
                </label>
                <div className="flex flex-wrap gap-2">
                  {ALLERGEN_PRESETS.map(item => (
                    <label
                      key={item}
                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm cursor-pointer border transition-all ${
                        allergies.includes(item)
                          ? 'bg-red-50 border-red-300 text-red-700'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={allergies.includes(item)}
                        onChange={() => toggleAllergy(item)}
                        className="sr-only"
                      />
                      ⚠️ {item}
                    </label>
                  ))}
                </div>
              </div>

              {/* Preferences */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  口味偏好
                </label>
                <div className="flex flex-wrap gap-2">
                  {PREFERENCE_PRESETS.map(item => (
                    <label
                      key={item}
                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm cursor-pointer border transition-all ${
                        preferences.includes(item)
                          ? 'bg-amber-50 border-amber-300 text-amber-700'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={preferences.includes(item)}
                        onChange={() => togglePreference(item)}
                        className="sr-only"
                      />
                      {item}
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!name.trim()}
                className="w-full py-3 rounded-xl bg-orange-500 text-white font-semibold text-base disabled:opacity-40 disabled:cursor-not-allowed hover:bg-orange-600 active:scale-[0.98] transition-all mb-4"
              >
                {member ? '保存修改' : '添加成员'}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
