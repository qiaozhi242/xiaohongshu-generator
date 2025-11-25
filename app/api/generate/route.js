// app/api/generate/route.js - 增强版模拟生成（修复版）
import { NextResponse } from 'next/server';

// 丰富的标题模板库
const titleTemplates = {
  活泼: [
    "💥绝了！这个{product}让我回购了N次！{feature}太顶了",
    "👀不是广！亲测{product}{feature}，闺蜜都问链接",
    "🛍️{product}天花板！{feature}，这效果我真的会谢",
    "🌟挖到宝了！{product}{feature}，姐妹快冲",
    "💕{product}年度爱用！{feature}真的太香了",
    "🎉按头安利！{product}{feature}，不好用来打我",
    "✨{product}救我狗命！{feature}太绝了吧",
    "🔥爆款预警！{product}{feature}，用完直接封神"
  ],
  专业: [
    "🔬专业测评 | {product}深度体验：{feature}",
    "📊数据说话 | {product}的{feature}实际效果验证",
    "💡技术分析 | 为什么{product}值得入手",
    "🎯深度评测 | {product}的{feature}表现如何",
    "📈产品报告 | {product}使用体验分享",
    "🔍成分解析 | {product}{feature}的科学原理",
    "📋实测数据 | {product}性能全面分析",
    "🎓专家视角 | {product}使用心得分享"
  ],
  简约: [
    "👍{product}推荐 | {feature}",
    "✅{product}使用体验 | 简单直接的评价",
    "🛒{product}购买建议 | 值得入手",
    "⭐{product}测评 | {feature}表现突出",
    "💫{product}分享 | 实用好物",
    "📝{product}使用报告 | 客观评价",
    "🎁{product}体验 | 真实感受",
    "📦{product}开箱 | 快速评测"
  ],
  搞笑: [
    "😂救命！{product}{feature}，笑不活了",
    "🐶狗子都惊了！{product}{feature}太神奇",
    "🎭大型真香现场！{product}{feature}",
    "🤣哈哈哈哈{product}{feature}，离谱！",
    "👻鬼知道{product}{feature}有多好用",
    "😱震惊！{product}{feature}竟然...",
    "🤪离大谱！{product}{feature}绝绝子",
    "🎪喜剧效果拉满！{product}{feature}"
  ]
};

// 丰富的正文模板
const contentTemplates = {
  活泼: [
    `姐妹们！挖到宝了！！这个{product}我真的要按头安利给你们！💥

之前一直找不到好用的，直到遇到它！{sellingPoint} 简直是为我量身定做的！

特别是{feature1}，效果真的绝绝子！现在每天都离不开，已经安利给身边所有姐妹了～👭

你们有用过什么好用的{product}吗？求反向安利！！`,

    `宝子们！这个{product}我真的会谢！{sellingPoint}

{feature1}这个功能我吹爆！{feature2}也超级实用！

已经用了两周，现在完全离不开了，谁用谁知道！

快来告诉我你们的使用感受呀～💕`
  ],
  专业: [
    `经过为期两周的深度使用，我来为大家客观评价这款{product}。

核心优势：{sellingPoint}

在实际测试中，{feature1}的表现确实出色。{feature2}也达到了预期效果。

使用建议：{suggestion}

整体评分：★★★★☆ 推荐入手`,

    `作为一名{expert}，我对{product}进行了详细测评。

产品亮点：
• {feature1}
• {feature2}
• {feature3}

使用体验：{experience}

结论：{conclusion}`
  ],
  简约: [
    `简单分享一下{product}的使用感受：

优点：{sellingPoint}

使用体验：不错，值得推荐。

有需要的可以考虑入手。`,

    `{product}体验报告：

{feature1} - 满意
{feature2} - 良好

总结：好用，推荐。`
  ],
  搞笑: [
    `哈哈哈哈姐妹们！这个{product}真的要笑死我！{sellingPoint}

{feature1}这个功能绝了，我直接笑出猪叫！🐷

{feature2}也是离谱他妈给离谱开门——离谱到家了！

你们快去买来试试，保证让你们笑到打鸣！🐔`,

    `救命！这个{product}是要笑死我继承我的花呗吗？{sellingPoint}

{feature1}我真的会谢，直接给我整不会了！

用完之后的我：🤡→👑

快冲！不笑算我输！`
  ]
};

// 专家身份映射
const expertMap = {
  '便携式咖啡杯': '生活用品测评师',
  '美白精华液': '护肤达人', 
  '智能手表': '数码爱好者',
  '空气炸锅': '美食博主',
  '瑜伽垫': '健身教练',
  '其他': '产品测评师'
};

