import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import { BottomNav } from '@/components/BottomNav';
import { TimelinePage } from '@/pages/TimelinePage';
import { WritePage } from '@/pages/WritePage';
import { KnowledgePage } from '@/pages/KnowledgePage';
import { ProfilePage } from '@/pages/ProfilePage';
import { knowledgeOperations } from '@/lib/db';

function App() {
  const [currentPage, setCurrentPage] = useState('timeline');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 初始化数据库
    const init = async () => {
      try {
        await knowledgeOperations.initDefaultCards();
        setIsReady(true);
      } catch (error) {
        toast.error('应用初始化失败');
      }
    };
    init();
  }, []);

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'timeline':
        return <TimelinePage />;
      case 'write':
        return <WritePage onPageChange={handlePageChange} />;
      case 'knowledge':
        return <KnowledgePage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <TimelinePage />;
    }
  };

  if (!isReady) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 border-4 border-[#E8E8E8] border-t-[#7C9A92] rounded-full animate-spin" />
          <p className="text-[#6B6B6B]">加载中...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Toast 通知 */}
      <Toaster 
        position="top-center"
        toastOptions={{
          style: {
            background: '#2C2C2C',
            color: '#fff',
            borderRadius: '12px',
          },
        }}
      />

      {/* 页面内容 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {renderPage()}
        </motion.div>
      </AnimatePresence>

      {/* 底部导航 */}
      <BottomNav currentPage={currentPage} onPageChange={handlePageChange} />
    </div>
  );
}

export default App;
