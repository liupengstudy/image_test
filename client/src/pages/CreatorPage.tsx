import { useState } from 'react';
import { Link } from 'react-router-dom';
import { generateImage } from '../services/api';

const CreatorPage = () => {
  const [prompt, setPrompt] = useState('');
  const [boardName, setBoardName] = useState('NEW BOARD');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // 示例项目提示词
  const exampleProjects = [
    {
      title: 'Create an image of',
      description: 'a yellow modern living room with zen minimalism and indoor garden',
      image: 'https://via.placeholder.com/150'
    },
    {
      title: 'Make a video of',
      description: 'a bunny in 3d cartoon style playing guitar in front of a waterfall',
      image: 'https://via.placeholder.com/150'
    },
    {
      title: 'Make @character',
      description: 'a cartoon wearing a red jacket',
      image: 'https://via.placeholder.com/150'
    }
  ];
  
  // 处理提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    setError(null);
    setIsGenerating(true);
    setBoardName(prompt.split(' ').slice(0, 2).join(' ').toUpperCase());
    
    try {
      // 调用API生成图像
      const response = await generateImage({ prompt });
      
      if (response.success && response.data) {
        setGeneratedImages(response.data.images);
        setBoardName(response.data.boardName);
      } else {
        setError(response.message || '图像生成失败');
        console.error('生成失败:', response.error);
      }
    } catch (err) {
      setError('图像生成请求失败');
      console.error('请求错误:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  // 处理示例项目点击
  const handleExampleClick = (example: typeof exampleProjects[0]) => {
    const fullPrompt = `${example.title} ${example.description}`;
    setPrompt(fullPrompt);
    handleSubmit(new Event('submit') as unknown as React.FormEvent);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#121212] to-[#222] text-white flex flex-col">
      {/* 顶部导航 */}
      <header className="p-4 flex items-center">
        <Link to="/" className="mr-4">
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold">{boardName}</h1>
        {generatedImages.length > 0 && (
          <div className="ml-auto">
            <button className="btn">Share</button>
          </div>
        )}
      </header>

      {/* 左侧边栏 */}
      <div className="fixed left-0 top-0 h-full w-16 bg-black bg-opacity-30 flex flex-col items-center pt-20 space-y-6">
        <div className="w-8 h-8 bg-gray-700 rounded-md flex items-center justify-center cursor-pointer">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <div className="w-8 h-8 bg-gray-700 rounded-md flex items-center justify-center cursor-pointer">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
        </div>
        <div className="w-8 h-8 bg-gray-700 rounded-md flex items-center justify-center cursor-pointer">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>

      {/* 主内容区 */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 ml-16">
        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 text-white px-4 py-2 rounded-md mb-6">
            {error}
          </div>
        )}
        
        {!generatedImages.length ? (
          // 创建新项目的界面
          <div className="max-w-md w-full mx-auto">
            {exampleProjects.map((project, index) => (
              <div 
                key={index} 
                className="flex items-center mb-8 cursor-pointer hover:bg-gray-800 hover:bg-opacity-30 p-3 rounded-lg transition-all"
                onClick={() => handleExampleClick(project)}
              >
                <div className="h-16 w-16 rounded-full overflow-hidden mr-4 flex-shrink-0">
                  <img src={project.image} alt={project.title} className="h-full w-full object-cover" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">{project.title}</h3>
                  <p className="text-gray-400">{project.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // 生成的图像展示界面
          <div className="w-full max-w-6xl">
            <div className="grid grid-cols-2 gap-4">
              {generatedImages.map((image, index) => (
                <div key={index} className="rounded-lg overflow-hidden">
                  <img src={image} alt={`Generated ${index}`} className="w-full h-auto" />
                </div>
              ))}
            </div>
            <div className="mt-6 flex space-x-4">
              <button className="bg-gray-700 px-4 py-2 rounded-full flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Show More
              </button>
              <button className="bg-gray-700 px-4 py-2 rounded-full flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Brainstorm
              </button>
              <button className="bg-gray-700 px-4 py-2 rounded-full flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                </svg>
                Reply
              </button>
            </div>
          </div>
        )}
      </main>

      {/* 底部输入区 */}
      <footer className="p-4 bg-black bg-opacity-40 sticky bottom-0">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="What do you want to see..."
            className="w-full bg-gray-800 bg-opacity-80 rounded-full px-6 py-3 pr-20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-2">
            <button type="button" className="text-gray-400 hover:text-white">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
            <button type="button" className="text-gray-400 hover:text-white">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
            <button type="button" className="text-gray-400 hover:text-white">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
            <div className="bg-gray-700 rounded-full px-3 py-1 text-xs flex items-center">
              <span>1 VIDEO</span>
              <span className="mx-1">•</span>
              <span>16:9</span>
              <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </form>
      </footer>

      {/* 生成中覆盖层 */}
      {isGenerating && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-xl">生成图像中...</p>
            <p className="text-gray-400 mt-2">正在使用DeepSeek模型进行生成</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatorPage; 