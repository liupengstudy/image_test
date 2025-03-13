import { OpenAI } from 'openai';
import { config } from '../config';
import logger from '../utils/logger';

// 创建阿里云QWQ模型客户端
const qwqClient = new OpenAI({
  apiKey: config.qwq.apiKey,
  baseURL: config.qwq.baseUrl,
});

/**
 * 创意提示类别
 */
export enum PromptCategory {
  LANDSCAPES = 'landscapes',
  CHARACTERS = 'characters',
  ABSTRACT = 'abstract',
  ANIMALS = 'animals',
  FANTASY = 'fantasy',
  SCIFI = 'scifi',
}

/**
 * 创意提示响应接口
 */
export interface BrainstormPrompt {
  description: string;
  previewPrompt?: string; // 可用于生成预览图像的简化提示词
}

/**
 * 获取类别的中文名称
 */
export const getCategoryName = (category: PromptCategory): string => {
  const categoryNames: Record<PromptCategory, string> = {
    [PromptCategory.LANDSCAPES]: '风景',
    [PromptCategory.CHARACTERS]: '人物',
    [PromptCategory.ABSTRACT]: '抽象',
    [PromptCategory.ANIMALS]: '动物',
    [PromptCategory.FANTASY]: '奇幻',
    [PromptCategory.SCIFI]: '科幻',
  };
  
  return categoryNames[category] || '未知类别';
};

/**
 * 使用QWQ模型生成创意提示
 * @param category 提示类别
 * @param count 生成数量
 * @returns 生成的创意提示数组
 */
export const generateCreativePrompts = async (
  category: PromptCategory,
  count: number = 4
): Promise<BrainstormPrompt[]> => {
  logger.api(`开始为类别 "${category}" 生成创意提示`);
  
  try {
    // 根据类别构建系统提示
    const categoryName = getCategoryName(category);
    
    // 构建系统提示词，引导QWQ模型生成特定类别的创意提示
    const systemPrompt = `你是一个创意提示生成器，专门为AI图像生成提供高质量的创意提示词。`;
    
    // 构建用户提示词，请求生成特定类别的提示
    const userPrompt = `请为我生成${count}个关于"${categoryName}"的创意图像提示词。
每个提示词应该是一个详细的中文描述，包含构图、风格、光照、色彩、情绪等元素。
提示词应该有创意、独特并且容易想象。
返回格式必须是严格的JSON数组，每个元素包含description字段，例如：
[
  {"description": "提示词描述1"},
  {"description": "提示词描述2"}
]
只返回这个JSON数组，不要有其他任何解释或说明。`;

    logger.api('调用阿里云QWQ模型API开始', { 
      model: 'qwq-32b',
      category: category,
      count: count
    });

    // 创建聊天完成请求
    const completion = await qwqClient.chat.completions.create({
      model: 'qwq-32b',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
    });

    // 提取模型返回的响应内容
    const content = completion.choices[0]?.message?.content || '';
    
    logger.api('QWQ模型API响应', { content });

    if (!content.trim()) {
      throw new Error('QWQ模型返回了空响应');
    }

    // 解析JSON响应
    try {
      let jsonResponse = content;
      
      // 提取可能被包围在代码块中的JSON
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                         content.match(/```\s*([\s\S]*?)\s*```/) ||
                         content.match(/\[\s*\{[\s\S]*\}\s*\]/);
      
      if (jsonMatch && jsonMatch[1]) {
        jsonResponse = jsonMatch[1];
      }
      
      const parsedPrompts = JSON.parse(jsonResponse) as BrainstormPrompt[];
      
      // 验证响应格式
      if (!Array.isArray(parsedPrompts)) {
        throw new Error('响应不是数组格式');
      }
      
      // 对响应进行格式化和规范化
      const formattedPrompts = parsedPrompts.map(prompt => ({
        description: prompt.description,
        previewPrompt: prompt.previewPrompt || prompt.description.split('.')[0]
      }));
      
      logger.api(`成功生成 ${formattedPrompts.length} 个创意提示`);
      return formattedPrompts;
    } catch (parseError) {
      logger.apiError('解析QWQ响应失败', parseError);
      logger.apiError('原始响应', content);
      throw new Error('无法解析模型响应为有效的JSON');
    }
  } catch (error) {
    logger.apiError('QWQ创意提示生成失败', error);
    
    // 如果API调用失败，返回该类别的一些默认提示
    const fallbackPrompts = getFallbackPrompts(category, count);
    logger.api(`使用备选提示词`, fallbackPrompts);
    return fallbackPrompts;
  }
};