// 使用建议映射
const suggestionMap = {
  '便携式咖啡杯': '适合上班族、学生党日常使用',
  '美白精华液': '建议晚间使用，配合防晒效果更佳',
  '智能手表': '适合运动爱好者和健康监测需求者',
  '空气炸锅': '适合追求健康饮食的家庭',
  '瑜伽垫': '适合初学者到进阶练习者',
  '其他': '根据个人需求选择合适的使用场景'
};

// 使用体验映射  
const experienceMap = {
  '便携式咖啡杯': '操作简便，保温效果令人满意',
  '美白精华液': '质地清爽，吸收快速，效果明显',
  '智能手表': '功能丰富，续航能力不错',
  '空气炸锅': '烹饪速度快，清洁方便',
  '瑜伽垫': '防滑效果好，弹性适中',
  '其他': '符合预期，物有所值'
};

// 结论映射
const conclusionMap = {
  '便携式咖啡杯': '性价比很高的日常用品',
  '美白精华液': '值得尝试的护肤产品',
  '智能手表': '功能全面的智能设备',
  '空气炸锅': '提升生活品质的厨房好物',
  '瑜伽垫': '质量不错的健身器材',
  '其他': '推荐购买的产品'
};

export async function POST(request) {
  try {
    const { productName, sellingPoint, style = '活泼' } = await request.json();

    if (!productName || !sellingPoint) {
      return NextResponse.json(
        { error: '产品名称和核心卖点是必填项' },
        { status: 400 }
      );
    }

    // 解析卖点
    const features = sellingPoint.split(/[,，]/).map(f => f.trim()).filter(f => f);
    const feature1 = features[0] || sellingPoint;
    const feature2 = features[1] || features[0] || sellingPoint;
    const feature3 = features[2] || features[1] || features[0] || sellingPoint;

    // 获取产品相关映射
    const getProductType = (product) => {
      const types = Object.keys(expertMap);
      for (let type of types) {
        if (product.includes(type) && type !== '其他') return type;
      }
      return '其他';
    };

    const productType = getProductType(productName);
    const expert = expertMap[productType];
    const suggestion = suggestionMap[productType];
    const experience = experienceMap[productType];
    const conclusion = conclusionMap[productType];

    // 随机选择标题
    const titleTemplatesForStyle = titleTemplates[style] || titleTemplates.活泼;
    const selectedTitles = [];
    
    // 随机选择3个不重复的标题
    while (selectedTitles.length < 3 && selectedTitles.length < titleTemplatesForStyle.length) {
      const randomIndex = Math.floor(Math.random() * titleTemplatesForStyle.length);
      const title = titleTemplatesForStyle[randomIndex]
        .replace(/{product}/g, productName)
        .replace(/{feature}/g, feature1);
      
      if (!selectedTitles.includes(title)) {
        selectedTitles.push(title);
      }
    }

    // 如果标题不足3个，复制已有的
    while (selectedTitles.length < 3) {
      selectedTitles.push(selectedTitles[0]);
    }

    // 随机选择正文模板
    const contentTemplatesForStyle = contentTemplates[style] || contentTemplates.活泼;
    const randomContentIndex = Math.floor(Math.random() * contentTemplatesForStyle.length);
    const contentTemplate = contentTemplatesForStyle[randomContentIndex];

    // 生成正文
    const generatedContent = contentTemplate
      .replace(/{product}/g, productName)
      .replace(/{sellingPoint}/g, sellingPoint)
      .replace(/{feature1}/g, feature1)
      .replace(/{feature2}/g, feature2)
      .replace(/{feature3}/g, feature3)
      .replace(/{expert}/g, expert)
      .replace(/{suggestion}/g, suggestion)
      .replace(/{experience}/g, experience)
      .replace(/{conclusion}/g, conclusion);

    // 生成标签
    const baseTags = [
      `#${productName}`,
      '#好物分享',
      '#种草',
      style === '专业' ? '#专业测评' : 
      style === '搞笑' ? '#搞笑' : '#必备好物',
      `#${feature1.replace(/ /g, '')}`
    ];

    // 添加风格相关标签（修复了这里缺少引号的问题）
    const styleTags = {
      活泼: ['#姐妹快来', '#宝藏好物'],
      专业: ['#实测', '#数据说话'],
      简约: ['#简单评价', '#实用好物'],
      搞笑: ['#笑死', '#离谱']
    };

    const tags = [...baseTags, ...(styleTags[style] || [])].slice(0, 5);

    // 构建完整响应
    const mockResponse = `【标题】
${selectedTitles.map((title, index) => `${index + 1}. ${title}`).join('\n')}

【正文】
${generatedContent}

【标签】
${tags.join(' ')}`;

    // 模拟处理时间（1.5-2.5秒）
    await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));

    return NextResponse.json({ 
      text: mockResponse,
      status: 'success'
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: '生成失败，请稍后重试' },
      { status: 500 }
    );
  }
}