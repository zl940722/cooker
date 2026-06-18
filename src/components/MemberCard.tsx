import type { FamilyMember } from '../types';

interface MemberCardProps {
  member: FamilyMember;
  onEdit: (member: FamilyMember) => void;
  onDelete: (id: string) => void;
}

export default function MemberCard({ member, onEdit, onDelete }: MemberCardProps) {
  const handleDelete = () => {
    if (window.confirm(`确定删除「${member.name}」吗？`)) {
      onDelete(member.id);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-start gap-3">
      {/* Avatar */}
      <div className="text-4xl w-14 h-14 flex items-center justify-center bg-gray-50 rounded-xl shrink-0">
        {member.avatar}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-semibold text-gray-800 truncate">{member.name}</h3>

        {/* Allergy tags */}
        {member.allergies.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {member.allergies.map(a => (
              <span
                key={a}
                className="inline-block text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100"
              >
                ⚠️ {a}
              </span>
            ))}
          </div>
        )}

        {/* Preference tags */}
        {member.preferences.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {member.preferences.map(p => (
              <span
                key={p}
                className="inline-block text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100"
              >
                {p}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 shrink-0">
        <button
          onClick={() => onEdit(member)}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-500 hover:bg-blue-100 transition-colors text-sm"
          aria-label="编辑"
        >
          ✏️
        </button>
        <button
          onClick={handleDelete}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors text-sm"
          aria-label="删除"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
