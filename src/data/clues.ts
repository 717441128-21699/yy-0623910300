import type { Clue } from '@/types';

export const mockClues: Clue[] = [
  {
    id: 'clue-001',
    title: '3号宿舍楼凌晨2点多人反映空调漏水严重',
    description: '多个学生在年级群内反映3号楼4-6层空调漏水，地面湿滑，有学生滑倒。涉及约50名学生，情绪激动，有同学说要发朋友圈曝光。',
    eventType: 'dorm',
    status: 'processing',
    urgentLevel: 'high',
    source: 'group',
    createdAt: '2026-06-19T02:15:00',
    reportedBy: '张辅导员',
    location: '3号学生宿舍楼',
    involvedCount: 52,
    taskIds: ['task-001', 'task-002', 'task-003'],
    timeline: [
      {
        id: 'tl-001',
        time: '2026-06-19T02:15:00',
        action: '线索登记',
        operator: '张辅导员',
        role: 'counselor',
        note: '收到学生群截图并核实'
      },
      {
        id: 'tl-002',
        time: '2026-06-19T02:22:00',
        action: '派发任务',
        operator: '李主任',
        role: 'propaganda',
        note: '已通知宿管中心、后勤处到场处理'
      }
    ]
  },
  {
    id: 'clue-002',
    title: '二食堂一楼午餐后多人出现腹痛腹泻',
    description: '表白墙多条投稿称午餐后约20名同学出现肠胃不适，校医院已收治6人。怀疑是小炒窗口菜品问题。',
    eventType: 'canteen',
    status: 'pending',
    urgentLevel: 'high',
    source: 'wall',
    createdAt: '2026-06-19T13:40:00',
    location: '第二学生食堂',
    involvedCount: 26,
    taskIds: ['task-004', 'task-005', 'task-006'],
    timeline: [
      {
        id: 'tl-003',
        time: '2026-06-19T13:40:00',
        action: '线索登记',
        operator: '王老师',
        role: 'propaganda',
        note: '表白墙投稿已达8条'
      }
    ]
  },
  {
    id: 'clue-003',
    title: '期末考试安排与国家级证书考试时间冲突',
    description: '校园论坛热帖：计算机学院期末考试安排与CET-4/6考试时间重叠，约100名学生受影响，学生要求调整考试时间。',
    eventType: 'exam',
    status: 'processing',
    urgentLevel: 'medium',
    source: 'forum',
    createdAt: '2026-06-19T10:08:00',
    location: '教务处',
    involvedCount: 108,
    taskIds: ['task-007', 'task-008'],
    templateId: 'tpl-005',
    timeline: [
      {
        id: 'tl-004',
        time: '2026-06-19T10:08:00',
        action: '线索登记',
        operator: '赵老师',
        role: 'academic'
      },
      {
        id: 'tl-005',
        time: '2026-06-19T10:45:00',
        action: '任务确认',
        operator: '教务处',
        role: 'academic',
        note: '正在核查考试安排表'
      }
    ]
  },
  {
    id: 'clue-004',
    title: '某教授课堂上与学生发生言语冲突视频流出',
    description: '微信群流传一段1分40秒视频，某学院教授因考勤问题当众训斥学生，措辞激烈。评论区多持负面态度，转发量上升。',
    eventType: 'conflict',
    status: 'pending',
    urgentLevel: 'high',
    source: 'group',
    createdAt: '2026-06-19T09:30:00',
    reportedBy: '宣传部监控',
    involvedCount: 200,
    taskIds: ['task-009', 'task-010', 'task-011'],
    timeline: [
      {
        id: 'tl-006',
        time: '2026-06-19T09:30:00',
        action: '线索登记',
        operator: '舆情监测',
        role: 'propaganda',
        note: '视频转发超50次，需高度关注'
      }
    ]
  },
  {
    id: 'clue-005',
    title: '校园网周末网速过慢影响线上答辩',
    description: '周末多个学院进行毕业论文线上答辩，学生反映校园网延迟严重、视频卡顿。已有学生在群内吐槽。',
    eventType: 'service',
    status: 'replied',
    urgentLevel: 'medium',
    source: 'group',
    createdAt: '2026-06-18T15:20:00',
    involvedCount: 45,
    taskIds: ['task-012'],
    templateId: 'tpl-003',
    timeline: [
      {
        id: 'tl-007',
        time: '2026-06-18T15:20:00',
        action: '线索登记',
        operator: '值班老师',
        role: 'counselor'
      },
      {
        id: 'tl-008',
        time: '2026-06-18T15:50:00',
        action: '网络处理',
        operator: '信息中心',
        role: 'logistics',
        note: '已临时扩容'
      },
      {
        id: 'tl-009',
        time: '2026-06-18T16:10:00',
        action: '发布回复',
        operator: '宣传部',
        role: 'propaganda',
        note: '学生群已发布说明'
      }
    ]
  },
  {
    id: 'clue-006',
    title: '图书馆考研座位分配制度遭到质疑',
    description: '论坛发帖质疑考研座位"先到先得"制度不合理，建议改为预约制。已有200+评论，正反两方争论。',
    eventType: 'service',
    status: 'archived',
    urgentLevel: 'low',
    source: 'forum',
    createdAt: '2026-06-17T08:00:00',
    involvedCount: 35,
    taskIds: [],
    templateId: 'tpl-002',
    timeline: [
      { id: 'tl-010', time: '2026-06-17T08:00:00', action: '线索登记', operator: '论坛管理员', role: 'propaganda' },
      { id: 'tl-011', time: '2026-06-18T10:00:00', action: '研究方案', operator: '图书馆', role: 'logistics' },
      { id: 'tl-012', time: '2026-06-18T18:00:00', action: '正式回复', operator: '宣传部', role: 'propaganda' },
      { id: 'tl-013', time: '2026-06-19T08:00:00', action: '归档', operator: '系统', role: 'propaganda' }
    ]
  },
  {
    id: 'clue-007',
    title: '体育课训练强度过大导致多名学生受伤',
    description: '学生群内反映本周体育课体能测试后多名同学肌肉拉伤、膝盖受伤，校医院接诊记录可查。家长群也有讨论。',
    eventType: 'teaching',
    status: 'processing',
    urgentLevel: 'medium',
    source: 'report',
    createdAt: '2026-06-19T11:00:00',
    involvedCount: 15,
    taskIds: ['task-013', 'task-014'],
    timeline: [
      { id: 'tl-014', time: '2026-06-19T11:00:00', action: '线索登记', operator: '校医院', role: 'counselor' }
    ]
  }
];

export const getClueById = (id: string): Clue | undefined => {
  return mockClues.find(c => c.id === id);
};
