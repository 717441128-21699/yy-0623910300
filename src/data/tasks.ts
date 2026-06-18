import type { Task } from '@/types';

export const mockTasks: Task[] = [
  {
    id: 'task-001',
    clueId: 'clue-001',
    clueTitle: '3号宿舍楼凌晨2点多人反映空调漏水严重',
    role: 'dorm_admin',
    assignee: '王主管',
    content: '立即前往3号楼4-6层查看漏水情况，组织临时排水，保护学生财物安全',
    deadline: '2026-06-19T03:00:00',
    status: 'completed',
    feedback: '已到现场，6楼漏水最严重，已安排保洁清理并放置防滑垫，转移2间宿舍学生到临时房间',
    feedbackAt: '2026-06-19T02:48:00',
    createdAt: '2026-06-19T02:22:00'
  },
  {
    id: 'task-002',
    clueId: 'clue-001',
    clueTitle: '3号宿舍楼凌晨2点多人反映空调漏水严重',
    role: 'logistics',
    assignee: '李工程师',
    content: '检查空调系统冷凝水管道，找出漏水原因并给出维修方案，评估是否需要整栋楼暂停空调',
    deadline: '2026-06-19T06:00:00',
    status: 'confirmed',
    feedback: '已派两名维修工到场，初判是主管道接口老化脱落，预计4点前完成临时封堵',
    feedbackAt: '2026-06-19T03:15:00',
    createdAt: '2026-06-19T02:22:00'
  },
  {
    id: 'task-003',
    clueId: 'clue-001',
    clueTitle: '3号宿舍楼凌晨2点多人反映空调漏水严重',
    role: 'counselor',
    assignee: '张辅导员',
    content: '在各年级群发通知安抚情绪，告知已派人处理，同时统计财产损失情况',
    deadline: '2026-06-19T03:30:00',
    status: 'pending',
    createdAt: '2026-06-19T02:25:00'
  },
  {
    id: 'task-004',
    clueId: 'clue-002',
    clueTitle: '二食堂一楼午餐后多人出现腹痛腹泻',
    role: 'canteen_admin',
    assignee: '陈主任',
    content: '立即封存疑似窗口剩余菜品，配合留样检测，暂停该窗口营业',
    deadline: '2026-06-19T14:30:00',
    status: 'pending',
    createdAt: '2026-06-19T13:50:00'
  },
  {
    id: 'task-005',
    clueId: 'clue-002',
    clueTitle: '二食堂一楼午餐后多人出现腹痛腹泻',
    role: 'logistics',
    assignee: '校医院',
    content: '统计就诊人数，确认症状，准备治疗方案，必要时联系校外医院',
    deadline: '2026-06-19T15:00:00',
    status: 'pending',
    createdAt: '2026-06-19T13:52:00'
  },
  {
    id: 'task-006',
    clueId: 'clue-002',
    clueTitle: '二食堂一楼午餐后多人出现腹痛腹泻',
    role: 'counselor',
    assignee: '各学院辅导员',
    content: '各学院统计就诊学生名单，联系家长告知情况，做好安抚工作',
    deadline: '2026-06-19T16:00:00',
    status: 'pending',
    createdAt: '2026-06-19T13:55:00'
  },
  {
    id: 'task-007',
    clueId: 'clue-003',
    clueTitle: '期末考试安排与国家级证书考试时间冲突',
    role: 'academic',
    assignee: '教务处考务科',
    content: '逐门核查计算机学院期末考安排，统计与四六级冲突的场次和人数',
    deadline: '2026-06-19T15:00:00',
    status: 'confirmed',
    feedback: '经核查，共3门课程12场次与四六级冲突，涉及学生108人，建议调整到下周进行',
    feedbackAt: '2026-06-19T14:20:00',
    createdAt: '2026-06-19T10:15:00'
  },
  {
    id: 'task-008',
    clueId: 'clue-003',
    clueTitle: '期末考试安排与国家级证书考试时间冲突',
    role: 'propaganda',
    assignee: '宣传部',
    content: '拟定正式说明，安抚学生情绪，告知学校正在研究调整方案',
    deadline: '2026-06-19T12:00:00',
    status: 'completed',
    feedback: '学生群已发布初步说明，论坛帖已回复置顶',
    feedbackAt: '2026-06-19T11:30:00',
    createdAt: '2026-06-19T10:20:00'
  },
  {
    id: 'task-009',
    clueId: 'clue-004',
    clueTitle: '某教授课堂上与学生发生言语冲突视频流出',
    role: 'counselor',
    assignee: '学院辅导员',
    content: '联系涉事双方了解情况，核实视频内容真实性，确定具体时间地点',
    deadline: '2026-06-19T12:00:00',
    status: 'pending',
    createdAt: '2026-06-19T09:35:00'
  },
  {
    id: 'task-010',
    clueId: 'clue-004',
    clueTitle: '某教授课堂上与学生发生言语冲突视频流出',
    role: 'academic',
    assignee: '学院领导',
    content: '找涉事教授谈话，了解事件经过，评估是否违反师德师风规定',
    deadline: '2026-06-19T14:00:00',
    status: 'pending',
    createdAt: '2026-06-19T09:40:00'
  },
  {
    id: 'task-011',
    clueId: 'clue-004',
    clueTitle: '某教授课堂上与学生发生言语冲突视频流出',
    role: 'propaganda',
    assignee: '舆情专员',
    content: '监控舆情扩散情况，必要时联系平台删除不实信息，准备应对口径',
    deadline: '2026-06-19T10:30:00',
    status: 'confirmed',
    feedback: '正在监控传播情况，目前主要在校内传播，暂未发现校外媒体报道',
    feedbackAt: '2026-06-19T10:15:00',
    createdAt: '2026-06-19T09:42:00'
  },
  {
    id: 'task-012',
    clueId: 'clue-005',
    clueTitle: '校园网周末网速过慢影响线上答辩',
    role: 'logistics',
    assignee: '信息中心',
    content: '排查校园网瓶颈，临时扩容出口带宽，确保答辩顺利进行',
    deadline: '2026-06-18T16:00:00',
    status: 'completed',
    feedback: '已临时增加2G带宽出口，测速恢复正常，答辩受影响的同学已安排重新答辩',
    feedbackAt: '2026-06-18T15:55:00',
    createdAt: '2026-06-18T15:25:00'
  },
  {
    id: 'task-013',
    clueId: 'clue-007',
    clueTitle: '体育课训练强度过大导致多名学生受伤',
    role: 'academic',
    assignee: '体育教研室',
    content: '调查涉事体育课程训练内容，评估是否超出教学大纲要求',
    deadline: '2026-06-20T12:00:00',
    status: 'pending',
    createdAt: '2026-06-19T11:10:00'
  },
  {
    id: 'task-014',
    clueId: 'clue-007',
    clueTitle: '体育课训练强度过大导致多名学生受伤',
    role: 'counselor',
    assignee: '辅导员团队',
    content: '看望受伤学生，安抚情绪，联系家长说明情况，跟进治疗进展',
    deadline: '2026-06-19T18:00:00',
    status: 'confirmed',
    feedback: '已联系15名受伤学生，症状多为肌肉拉伤，不严重，已通知家长。1名膝盖受伤同学需进一步检查',
    feedbackAt: '2026-06-19T15:30:00',
    createdAt: '2026-06-19T11:12:00'
  }
];

export const getTasksByClueId = (clueId: string): Task[] => {
  return mockTasks.filter(t => t.clueId === clueId);
};

export const getTasksByRole = (role: string): Task[] => {
  return mockTasks.filter(t => t.role === role);
};
