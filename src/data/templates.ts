import type { ReplyTemplate } from '@/types';

export const mockTemplates: ReplyTemplate[] = [
  {
    id: 'tpl-001',
    title: '宿舍问题情绪安抚（学生群版）',
    category: 'emotion',
    eventType: 'dorm',
    audience: 'students',
    content: `【紧急通知】各位同学好～

关于{{location}}的{{issue}}问题，我们已经收到大家的反馈啦！

学校方面非常重视，{{department}}的老师/师傅已经第一时间赶到现场处理中，请大家稍安勿躁～

有最新进展会第一时间在群里告知大家！如遇到紧急情况，可直接联系值班电话{{phone}}。

给大家带来不便，非常抱歉！感谢同学们的理解与配合 💪`,
    variables: ['location', 'issue', 'department', 'phone'],
    usageCount: 28,
    updatedAt: '2026-06-15T10:00:00'
  },
  {
    id: 'tpl-002',
    title: '服务问题正式说明（校内公告）',
    category: 'explanation',
    eventType: 'service',
    audience: 'public',
    content: `关于{{topic}}的情况说明

各位同学、老师：

近期收到关于{{topic}}的反馈，学校高度重视，已责成{{department}}进行专题研究。

经过认真调研，现将有关情况说明如下：

一、关于大家反映的{{point1}}：
{{explanation1}}

二、关于大家关心的{{point2}}：
{{explanation2}}

三、下一步措施：
学校将在{{timeframe}}内完成{{action}}，持续改进服务质量。

感谢广大师生的监督与建议，我们将以此次反馈为契机，进一步提升管理水平和服务质量。

{{department}}
{{date}}`,
    variables: ['topic', 'department', 'point1', 'explanation1', 'point2', 'explanation2', 'timeframe', 'action', 'date'],
    usageCount: 45,
    updatedAt: '2026-06-10T14:30:00'
  },
  {
    id: 'tpl-003',
    title: '后勤故障快速回复（学生群版）',
    category: 'update',
    eventType: 'service',
    audience: 'students',
    content: `各位同学好！

针对大家反馈的{{issue}}问题，目前的处理进展如下：

✅ 已完成：{{completed}}
⏳ 进行中：{{inProgress}}
📋 后续计划：{{nextStep}}

预计{{eta}}可恢复正常。有任何问题随时@值班老师，我们会持续跟进！

再次为给大家带来的不便致歉，感谢同学们的耐心！🙏`,
    variables: ['issue', 'completed', 'inProgress', 'nextStep', 'eta'],
    usageCount: 67,
    updatedAt: '2026-06-18T16:10:00'
  },
  {
    id: 'tpl-004',
    title: '食堂卫生问题致歉（家长群版）',
    category: 'apology',
    eventType: 'canteen',
    audience: 'parents',
    content: `尊敬的各位家长：

大家好！

关于{{time}}发生的{{event}}事件，学校在此向受影响的同学及家长致以最诚挚的歉意！

事件发生后，学校第一时间启动应急机制：
1. 已安排{{department}}到现场处理
2. 校医院对身体不适的同学进行了诊治，目前情况{{status}}
3. 已封存相关食品样本送检，调查结果将及时公布
4. 涉事窗口已暂停营业，待调查确认后将严肃处理

后续我们将：
- 持续跟进学生康复情况
- 加强食堂卫生检查频次
- 完善食品安全应急预案

各位家长如有任何疑问，可随时联系{{contact}}老师，电话{{phone}}。

再次感谢家长们的理解和监督！

{{school}}学工处
{{date}}`,
    variables: ['time', 'event', 'department', 'status', 'contact', 'phone', 'school', 'date'],
    usageCount: 12,
    updatedAt: '2026-05-28T09:00:00'
  },
  {
    id: 'tpl-005',
    title: '考试安排调整说明（学生群版）',
    category: 'explanation',
    eventType: 'exam',
    audience: 'students',
    content: `【考试安排说明】各位同学注意啦！📢

收到大家关于{{exam}}与{{conflict}}时间冲突的反馈，学校非常重视！

教务处正在紧急协调调整方案：
✅ 已确认冲突场次：{{count}}门课，共{{studentCount}}名同学受影响
✅ 初步方案：将冲突科目调整至{{newTime}}进行
✅ 最终安排将于{{announceTime}}前在教务系统公布

请大家不用焦虑，先安心备考，以官方通知为准！有任何问题可随时联系教务处或辅导员老师。

给大家造成的困扰深表歉意，感谢理解！💙

教务处 & 学工处`,
    variables: ['exam', 'conflict', 'count', 'studentCount', 'newTime', 'announceTime'],
    usageCount: 18,
    updatedAt: '2026-06-12T11:20:00'
  },
  {
    id: 'tpl-006',
    title: '师生冲突事件通报（校内公告）',
    category: 'notice',
    eventType: 'conflict',
    audience: 'public',
    content: `关于近期网络传播视频的情况通报

各位师生：

针对近日网络传播的关于{{event}}的视频，学校在此说明如下：

一、学校高度重视，已成立由{{department}}组成的专项工作组，正在对事件进行全面调查。

二、目前已与涉事师生分别谈话，正在核实具体情况。

三、学校始终坚持以人为本的教育理念，对任何违反师德师风的行为都将严肃处理，绝不姑息。

四、调查结果和处理意见将第一时间向全校公布。

请大家不信谣、不传谣，共同维护良好的校园舆论环境。

如有疑问可联系{{contact}}：{{phone}}

党委宣传部 纪检监察处
{{date}}`,
    variables: ['event', 'department', 'contact', 'phone', 'date'],
    usageCount: 5,
    updatedAt: '2026-04-20T16:00:00'
  },
  {
    id: 'tpl-007',
    title: '周末夜间值班快速安抚（学生群版）',
    category: 'emotion',
    eventType: 'other',
    audience: 'students',
    content: `各位同学晚上好！🌙

收到大家反馈的{{issue}}，值班老师已经收到啦！

虽然是{{time}}，但我们已经紧急联系了{{onCall}}的老师/工作人员，他们正在赶来的路上～

大家先不要着急，有什么情况可以随时在群里说，值班老师一直在哦！👀

后续进展会在群里同步，感谢同学们的理解和配合，大家先照顾好自己！`,
    variables: ['issue', 'time', 'onCall'],
    usageCount: 34,
    updatedAt: '2026-06-01T23:45:00'
  },
  {
    id: 'tpl-008',
    title: '教学问题进展更新（家长群版）',
    category: 'update',
    eventType: 'teaching',
    audience: 'parents',
    content: `各位家长好！

关于此前反馈的{{topic}}问题，现将最新进展向大家通报：

1. 调查进展：{{progress}}
2. 已采取措施：{{measures}}
3. 下一步计划：{{plans}}

我们始终将学生的身心健康和学习权益放在首位，相关工作正在有序推进。

如有任何疑问，欢迎随时与班主任或辅导员联系。

感谢各位家长的信任与支持！

{{department}}
{{date}}`,
    variables: ['topic', 'progress', 'measures', 'plans', 'department', 'date'],
    usageCount: 15,
    updatedAt: '2026-06-05T10:00:00'
  }
];

export const getTemplateById = (id: string): ReplyTemplate | undefined => {
  return mockTemplates.find(t => t.id === id);
};

export const getTemplatesByCategory = (category: string): ReplyTemplate[] => {
  return mockTemplates.filter(t => t.category === category);
};

export const getTemplatesByAudience = (audience: string): ReplyTemplate[] => {
  return mockTemplates.filter(t => t.audience === audience);
};
