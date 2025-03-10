import { Link } from 'react-router-dom';

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#121212] to-[#222] text-white">
      {/* 导航栏 */}
      <header className="border-b border-gray-800 bg-black bg-opacity-50">
        <div className="container-custom py-4 flex justify-between items-center">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold">Dream Machine</h1>
            <nav className="hidden md:flex space-x-6">
              <a href="#features" className="hover:text-accent transition-colors">功能</a>
              <a href="#examples" className="hover:text-accent transition-colors">示例</a>
              <a href="#pricing" className="hover:text-accent transition-colors">价格</a>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/create" className="btn">开始创作</Link>
          </div>
        </div>
      </header>

      {/* 英雄区域 */}
      <section className="py-16 md:py-24">
        <div className="container-custom text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="block">全新自由</span>
            <span className="block mt-2">想象力的空间</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-10">
            构思、可视化、创作视频，并与世界分享您的梦想，使用我们最强大的图像和视频AI模型。现已在Web上提供。
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-4 mb-16">
            <Link to="/create" className="btn text-lg px-8 py-3">立即试用</Link>
            <a href="#examples" className="btn bg-gray-800 text-lg px-8 py-3">观看演示</a>
          </div>
        </div>
      </section>

      {/* 特点区域 */}
      <section id="features" className="py-16 bg-black bg-opacity-30">
        <div className="container-custom">
          <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center">使用Dream Machine实现您的创意</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
            <FeatureCard 
              title="创建美丽的图像和视频" 
              description="快速构思和迭代。探索无尽创意，制作独特而壮观的内容。由最具创造力的AI模型提供支持。"
            />
            <FeatureCard 
              title="无需提示工程，直接提问" 
              description="简单或具体都可以。用自己的方式交流，流畅地生成、编辑和探索您的创作。"
            />
            <FeatureCard 
              title="引用和混合任何内容" 
              description="探索创意替代方案。引入您自己的图像、风格和角色参考。完全按照您的想法呈现。"
            />
            <FeatureCard 
              title="制作视频" 
              description="用起始/结束帧指导完美拍摄。延长任何视频或说'循环'使其循环播放。"
            />
            <FeatureCard 
              title="创建独特角色" 
              description="从单一图像创建独特、一致的角色。在无限场景中重新想象它们。"
            />
            <FeatureCard 
              title="修改和编辑" 
              description="通过描述您的更改来编辑图像和视频。轻松转换风格、添加元素或更改场景。"
            />
          </div>
        </div>
      </section>

      {/* 示例区域 */}
      <section id="examples" className="py-16">
        <div className="container-custom">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">看看其他人在创作什么</h2>
          <p className="text-xl text-gray-300 text-center mb-12">来自我们社区的精彩创作</p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="rounded-lg overflow-hidden bg-gray-800 hover:transform hover:scale-[1.02] transition-all">
                <div className="aspect-video bg-gray-700"></div>
                <div className="p-4">
                  <h3 className="font-medium">创意项目 {item}</h3>
                  <p className="text-gray-400 text-sm mt-1">由用户创建</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 技术支持区域 */}
      <section className="py-16 bg-black bg-opacity-30">
        <div className="container-custom">
          <h2 className="text-3xl font-bold mb-12 text-center">由尖端AI技术驱动</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-900 p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-3">DeepSeek R1</h3>
              <p className="text-gray-300">
                我们的大规模推理模型，理解用户意图，管理上下文并生成优化输出，为创作提供智能支持。
              </p>
            </div>
            <div className="bg-gray-900 p-6 rounded-xl">
              <h3 className="text-xl font-semibold mb-3">DeepSeek Janus-Pro</h3>
              <p className="text-gray-300">
                强大的图像生成模型，能够生成高度逼真的视觉效果，捕捉细节并准确表达用户想象。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 价格区域 */}
      <section id="pricing" className="py-16">
        <div className="container-custom">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">简单透明的价格</h2>
          <p className="text-xl text-gray-300 text-center mb-12">为您的创意需求选择最佳计划</p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <PricingCard 
              title="入门"
              price="免费"
              features={[
                "每日限量创作次数",
                "基本图像质量",
                "标准角色创建",
                "社区支持"
              ]}
              cta="开始使用"
              primary={false}
            />
            <PricingCard 
              title="专业版"
              price="¥99/月"
              features={[
                "每月1000次创作",
                "高质量图像和视频",
                "高级角色创建",
                "优先支持",
                "无水印导出"
              ]}
              cta="升级到专业版"
              primary={true}
            />
            <PricingCard 
              title="团队版"
              price="¥299/月"
              features={[
                "无限创作次数",
                "最高质量输出",
                "API访问",
                "团队协作功能",
                "专属客户支持",
                "商业使用授权"
              ]}
              cta="联系销售"
              primary={false}
            />
          </div>
        </div>
      </section>

      {/* 页脚 */}
      <footer className="bg-black bg-opacity-60 py-12">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold mb-4">产品</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">功能</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">价格</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">API</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">常见问题</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">资源</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">文档</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">教程</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">示例</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">社区</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">公司</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">关于我们</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">博客</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">加入我们</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">联系我们</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4">法律</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">隐私政策</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">使用条款</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">内容政策</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">© 2025 Dream Machine. 保留所有权利。</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">GitHub</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

// 特性卡片组件
const FeatureCard = ({ title, description }: { title: string; description: string }) => (
  <div className="bg-gray-900 bg-opacity-50 p-6 rounded-xl">
    <h3 className="text-xl font-semibold mb-3">{title}</h3>
    <p className="text-gray-300">{description}</p>
  </div>
);

// 价格卡片组件
const PricingCard = ({ 
  title, 
  price, 
  features, 
  cta, 
  primary 
}: { 
  title: string; 
  price: string; 
  features: string[]; 
  cta: string; 
  primary: boolean;
}) => (
  <div className={`rounded-xl overflow-hidden ${primary ? 'bg-accent bg-opacity-20 border border-accent' : 'bg-gray-900'}`}>
    <div className="p-6">
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-3xl font-bold mb-6">{price}</p>
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <svg className="h-5 w-5 mr-2 text-green-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <button className={`w-full py-2 rounded-full transition-colors ${primary ? 'bg-accent hover:bg-opacity-90' : 'bg-gray-700 hover:bg-gray-600'}`}>
        {cta}
      </button>
    </div>
  </div>
);

export default HomePage; 