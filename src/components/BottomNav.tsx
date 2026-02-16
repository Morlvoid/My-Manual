import { motion } from 'framer-motion';
import { CalendarDays, PenLine, Lightbulb, User } from 'lucide-react';

interface BottomNavProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const navItems = [
  { id: 'timeline', label: '时间轴', icon: CalendarDays },
  { id: 'write', label: '写日记', icon: PenLine },
  { id: 'knowledge', label: 'AI科普', icon: Lightbulb },
  { id: 'profile', label: '我的', icon: User },
];

export function BottomNav({ currentPage, onPageChange }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-[#E8E8E8] z-50">
      <div className="max-w-lg mx-auto px-4">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className="relative flex flex-col items-center justify-center w-16 h-full"
              >
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={`flex flex-col items-center gap-1 transition-colors duration-200 ${
                    isActive ? 'text-[#7C9A92]' : 'text-[#9A9A9A]'
                  }`}
                >
                  <Icon 
                    size={22} 
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span className={`text-xs ${isActive ? 'font-medium' : ''}`}>
                    {item.label}
                  </span>
                </motion.div>
                
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -top-px left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#7C9A92] rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
      {/* 安全区域适配 */}
      <div className="h-safe-area-inset-bottom bg-white" />
    </nav>
  );
}
