import { useState, useRef, useEffect } from 'react';
import { generateImage } from '../services/api';
import BrainstormPanel from '../components/BrainstormPanel';
import { createPortal } from 'react-dom';

// 消息类型定义
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  optimizedPrompt?: string; // AI优化后的提示词
  images?: string[];  // AI生成的图像
  userImages?: string[]; // 用户上传的图像
}

// 会话组件类型
interface ConversationProps {
  messages: Message[];
  currentIndex: number;
  handleShowMore: (currentIndex: number) => void;
  openBrainstorm: () => void;
  handleImageReference: (images: string[]) => void;
}

// 操作按钮组件
const ActionButton = ({ icon, label, onClick, loading = false }: { 
  icon: React.ReactNode, 
  label: string, 
  onClick: () => void,
  loading?: boolean 
}) => (
  <button 
    onClick={onClick}
    disabled={loading}
    className={`flex items-center gap-2 py-2.5 px-5 rounded-full ${loading ? 'bg-[#333333] opacity-80' : 'bg-[#222222] hover:bg-[#333333]'} text-white text-sm font-medium transition-colors`}
  >
    {loading ? (
      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    ) : (
      icon
    )}
    <span>{loading ? '生成中...' : label}</span>
  </button>
);

// 圆形图标按钮组件
const IconButton = ({ icon, onClick }: { icon: React.ReactNode, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="w-10 h-10 flex items-center justify-center rounded-full bg-[#222222] hover:bg-[#333333] text-white transition-colors"
  >
    {icon}
  </button>
);

// 单个会话组件
const Conversation = ({ messages, currentIndex, handleShowMore, openBrainstorm, handleImageReference }: ConversationProps) => {
  // 增加加载状态
  const [isLoading, setIsLoading] = useState(false);
  
  // 用户消息和AI回复成对出现
  const userMessage = messages[currentIndex * 2];
  const _aiMessage = messages[currentIndex * 2 + 1];
  
  if (!userMessage || !_aiMessage) return null;
  
  // 处理显示更多按钮点击
  const onShowMoreClick = async () => {
    setIsLoading(true);
    await handleShowMore(currentIndex);
    setIsLoading(false);
  };

  // 处理图像引用
  const onReferenceClick = () => {
    if (_aiMessage.images && _aiMessage.images.length > 0) {
      handleImageReference(_aiMessage.images);
    }
  };
  
  return (
    <div className="w-full max-w-7xl mx-auto mb-24 px-8">
      {/* 用户输入 */}
      <div className="mb-4">
        <h2 className="text-lg font-medium mb-1 text-gray-300">{userMessage.content}</h2>
        
        {userMessage.userImages && userMessage.userImages.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {userMessage.userImages.map((image, index) => (
              <div key={index} className="w-24 h-24 rounded-md overflow-hidden">
                <img 
                  src={image} 
                  alt={`Uploaded ${index}`} 
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* AI回复的提示词 */}
      <div className="mb-4">
        <p className="text-gray-400 text-base">{_aiMessage.optimizedPrompt || _aiMessage.content}</p>
      </div>
      
      {/* 操作按钮 */}
      <div className="flex flex-wrap gap-3 mb-6">
        <ActionButton
          icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 4L12 12M12 12L4 4M12 12L4 20M12 12L20 20" stroke="currentColor" strokeWidth="0" fill="currentColor" />
            <path d="M17 3.3C17.8 2.4 19.2 2.4 20 3.3V3.3C20.8 4.1 20.9 5.5 20 6.3L10.8 15.5C10.3 16 9.7 16.3 9 16.4L6 16.7C5 16.9 4.1 16 4.3 15L4.6 12C4.7 11.3 5 10.7 5.5 10.2L13.7 2.1C14.5 1.3 15.9 1.4 16.7 2.2V2.2C17.5 3 17.6 4.3 16.9 5.1L5.5 16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>}
          label="显示更多"
          onClick={onShowMoreClick}
          loading={isLoading}
        />
        
        <ActionButton
          icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" fill="currentColor" />
            <path d="M14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5z" fill="currentColor" />
            <path d="M4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4z" fill="currentColor" />
            <path d="M14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" fill="currentColor" />
          </svg>}
          label="头脑风暴"
          onClick={openBrainstorm}
        />
        
        <ActionButton
          icon={<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 9h8M8 13h5M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7M6 13a4 4 0 108 0m3 0a1 1 0 100-2v2zm0-2a1 1 0 100-2v2zm0-2V6v3z" stroke="currentColor" strokeWidth="0" fill="currentColor" />
            <path d="M15 9.2c.2 0 .3.1.4.2l.1.2v2.2c0 .2-.1.3-.2.4l-.1.1-.2.1h-2.2c-.2 0-.3-.1-.4-.2L12 12c0-.1-.1-.2-.1-.2v-2.2c0-.2.1-.3.2-.4l.2-.1.1-.1h2.2zm-9.3 2.9h2.2c.2 0 .3.1.4.2l.1.2v2.2c0 .2-.1.3-.2.4l-.2.1-.1.1H5.8c-.2 0-.3-.1-.4-.2l-.1-.2v-2.2c0-.2.1-.3.2-.4l.2-.1h-.1 9l.1.1.2.2c.4.4.7.8.9 1.2l-5.2 5.2c-.4.4-1 .4-1.4 0-.4-.4-.4-1 0-1.4l4.1-4H9.2c-1.1 0-2-.9-2-2v-1-2c0-.5.2-1 .5-1.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>}
          label="引用"
          onClick={onReferenceClick}
        />
        
        <div className="flex items-center gap-3">
          <IconButton
            icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>}
            onClick={() => {}}
          />
          
          <IconButton
            icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>}
            onClick={() => {}}
          />
          
          <IconButton
            icon={<svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>}
            onClick={() => {}}
          />
        </div>
      </div>
      
      {/* 生成的图片 */}
      {_aiMessage.images && _aiMessage.images.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {_aiMessage.images.map((image, index) => (
            <div key={index} className="relative group rounded-lg overflow-hidden shadow-lg">
              <img 
                src={image} 
                alt={`Generated ${index}`} 
                className="w-full h-auto object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <button className="p-2 bg-black/40 rounded-full">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 示例组件
interface ExampleProps {
  image: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

const Example = ({ image, title, description, onClick }: ExampleProps) => (
  <div className="flex items-center gap-8 hover:bg-gray-800/20 p-6 rounded-2xl cursor-pointer transition-colors" onClick={onClick}>
    <div className="h-[72px] w-[72px] rounded-full overflow-hidden flex-shrink-0 border border-gray-700/30 shadow-lg">
      {image}
    </div>
    <div className="flex-1">
      <h3 className="text-lg font-medium text-white">{title}</h3>
      <p className="text-gray-400 text-sm mt-1.5">{description}</p>
    </div>
  </div>
);

// 定义历史记录项目类型
interface Project {
  id: string;
  title: string;
  subtitle: string;
  ideas: number;
  images: string[];
  backgroundColor: string;
  liked?: boolean;
}

// 项目卡片组件
const ProjectCard = ({ project, onClick }: { project: Project, onClick?: () => void }) => {
  return (
    <div 
      className={`relative rounded-3xl overflow-hidden cursor-pointer transition-transform hover:scale-[1.02] ${project.backgroundColor}`}
      onClick={onClick}
    >
      <div className="p-6 h-full flex flex-col">
        <div className="mb-auto">
          <h3 className="text-xl font-bold tracking-wide">{project.title}</h3>
          <h4 className="text-sm text-white/80 font-medium mt-1">{project.subtitle}</h4>
          <p className="text-sm text-white/70 mt-3">{project.ideas} Ideas {project.liked && '• 4 ♥'}</p>
        </div>
        
        <div className="flex gap-2 mt-4 justify-end">
          {project.images.slice(0, 3).map((image, index) => (
            <div 
              key={index} 
              className={`w-20 h-24 rounded-xl overflow-hidden shadow-lg ${index === 2 ? 'mr-4' : ''}`}
              style={{ transform: `rotate(${index * 2 - 2}deg)` }}
            >
              <img src={image} alt={`${project.title} ${index}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 历史记录页面组件
const ProjectsPage = ({ onCreateNew, onSelectProject }: { onCreateNew: () => void, onSelectProject: (project: Project) => void }) => {
  // 示例项目数据
  const projects: Project[] = [
    {
      id: '1',
      title: 'SEASIDE STROLL',
      subtitle: '',
      ideas: 33,
      liked: true,
      images: [
        'https://picsum.photos/seed/seaside1/300',
        'https://picsum.photos/seed/seaside2/300',
        'https://picsum.photos/seed/seaside3/300'
      ],
      backgroundColor: 'bg-gradient-to-br from-blue-700/40 to-purple-700/40'
    },
    {
      id: '2',
      title: 'FLYING',
      subtitle: 'PIG',
      ideas: 1,
      images: [
        'https://picsum.photos/seed/flying1/300'
      ],
      backgroundColor: 'bg-gradient-to-br from-cyan-700/40 to-blue-700/40'
    },
    {
      id: '3',
      title: 'SLEEPING',
      subtitle: 'KITTEN',
      ideas: 32,
      images: [
        'https://picsum.photos/seed/kitten1/300',
        'https://picsum.photos/seed/kitten2/300',
        'https://picsum.photos/seed/kitten3/300'
      ],
      backgroundColor: 'bg-gradient-to-br from-gray-500/40 to-yellow-500/40'
    },
    {
      id: '4',
      title: 'VAST',
      subtitle: 'FOREST',
      ideas: 4,
      images: [
        'https://picsum.photos/seed/forest1/300',
        'https://picsum.photos/seed/forest2/300',
        'https://picsum.photos/seed/forest3/300'
      ],
      backgroundColor: 'bg-gradient-to-br from-green-700/40 to-lime-700/40'
    },
    {
      id: '5',
      title: 'RETRO CITYSCAPE',
      subtitle: 'REVEAL',
      ideas: 60,
      images: [
        'https://picsum.photos/seed/city1/300',
        'https://picsum.photos/seed/city2/300',
        'https://picsum.photos/seed/city3/300'
      ],
      backgroundColor: 'bg-gradient-to-br from-violet-700/40 to-pink-700/40'
    },
    {
      id: '6',
      title: 'SERENE OUTDOOR',
      subtitle: 'MELODY',
      ideas: 24,
      images: [
        'https://picsum.photos/seed/outdoor1/300',
        'https://picsum.photos/seed/outdoor2/300',
        'https://picsum.photos/seed/outdoor3/300'
      ],
      backgroundColor: 'bg-gradient-to-br from-green-600/40 to-emerald-600/40'
    },
    {
      id: '7',
      title: 'COSMIC',
      subtitle: 'BUBBLE',
      ideas: 18,
      images: [
        'https://picsum.photos/seed/bubble1/300',
        'https://picsum.photos/seed/bubble2/300',
        'https://picsum.photos/seed/bubble3/300'
      ],
      backgroundColor: 'bg-gradient-to-br from-blue-900/40 to-indigo-900/40'
    },
    {
      id: '8',
      title: 'LILY VIBE',
      subtitle: 'LAMP',
      ideas: 24,
      images: [
        'https://picsum.photos/seed/lily1/300',
        'https://picsum.photos/seed/lily2/300',
        'https://picsum.photos/seed/lily3/300'
      ],
      backgroundColor: 'bg-gradient-to-br from-blue-800/40 to-sky-700/40'
    }
  ];
  
  return (
    <div className="flex-1 flex flex-col px-8 py-6 overflow-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl">
          <span className="font-light tracking-wide">Dream</span>
          <span className="font-bold tracking-widest ml-1">MACHINE</span>
        </h1>
      </div>
      
      <div className="grid grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectCard 
            key={project.id} 
            project={project} 
            onClick={() => onSelectProject(project)}
          />
        ))}
        
        <div 
          onClick={onCreateNew}
          className="rounded-3xl border-2 border-dashed border-gray-500/30 flex items-center justify-center p-6 cursor-pointer hover:border-gray-400/40 transition-colors min-h-[220px]"
        >
          <div className="flex flex-col items-center text-gray-400">
            <div className="w-12 h-12 rounded-full border-2 border-gray-500/50 flex items-center justify-center mb-3">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-sm font-medium">New Project</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const CreatorPage = () => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [showAspectRatioSelector, setShowAspectRatioSelector] = useState(false);
  const [projectTitle, setProjectTitle] = useState('SLEEPING KITTEN');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isBrainstormOpen, setIsBrainstormOpen] = useState(false);
  const [referencedImages, setReferencedImages] = useState<string[]>([]);
  // 新增视图状态 - 'create' 用于创作页, 'projects' 用于项目列表页
  const [view, setView] = useState<'create' | 'projects'>('create');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const aspectRatioSelectorRef = useRef<HTMLDivElement>(null);
  
  const aspectRatioOptions = ['9:16', '3:4', '1:1', '4:3', '16:9', '21:9'];
  
  // 示例项目
  const examples = [
    {
      image: <img src="https://picsum.photos/seed/backpack/200" alt="Backpack" className="w-full h-full object-cover" />,
      title: "生成一只可爱的小猫",
      description: "I'm creating four new images of an adorable kitten for you"
    },
    {
      image: <img src="https://picsum.photos/seed/bunny/200" alt="Bunny" className="w-full h-full object-cover" />,
      title: "关于风景的画面",
      description: "a beautiful landscape with mountains and a lake at sunset"
    },
    {
      image: <img src="https://picsum.photos/seed/style/200" alt="Style" className="w-full h-full object-cover" />,
      title: "Use this @style",
      description: "to make a Greek stone sculpture"
    }
  ];
  
  // 处理图像上传
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // newImages变量在这里声明，但现在直接通过回调更新状态，不需要事先收集
    // 保留此变量以便将来可能的扩展
    // const newImages: string[] = [];
    
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const imageUrl = e.target.result.toString();
          setUploadedImages(prev => [...prev, imageUrl]);
        }
      };
      reader.readAsDataURL(file);
    });
  };
  
  // 移除上传的图像
  const removeUploadedImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };
  
  // 触发文件选择对话框
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  // 处理图像引用
  const handleImageReference = (images: string[]) => {
    setReferencedImages(images);
  };
  
  // 移除引用的图像
  const removeReferencedImage = (index: number) => {
    setReferencedImages(prev => prev.filter((_, i) => i !== index));
  };
  
  // 清除所有引用的图像
  const clearReferencedImages = () => {
    setReferencedImages([]);
  };
  
  // 处理提交
  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() && uploadedImages.length === 0 && referencedImages.length === 0) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: prompt,
      userImages: uploadedImages.length > 0 ? [...uploadedImages] : undefined
    };
    
    setMessages(prev => [...prev, userMessage]);
    setPrompt('');
    setUploadedImages([]);
    setIsGenerating(true);
    setError(null);
    
    // 更新项目标题
    if (messages.length === 0) {
      // 如果是第一条消息，用作项目标题
      const titleWords = prompt.trim().split(' ').slice(0, 2).join(' ');
      setProjectTitle(titleWords.toUpperCase() || '图像生成');
    }
    
    try {
      // 滚动到底部
      setTimeout(() => scrollToBottom(), 100);
      
      // 添加临时的AI消息，显示加载状态
      const tempAiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "生成图像中...",
        optimizedPrompt: "正在根据您的提示创建图像，请稍候...",
        images: []
      };
      
      setMessages(prev => [...prev, tempAiMessage]);
      
      // 调用API生成图像，传递引用的图像和宽高比参数
      const response = await generateImage({ 
        prompt: userMessage.content,
        referenceImages: userMessage.userImages,
        referencedGeneratedImages: referencedImages.length > 0 ? referencedImages : undefined,
        aspectRatio: aspectRatio
      });
      
      // 清除引用的图像
      setReferencedImages([]);
      
      if (response.success && response.data) {
        // 创建模拟的图像数组（确保有4张图）
        let images = (response.data?.images || []).slice();
        while (images.length < 4) {
          const randomId = Math.floor(Math.random() * 1000);
          images.push(`https://picsum.photos/seed/${randomId}/800/600`);
        }
        
        // 更新之前添加的临时消息，而不是添加新消息
        setMessages(prev => {
          const updatedMessages = [...prev];
          // 找到最后一条消息并更新它
          if (updatedMessages.length > 0) {
            const lastMessage = updatedMessages[updatedMessages.length - 1];
            if (lastMessage.role === 'assistant') {
              updatedMessages[updatedMessages.length - 1] = {
                ...lastMessage,
                content: "I've created these images based on your request.",
                optimizedPrompt: response.data?.optimizedPrompt || userMessage.content,
                images: images
              };
            }
          }
          return updatedMessages;
        });
      } else {
        // 更新临时消息为错误状态
        setMessages(prev => {
          const updatedMessages = [...prev];
          if (updatedMessages.length > 0) {
            const lastMessage = updatedMessages[updatedMessages.length - 1];
            if (lastMessage.role === 'assistant') {
              updatedMessages[updatedMessages.length - 1] = {
                ...lastMessage,
                content: "生成失败",
                optimizedPrompt: response.message || '图像生成失败'
              };
            }
          }
          return updatedMessages;
        });
        
        setError(response.message || '图像生成失败');
        console.error('生成失败:', response.error);
      }
    } catch (err) {
      // 更新临时消息为错误状态
      setMessages(prev => {
        const updatedMessages = [...prev];
        if (updatedMessages.length > 0) {
          const lastMessage = updatedMessages[updatedMessages.length - 1];
          if (lastMessage.role === 'assistant') {
            updatedMessages[updatedMessages.length - 1] = {
              ...lastMessage,
              content: "请求失败",
              optimizedPrompt: '图像生成请求失败，请检查网络连接'
            };
          }
        }
        return updatedMessages;
      });
      
      // 清除引用的图像
      setReferencedImages([]);
      
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      setError('图像生成请求失败: ' + errorMessage);
      console.error('请求错误:', err);
    } finally {
      setIsGenerating(false);
      setTimeout(() => scrollToBottom(), 100);
    }
  };
  
  // 处理示例点击
  const handleExampleClick = (example: typeof examples[0]) => {
    setPrompt(`${example.title} - ${example.description}`);
    handleSubmit();
  };
  
  // 滚动到消息底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // 切换宽高比选择器的显示状态
  const toggleAspectRatio = () => {
    console.log('切换宽高比选择器，当前状态:', !showAspectRatioSelector);
    setShowAspectRatioSelector(prev => !prev);
  };
  
  // 选择宽高比并关闭选择器
  const selectAspectRatio = (ratio: string) => {
    setAspectRatio(ratio);
    setShowAspectRatioSelector(false);
  };
  
  // 点击外部区域关闭宽高比选择器
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        aspectRatioSelectorRef.current && 
        !aspectRatioSelectorRef.current.contains(event.target as Node)
      ) {
        setShowAspectRatioSelector(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // 当消息更新时滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // 页面加载时聚焦输入框
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // 获取会话组数
  const conversationCount = Math.floor(messages.length / 2);

  // 处理"显示更多"点击，生成更多图片
  const handleShowMore = async (conversationIndex: number) => {
    // 获取会话中的用户消息和AI回复
    const userIndex = conversationIndex * 2;
    const aiIndex = userIndex + 1;
    
    if (userIndex >= messages.length || aiIndex >= messages.length) {
      setError("无法加载更多图片：对话索引无效");
      return;
    }
    
    const userMessage = messages[userIndex];
    // 获取AI回复消息但不直接使用
    // const aiMessage = messages[aiIndex];
    
    // 显示加载状态
    setIsGenerating(true);
    setError(null);
    
    try {
      console.log(`尝试生成更多图像，提示词: "${userMessage.content}", 宽高比: "${aspectRatio || '默认'}"`);
      
      // 使用相同的提示词生成新图像，并传递宽高比参数
      const response = await generateImage({ 
        prompt: userMessage.content,
        referenceImages: userMessage.userImages,
        aspectRatio: aspectRatio
      });
      
      console.log('API响应:', response);
      
      if (response.success && response.data) {
        // 使用API返回的图像
        const newImages = response.data.images || [];
        
        if (newImages.length === 0) {
          setError('生成的图像列表为空');
          return;
        }
        
        // 更新消息中的图像，添加新生成的图像
        setMessages(prev => {
          const updatedMessages = [...prev];
          if (aiIndex < updatedMessages.length && updatedMessages[aiIndex].role === 'assistant') {
            // 合并现有图像和新图像
            const currentImages = updatedMessages[aiIndex].images || [];
            updatedMessages[aiIndex] = {
              ...updatedMessages[aiIndex],
              images: [...currentImages, ...newImages]
            };
          }
          return updatedMessages;
        });
      } else {
        setError(response.message || '无法生成更多图像');
        console.error('生成更多图像失败:', response.error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '未知错误';
      setError('生成更多图像请求失败: ' + errorMessage);
      console.error('请求错误:', err);
    } finally {
      setIsGenerating(false);
      setTimeout(() => scrollToBottom(), 100);
    }
  };

  // 处理头脑风暴示例选择
  const handleBrainstormSelect = (promptText: string) => {
    setPrompt(promptText);
    setIsBrainstormOpen(false);
    // 自动聚焦输入框，方便用户编辑
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };
  
  // 打开头脑风暴面板
  const openBrainstorm = () => {
    setIsBrainstormOpen(true);
  };
  
  // 关闭头脑风暴面板
  const closeBrainstorm = () => {
    setIsBrainstormOpen(false);
  };

  // 修改createNewConversation函数
  const createNewConversation = () => {
    // 确认用户是否要开始新对话
    if (messages.length > 0 && view === 'create' && !window.confirm('确定要开始新的对话吗？当前对话将被清空。')) {
      return;
    }
    
    // 清空所有状态
    setMessages([]);
    setPrompt('');
    setError(null);
    setIsGenerating(false);
    setUploadedImages([]);
    setReferencedImages([]);
    setProjectTitle('NEW BOARD');
    
    // 切换到创作视图
    setView('create');
    
    // 聚焦输入框
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };
  
  // 切换到项目列表视图
  const showProjects = () => {
    setView('projects');
  };
  
  // 选择项目
  const selectProject = (project: Project) => {
    setProjectTitle(project.title + (project.subtitle ? ` ${project.subtitle}` : ''));
    // 这里可以加载项目的历史消息等
    setView('create');
  };

  return (
    <div className="h-screen flex flex-col bg-[#070e17] text-white relative overflow-hidden">
      {/* 背景渐变效果 */}
      <div className="absolute inset-0 bg-gradient-radial from-[#1b3646]/20 to-transparent opacity-80"></div>
      <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-yellow-500/5 blur-[150px] rounded-full"></div>
      <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-purple-500/5 blur-[150px] rounded-full"></div>
      
      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* 左侧导航栏 */}
        <div className="w-[80px] bg-[#0a0f17] flex flex-col items-center py-6 border-r border-gray-800/20">
          <button 
            onClick={createNewConversation} 
            className="mb-10 w-12 h-12 flex items-center justify-center hover:bg-gray-800/40 transition-colors rounded-full"
          >
            <svg className="w-7 h-7 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4v16m8-8H4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          
          <div className="flex-1 flex flex-col gap-8 mt-8">
            <button 
              onClick={showProjects}
              className={`w-12 h-12 flex items-center justify-center hover:bg-gray-800/40 transition-colors rounded-full ${view === 'projects' ? 'bg-gray-800/70' : ''}`}
            >
              <svg className="w-7 h-7 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 4L13 4C15.2091 4 17 5.79086 17 8L17 8L17 20L6 20C4.89543 20 4 19.1046 4 18L4 6C4 4.89543 4.89543 4 6 4Z" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M17 8L19 8C20.1046 8 21 8.89543 21 10L21 18C21 19.1046 20.1046 20 19 20L17 20L17 8Z" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M13.25 15L7.75 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M13.25 11L7.75 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
            
            <button className="w-12 h-12 flex items-center justify-center hover:bg-gray-800/40 transition-colors rounded-full">
              <svg className="w-7 h-7 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="4" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
                <rect x="13" y="4" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
                <rect x="4" y="13" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
                <rect x="13" y="13" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </button>
          </div>
          
          <div className="mt-auto flex flex-col gap-8 mb-6">
            <button className="w-12 h-12 flex items-center justify-center hover:bg-gray-800/40 transition-colors rounded-full">
              <svg className="w-7 h-7 text-gray-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M12 16V15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M12 14C12 11 15 11.5 15 9C15 7.5 13.8284 6 12 6C10.1716 6 9 7.5 9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
            
            <button className="w-12 h-12 rounded-full overflow-hidden border border-gray-700/30">
              <img src="https://ui-avatars.com/api/?name=US&background=6366f1&color=fff" alt="User" className="w-full h-full object-cover" />
            </button>
          </div>
        </div>
        
        {/* 主内容区 - 根据视图状态显示不同内容 */}
        {view === 'create' ? (
          <div className="flex-1 flex flex-col max-h-screen overflow-hidden">
            {/* 顶部标题栏 - 改为固定浮动在内容上方 */}
            <div className="fixed top-4 left-0 right-0 z-30 pointer-events-none">
              <div className="w-full flex justify-between items-center pointer-events-auto">
                <div className="pl-[80px] ml-8">
                  <h1 className="text-xl font-bold tracking-wide">{projectTitle}</h1>
                </div>
                
                <div>
                  <button className="py-2 px-4 rounded-full bg-white text-gray-900 font-medium flex items-center gap-2 hover:bg-gray-200 transition-colors mr-8">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                    <span>Share</span>
                  </button>
                </div>
              </div>
            </div>
            
            {/* 对话内容区 - 调整为从页面顶部开始，不再为顶部导航栏预留空间 */}
            <div className="flex-1 overflow-y-auto px-0 pb-32 pt-0 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent relative z-10">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col justify-center items-center">
                  <div className="w-full max-w-[600px] mx-auto space-y-8 py-10">
                    {examples.map((example, index) => (
                      <Example 
                        key={index}
                        image={example.image}
                        title={example.title}
                        description={example.description}
                        onClick={() => handleExampleClick(example)}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="pt-24 pb-10"> {/* 增加顶部内边距，为浮动标题腾出更多空间 */}
                  {Array.from({ length: conversationCount }).map((_, index) => (
                    <Conversation 
                      key={index} 
                      messages={messages} 
                      currentIndex={index}
                      handleShowMore={handleShowMore}
                      openBrainstorm={openBrainstorm}
                      handleImageReference={handleImageReference}
                    />
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
            
            {/* 错误提示 - 改为固定浮动，调整位置以避免与其他元素重叠 */}
            {error && (
              <div className="fixed bottom-36 left-0 right-0 z-50 pointer-events-none">
                <div className="w-5/6 md:w-2/3 mx-auto bg-red-900/80 backdrop-blur-sm border border-red-600/50 text-white px-5 py-4 rounded-xl shadow-xl pointer-events-auto">
                  <div className="flex items-start">
                    <svg className="w-6 h-6 mr-3 text-red-300 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <div className="flex-1">
                      <div className="font-medium text-lg">{error}</div>
                      <div className="mt-1 text-sm text-red-200">
                        请尝试刷新页面或检查网络连接。如果问题持续存在，请联系技术支持。
                      </div>
                    </div>
                    <button 
                      className="ml-3 text-red-300 hover:text-white transition-colors"
                      onClick={() => setError(null)}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* 引用的图像预览 - 改为固定浮动，位置根据是否有上传图像调整 */}
            {referencedImages.length > 0 && (
              <div className={`fixed ${uploadedImages.length > 0 ? 'bottom-52' : 'bottom-36'} left-0 right-0 z-30 pointer-events-none`}>
                <div className="w-2/3 mx-auto pointer-events-auto bg-gray-900/30 backdrop-blur-sm p-3 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-medium text-gray-400">引用的图像</h3>
                    <button 
                      onClick={clearReferencedImages}
                      className="text-sm text-gray-400 hover:text-white"
                    >
                      清除全部
                    </button>
                  </div>
                  <div className="flex items-center gap-3 pb-2">
                    <div className="h-10 w-10 bg-gray-800/60 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                    </div>
                    <div className="flex-1 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                      <div className="flex gap-2">
                        {referencedImages.map((image, index) => (
                          <div key={index} className="relative group flex-shrink-0">
                            <div className="w-16 h-16 rounded-md overflow-hidden border border-gray-700/50">
                              <img src={image} alt={`Referenced ${index}`} className="w-full h-full object-cover" />
                            </div>
                            <button 
                              onClick={() => removeReferencedImage(index)}
                              className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* 上传的图像预览 - 改为固定浮动 */}
            {uploadedImages.length > 0 && (
              <div className="fixed bottom-36 left-0 right-0 z-30 pointer-events-none">
                <div className="w-2/3 mx-auto pointer-events-auto bg-gray-900/30 backdrop-blur-sm p-3 rounded-xl">
                  <div className="flex flex-wrap gap-2">
                    {uploadedImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <div className="w-16 h-16 rounded-md overflow-hidden border border-gray-700/50">
                          <img src={image} alt={`Uploaded ${index}`} className="w-full h-full object-cover" />
                        </div>
                        <button 
                          onClick={() => removeUploadedImage(index)}
                          className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* 底部输入区 - 改为固定浮动在页面上方，没有背景横栏 */}
            <div className="fixed bottom-8 left-0 right-0 z-30 pointer-events-none">
              <form onSubmit={handleSubmit} className="w-[680px] mx-auto pointer-events-auto">
                <div className="relative rounded-full overflow-hidden shadow-xl bg-[#333333]/60 backdrop-blur-md">
                  <div className="flex items-center px-5 py-5">
                    {/* 左侧图标 */}
                    <div className="flex items-center gap-4 mr-4">
                      <button 
                        type="button"
                        onClick={triggerFileInput}
                        className="text-gray-300 hover:text-white transition-colors"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>
                    
                    {/* 输入框 */}
                    <input
                      ref={inputRef}
                      type="text"
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="What do you want to see..."
                      disabled={isGenerating}
                      className="flex-1 bg-transparent text-white text-sm font-normal outline-none placeholder-gray-400 py-2"
                    />
                    
                    {/* 右侧选项和按钮 */}
                    <div className="flex items-center gap-3 ml-4">
                      <div 
                        className="flex items-center text-gray-300 cursor-pointer relative"
                        onClick={toggleAspectRatio}
                      >
                        <span className="uppercase font-medium text-xs tracking-wide">宽高比</span>
                        <span className="mx-1 opacity-80">·</span>
                        <span className="font-medium text-xs">{aspectRatio}</span>
                        <svg className="w-4 h-4 ml-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M19 9l-7 7-7-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>

                      {/* 完全重新实现的宽高比选择浮框 */}
                      {showAspectRatioSelector && createPortal(
                        <div 
                          className="fixed inset-0 z-[9999] bg-black/20 flex items-center justify-center"
                          onClick={() => setShowAspectRatioSelector(false)}
                        >
                          <div 
                            className="absolute bottom-28 bg-[#222222] rounded-xl border-2 border-white/10 p-4 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                            ref={aspectRatioSelectorRef}
                          >
                            <div className="text-white text-sm font-medium mb-2">选择宽高比</div>
                            <div className="grid grid-cols-3 gap-2 w-[320px]">
                              {aspectRatioOptions.map(ratio => (
                                <button
                                  key={ratio}
                                  onClick={() => selectAspectRatio(ratio)}
                                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    aspectRatio === ratio
                                      ? 'bg-white text-black'
                                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                  }`}
                                >
                                  {ratio}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>,
                        document.body
                      )}

                      <button
                        type="submit"
                        disabled={isGenerating}
                        className="h-8 w-8 flex items-center justify-center rounded-full bg-gray-700/50 hover:bg-gray-600/60 text-white transition-colors"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5 15l7-7 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* 隐藏的文件输入 */}
                <input 
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                />
              </form>
            </div>
          </div>
        ) : (
          // 项目列表视图
          <ProjectsPage 
            onCreateNew={createNewConversation}
            onSelectProject={selectProject}
          />
        )}
      </div>
      
      {/* 头脑风暴面板 */}
      <BrainstormPanel 
        isOpen={isBrainstormOpen} 
        onClose={closeBrainstorm} 
        onSelect={handleBrainstormSelect} 
      />
    </div>
  );
};

export default CreatorPage; 