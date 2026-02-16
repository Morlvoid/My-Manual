import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  ChevronRight, 
  Download, 
  Upload, 
  Trash2, 
  Settings, 
  Info,
  FileText,
  Award,
  Calendar,
  Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { diaryOperations, knowledgeOperations } from '@/lib/db';
import { toast } from 'sonner';

export function ProfilePage() {
  const [stats, setStats] = useState({
    totalEntries: 0,
    totalTags: 0,
    streakDays: 0,
    favoriteKnowledges: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const loadStats = useCallback(async () => {
    setIsLoading(true);
    const diaryStats = await diaryOperations.getStats();
    const favorites = await knowledgeOperations.getFavorites();
    setStats({
      totalEntries: diaryStats.totalEntries,
      totalTags: diaryStats.totalTags,
      streakDays: diaryStats.streakDays,
      favoriteKnowledges: favorites.length,
    });
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleExport = async () => {
    try {
      const entries = await diaryOperations.getAll();
      const data = {
        diaryEntries: entries,
        exportDate: new Date().toISOString(),
        version: '1.0.0',
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `个人成长日记_${new Date().toLocaleDateString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('数据导出成功');
    } catch (error) {
      toast.error('导出失败');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (data.diaryEntries && Array.isArray(data.diaryEntries)) {
        // 这里可以实现导入逻辑
        toast.success('数据导入成功');
      } else {
        toast.error('无效的数据格式');
      }
    } catch (error) {
      toast.error('导入失败');
    }
  };

  const handleClearAll = async () => {
    try {
      const entries = await diaryOperations.getAll();
      for (const entry of entries) {
        await diaryOperations.delete(entry.id);
      }
      toast.success('所有数据已清空');
      loadStats();
    } catch (error) {
      toast.error('清空失败');
    }
  };

  const menuItems = [
    {
      id: 'archive',
      icon: FileText,
      label: '个人档案',
      description: '查看和编辑个人信息',
      onClick: () => toast.info('个人档案功能开发中'),
    },
    {
      id: 'export',
      icon: Download,
      label: '导出数据',
      description: '将日记导出为JSON文件',
      onClick: handleExport,
    },
    {
      id: 'import',
      icon: Upload,
      label: '导入数据',
      description: '从JSON文件导入日记',
      onClick: () => document.getElementById('import-file')?.click(),
    },
    {
      id: 'settings',
      icon: Settings,
      label: '设置',
      description: '应用偏好设置',
      onClick: () => toast.info('设置功能开发中'),
    },
    {
      id: 'about',
      icon: Info,
      label: '关于',
      description: '版本 1.0.0',
      onClick: () => toast.info('个人成长日记 v1.0.0'),
    },
  ];

  return (
    <div className="min-h-screen pb-24 bg-[#FAF9F6]">
      {/* 头部 */}
      <header className="bg-[#FAF9F6] border-b border-[#E8E8E8]">
        <div className="max-w-lg mx-auto px-4 py-6">
          <h1 className="text-xl font-semibold text-[#2C2C2C]">我的</h1>
        </div>
      </header>

      {/* 内容区域 */}
      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* 用户信息卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-[#F0F0F0]"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-[#7C9A92] to-[#9AB8B0] rounded-2xl flex items-center justify-center text-white text-2xl">
              <User size={32} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#2C2C2C]">日记用户</h2>
              <p className="text-sm text-[#9A9A9A]">
                加入于 {new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' })}
              </p>
            </div>
          </div>
        </motion.div>

        {/* 统计卡片 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-[#F0F0F0]"
        >
          <h3 className="text-sm font-medium text-[#6B6B6B] mb-4 flex items-center gap-2">
            <Award size={16} />
            数据统计
          </h3>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 bg-[#E8F4F8] rounded-xl flex items-center justify-center">
                <FileText size={20} className="text-[#7C9A92]" />
              </div>
              <p className="text-2xl font-semibold text-[#2C2C2C]">
                {isLoading ? '-' : stats.totalEntries}
              </p>
              <p className="text-xs text-[#9A9A9A]">篇日记</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 bg-[#F0E6DC] rounded-xl flex items-center justify-center">
                <Tag size={20} className="text-[#C9A87C]" />
              </div>
              <p className="text-2xl font-semibold text-[#2C2C2C]">
                {isLoading ? '-' : stats.totalTags}
              </p>
              <p className="text-xs text-[#9A9A9A]">个标签</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-2 bg-[#E8F8E8] rounded-xl flex items-center justify-center">
                <Calendar size={20} className="text-[#8FB996]" />
              </div>
              <p className="text-2xl font-semibold text-[#2C2C2C]">
                {isLoading ? '-' : stats.streakDays}
              </p>
              <p className="text-xs text-[#9A9A9A]">连续天数</p>
            </div>
          </div>
        </motion.div>

        {/* 菜单列表 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-sm border border-[#F0F0F0] overflow-hidden"
        >
          {menuItems.map((item, index) => (
            <button
              key={item.id}
              onClick={item.onClick}
              className={`w-full flex items-center gap-4 p-4 text-left hover:bg-[#F9F9F9] transition-colors ${
                index !== menuItems.length - 1 ? 'border-b border-[#F0F0F0]' : ''
              }`}
            >
              <div className="w-10 h-10 bg-[#F5F5F0] rounded-xl flex items-center justify-center text-[#6B6B6B]">
                <item.icon size={20} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-[#2C2C2C]">{item.label}</p>
                <p className="text-xs text-[#9A9A9A]">{item.description}</p>
              </div>
              <ChevronRight size={18} className="text-[#9A9A9A]" />
            </button>
          ))}
        </motion.div>

        {/* 隐藏的文件输入 */}
        <input
          id="import-file"
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />

        {/* 清空数据 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Dialog>
            <DialogTrigger asChild>
              <button className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-[#F0F0F0] text-left hover:bg-red-50 transition-colors">
                <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center text-red-500">
                  <Trash2 size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-red-500">清空所有数据</p>
                  <p className="text-xs text-[#9A9A9A]">此操作不可恢复</p>
                </div>
                <ChevronRight size={18} className="text-[#9A9A9A]" />
              </button>
            </DialogTrigger>
            <DialogContent className="bg-white rounded-2xl">
              <DialogHeader>
                <DialogTitle>确认清空所有数据</DialogTitle>
                <DialogDescription>
                  这将删除所有日记条目，此操作不可恢复。确定要继续吗？
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2">
                <Button variant="outline" className="rounded-xl">
                  取消
                </Button>
                <Button 
                  onClick={handleClearAll}
                  className="rounded-xl bg-red-500 hover:bg-red-600"
                >
                  确认清空
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* 版本信息 */}
        <p className="text-center text-xs text-[#9A9A9A] pt-4">
          个人成长日记 v1.0.0
        </p>
      </main>
    </div>
  );
}
