import { useState, useEffect } from 'react';
import { getBrainstormCategories, getCreativePrompts, BrainstormCategory, CreativePrompt } from '../services/api';

interface BrainstormPanelProps { 
  isOpen: boolean; 
  onClose: () => void;
  onSelect: (prompt: string) => void;
}

const BrainstormPanel: React.FC<BrainstormPanelProps> = ({ isOpen, onClose, onSelect }) => {
  const [categories, setCategories] = useState<BrainstormCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('landscapes');
  const [prompts, setPrompts] = useState<CreativePrompt[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingCategory, setLoadingCategory] = useState<string | null>(null);

  // 获取所有类别
  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  // 获取选定类别的提示
  useEffect(() => {
    if (isOpen && selectedCategory) {
      fetchPrompts(selectedCategory);
    }
  }, [isOpen, selectedCategory]);

  // 获取类别列表
  const fetchCategories = async () => {
    try {
      const categoriesData = await getBrainstormCategories();
      setCategories(categoriesData);
      
      // 如果没有选择类别，默认选择第一个
      if (!selectedCategory && categoriesData.length > 0) {
        setSelectedCategory(categoriesData[0].id);
      }
    } catch (error) {
      console.error('获取头脑风暴类别失败:', error);
    }
  };

  // 获取提示数据
  const fetchPrompts = async (category: string) => {
    setLoading(true);
    setLoadingCategory(category);
    try {
      const promptsData = await getCreativePrompts(category, 4);
      setPrompts(promptsData);
    } catch (error) {
      console.error(`获取类别 "${category}" 的提示失败:`, error);
    } finally {
      setLoading(false);
      setLoadingCategory(null);
    }
  };

  // 刷新当前类别的提示
  const refreshPrompts = () => {
    if (selectedCategory) {
      fetchPrompts(selectedCategory);
    }
  };

  // 选择类别
  const handleCategorySelect = (categoryId: string) => {
    if (categoryId !== selectedCategory) {
      setSelectedCategory(categoryId);
    }
  };

  // 如果面板未打开，返回null
  if (!isOpen) return null;

  return (
    <div className="fixed top-0 right-0 bottom-0 max-w-[480px] w-full bg-[#121212] border-l border-gray-800/30 shadow-xl z-50 overflow-y-auto">
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold tracking-wider uppercase">头脑风暴</h2>
          <button 
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-800/60"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 类别选择 */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategorySelect(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-white text-black'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {category.displayName}
              </button>
            ))}
          </div>
        </div>

        {/* 刷新按钮 */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-medium">创意提示</h3>
          <button
            onClick={refreshPrompts}
            disabled={loading}
            className={`p-2 rounded-full ${
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'
            }`}
          >
            <svg
              className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>

        {/* 提示列表 */}
        <div className="space-y-4">
          {loading ? (
            // 加载中状态
            <div className="flex flex-col items-center justify-center py-10">
              <svg className="animate-spin h-10 w-10 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-3 text-gray-400">正在生成创意提示...</p>
            </div>
          ) : (
            // 提示列表
            prompts.map((prompt, index) => (
              <div 
                key={index}
                className="flex items-center gap-4 cursor-pointer hover:bg-gray-800/30 p-3 rounded-lg transition-colors"
                onClick={() => onSelect(prompt.description)}
              >
                <div className="w-16 h-16 rounded-full overflow-hidden flex-shrink-0 bg-gray-800">
                  {prompt.image ? (
                    <img src={prompt.image} alt={prompt.description} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                      </svg>
                    </div>
                  )}
                </div>
                <p className="text-gray-300">{prompt.description}</p>
              </div>
            ))
          )}

          {!loading && prompts.length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-400">没有找到相关提示</p>
              <button 
                onClick={refreshPrompts}
                className="mt-3 px-4 py-2 bg-gray-800 rounded-full text-sm hover:bg-gray-700 transition-colors"
              >
                重新生成
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrainstormPanel; 