/**
 * 获取备选提示词（当API调用失败时）
 */
const getFallbackPrompts = (category: PromptCategory, count: number): BrainstormPrompt[] => {
  const allFallbacks: Record<PromptCategory, string[]> = {
    [PromptCategory.LANDSCAPES]: [
      "壮观的山脉日落，金色阳光穿过云层，照亮山峰，形成剪影效果，高清摄影",
      "宁静的湖泊清晨，薄雾笼罩，倒映着周围的树木和山脉，梦幻般的氛围",
      "冰雪覆盖的森林，阳光透过树枝间隙，形成光束，雪花缓缓飘落，冬日童话",
      "热带海滩日落，金色和紫色的天空，宁静的海浪轻抚沙滩，椰子树剪影"
    ],
    [PromptCategory.CHARACTERS]: [
      "神秘的女巫在古老森林中，被荧光植物环绕，手持法杖，细节丰富的写实风格",
      "未来战士，半机械化身体，站在城市废墟中，背景是霓虹灯光，赛博朋克风格",
      "古代将军身着精美盔甲，站在山顶眺望远方，战场迷雾缭绕，史诗般的氛围",
      "深海探险家在发光海洋生物环绕的海底遗迹中，佩戴高科技潜水设备，蓝色光芒"
    ],
    [PromptCategory.ABSTRACT]: [
      "流动的颜色漩涡，混合蓝色、紫色和金色，如同宇宙星云，抽象表现主义",
      "几何形状构成的城市天际线，鲜艳的霓虹色调，数字艺术风格，简约主义",
      "分形艺术，无限递归的螺旋图案，渐变色彩，数学美学与艺术的结合",
      "液态金属流动形成的抽象雕塑，反射周围环境光线，超现实主义风格"
    ],
    [PromptCategory.ANIMALS]: [
      "雄狮特写，金色眼睛注视前方，鬃毛在风中飘动，非洲大草原日落背景，野生动物摄影",
      "彩色蜂鸟悬停在热带花朵前，翅膀形成虚影，捕捉精细羽毛纹理，高速摄影",
      "北极狐在雪地中，白色皮毛与环境完美融合，只有蓝色眼睛突出，冬季荒原",
      "海底珊瑚礁中的章鱼，变换体色与纹理，与环境融为一体，海洋生物摄影"
    ],
    [PromptCategory.FANTASY]: [
      "漂浮在云端的古老城堡，瀑布从悬崖流下，彩虹桥连接，幻想艺术风格",
      "水晶森林，透明树木内部流动能量，发光的植物和奇幻生物，魔幻现实主义",
      "火龙在火山口盘旋，鳞片反射岩浆光芒，烟雾缭绕，史诗般的幻想场景",
      "魔法图书馆，书籍自行漂浮，螺旋楼梯通向无限高处，魔法粒子在空中闪烁"
    ],
    [PromptCategory.SCIFI]: [
      "未来城市天际线，高耸的全息广告，飞行车穿梭，霓虹灯反射在雨水中，赛博朋克风格",
      "太空站环形结构，地球作为背景，阳光照射形成长阴影，科幻硬核风格",
      "机器人与人类在先进实验室合作，全息投影显示数据，未来主义设计，明亮冷色调",
      "外星景观，多重月亮悬挂天空，异形植物发光，奇怪构造的建筑，科幻概念艺术"
    ]
  };

  // 获取该类别的备选提示词
  const categoryFallbacks = allFallbacks[category] || allFallbacks[PromptCategory.LANDSCAPES];
  
  // 限制数量并格式化
  return categoryFallbacks.slice(0, count).map(description => ({
    description,
    previewPrompt: description.split('，')[0]
  }));
}; 