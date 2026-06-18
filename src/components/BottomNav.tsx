import { NavLink } from 'react-router-dom';

const tabs = [
  { to: '/', icon: '🧊', label: '冰箱' },
  { to: '/recommend', icon: '🤖', label: '推荐' },
  { to: '/menu', icon: '📋', label: '菜单' },
  { to: '/recipes', icon: '📖', label: '菜谱' },
  { to: '/settings', icon: '👨‍👩‍👧‍👦', label: '家庭' },
] as const;

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto flex max-w-lg items-center justify-around">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-0.5 py-2 text-xs transition-colors ${
                isActive ? 'text-blue-500' : 'text-gray-400'
              }`
            }
          >
            <span className="text-xl leading-none">{tab.icon}</span>
            <span>{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
