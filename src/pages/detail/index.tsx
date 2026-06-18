import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, Button, Input, Textarea, ScrollView } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import StatusBadge from '@/components/StatusBadge';
import TypeTag from '@/components/TypeTag';
import TaskItem from '@/components/TaskItem';
import { useClueStore } from '@/store/useClueStore';
import { ROLE_MAP, EVENT_TYPE_MAP, URGENT_MAP, AUDIENCE_MAP } from '@/types';
import type { RoleType, TargetAudience } from '@/types';
import { formatFullTime, timeFromNow, generateTaskContent, isNightTime } from '@/utils';
import styles from './index.module.scss';
import classnames from 'classnames';

const DetailPage: React.FC = () => {
  const router = useRouter();
  const clueId = router.params.id || '';
  const getClueById = useClueStore((s) => s.getClueById);
  const getTasksByClueId = useClueStore((s) => s.getTasksByClueId);
  const updateClueStatus = useClueStore((s) => s.updateClueStatus);
  const addTask = useClueStore((s) => s.addTask);
  const getRecommendedRoles = useClueStore((s) => s.getRecommendedRoles);
  const getRecommendedTemplates = useClueStore((s) => s.getRecommendedTemplates);
  const dispatchTasksForClue = useClueStore((s) => s.dispatchTasksForClue);
  const clues = useClueStore((s) => s.clues);
  const tasks = useClueStore((s) => s.tasks);
  const templates = useClueStore((s) => s.templates);
  const setReplyContext = useClueStore((s) => s.setReplyContext);

  const clue = useMemo(() => getClueById(clueId), [clueId, clues]);
  const clueTasks = useMemo(() => getTasksByClueId(clueId), [clueId, tasks]);

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RoleType>('counselor');
  const [taskContent, setTaskContent] = useState('');
  const [deadlineOption, setDeadlineOption] = useState('60');
  const [assignee, setAssignee] = useState('');

  const recommendedRoles = useMemo(() => {
    if (!clue) return [];
    return getRecommendedRoles(clue.eventType, clue.urgentLevel);
  }, [clue, getRecommendedRoles]);

  const recommendedTemplates = useMemo(() => {
    if (!clue) return [];
    return getRecommendedTemplates(clue.eventType, 'student', clue.urgentLevel);
  }, [clue, getRecommendedTemplates]);

  const isEmergency = clue?.urgentLevel === 'high';
  const isNight = isNightTime();

  const adviceConfig = useMemo(() => {
    if (isEmergency && isNight) {
      return { icon: '🌙⚡', title: '紧急舆情·夜间处置', desc: '深夜人手有限，建议先发群安抚，再跟进核实' };
    }
    if (isEmergency) {
      return { icon: '⚡', title: '紧急舆情处置建议', desc: '关注度高，建议30分钟内启动响应' };
    }
    if (isNight) {
      return { icon: '🌙', title: '夜间值班处置建议', desc: '深夜人手有限，建议先发群安抚，再跟进核实' };
    }
    return { icon: '📋', title: '处置建议', desc: '按步骤处置舆情，确保闭环' };
  }, [isEmergency, isNight]);

  const roleOptions = Object.entries(ROLE_MAP).map(([key, value]) => ({
    key: key as RoleType,
    label: value.label,
    department: value.department
  }));

  const deadlineOptions = [
    { key: '30', label: '30分钟', minutes: 30 },
    { key: '60', label: '1小时', minutes: 60 },
    { key: '120', label: '2小时', minutes: 120 },
    { key: '240', label: '4小时', minutes: 240 },
    { key: '1440', label: '明天', minutes: 1440 }
  ];

  useEffect(() => {
    if (showTaskModal && clue) {
      const content = generateTaskContent(clue.eventType, selectedRole, clue.title);
      setTaskContent(content);
    }
  }, [selectedRole, showTaskModal, clue]);

  const handleOpenTaskModal = () => {
    if (!clue) return;
    if (recommendedRoles.length > 0) {
      setSelectedRole(recommendedRoles[0]);
    }
    setShowTaskModal(true);
  };

  const handleSaveTask = () => {
    if (!clue || !taskContent.trim()) {
      Taro.showToast({ title: '请填写任务内容', icon: 'none' });
      return;
    }

    const minutes = parseInt(deadlineOption, 10);
    const deadline = new Date(Date.now() + minutes * 60 * 1000).toISOString();

    addTask({
      clueId: clue.id,
      clueTitle: clue.title,
      role: selectedRole,
      assignee: assignee.trim() || ROLE_MAP[selectedRole].label,
      content: taskContent.trim(),
      deadline
    });

    Taro.showToast({ title: '任务已派发', icon: 'success' });
    setShowTaskModal(false);

    if (clue.status === 'pending') {
      updateClueStatus(clue.id, 'processing');
    }
  };

  const handleQuickDispatch = () => {
    if (!clue) return;
    const count = dispatchTasksForClue(clue.id, recommendedRoles);
    Taro.showToast({ title: `已派发${count}项任务`, icon: 'success' });
    if (clue.status === 'pending') {
      updateClueStatus(clue.id, 'processing');
    }
  };

  const handleGoReply = (templateId?: string) => {
    setReplyContext({
      clueId,
      audience: 'students',
      templateId: templateId || undefined
    });
    Taro.switchTab({ url: '/pages/reply/index' });
  };

  const handleChangeStatus = () => {
    if (!clue) return;
    const nextMap: Record<string, string> = {
      pending: 'processing',
      processing: 'replied',
      replied: 'archived',
      archived: 'pending'
    };
    const next = nextMap[clue.status];
    if (next) {
      updateClueStatus(clue.id, next as any);
      Taro.showToast({ title: '状态已更新', icon: 'success' });
    }
  };

  useDidShow(() => {
    console.log('[DetailPage] 查看线索详情:', clueId);
  });

  if (!clue) {
    return (
      <View className={styles.page}>
        <View className={styles.content}>
          <View className={styles.emptyHint}>
            <Text className={styles.emptyIcon}>❓</Text>
            <Text className={styles.emptyText}>线索不存在或已被删除</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className={styles.page}>
      <View className={styles.content}>
        <View className={styles.headerCard}>
          <View className={styles.tagsRow}>
            <StatusBadge type="urgent" value={clue.urgentLevel} size="md" />
            <StatusBadge type="status" value={clue.status} size="md" />
            <TypeTag type="event" value={clue.eventType} showIcon size="md" />
            <TypeTag type="source" value={clue.source} showIcon size="md" />
          </View>

          <Text className={styles.title}>{clue.title}</Text>
          <Text className={styles.description}>{clue.description}</Text>

          <View className={styles.metaGrid}>
            <View className={styles.metaItem}>
              <Text className={styles.metaIcon}>🕐</Text>
              <View>
                <Text className={styles.metaLabel}>登记时间</Text>
                <Text className={styles.metaValue}>{formatFullTime(clue.createdAt)}</Text>
              </View>
            </View>
            <View className={styles.metaItem}>
              <Text className={styles.metaIcon}>⏱️</Text>
              <View>
                <Text className={styles.metaLabel}>发生时长</Text>
                <Text className={styles.metaValue}>{timeFromNow(clue.createdAt)}</Text>
              </View>
            </View>
            <View className={styles.metaItem}>
              <Text className={styles.metaIcon}>📍</Text>
              <View>
                <Text className={styles.metaLabel}>涉及地点</Text>
                <Text className={styles.metaValue}>{clue.location || '待确认'}</Text>
              </View>
            </View>
            <View className={styles.metaItem}>
              <Text className={styles.metaIcon}>👥</Text>
              <View>
                <Text className={styles.metaLabel}>涉及人数</Text>
                <Text className={styles.metaValue}>约 {clue.involvedCount || 0} 人</Text>
              </View>
            </View>
          </View>
        </View>

        <View className={styles.adviceSection}>
          <View className={classnames(styles.adviceCard, isEmergency && styles.adviceUrgent)}>
            <View className={styles.adviceHeader}>
              <Text className={styles.adviceIcon}>{adviceConfig.icon}</Text>
              <View>
                <Text className={styles.adviceTitle}>
                  {adviceConfig.title}
                </Text>
                <Text className={styles.adviceSubtitle}>
                  {adviceConfig.desc}
                </Text>
              </View>
            </View>

              <View className={styles.adviceSteps}>
                <View className={styles.stepItem}>
                  <View className={styles.stepNum}>1</View>
                  <View className={styles.stepContent}>
                    <Text className={styles.stepTitle}>快速安抚</Text>
                    <Text className={styles.stepDesc}>
                      先在学生群发公告稳住情绪，避免扩散
                    </Text>
                    {recommendedTemplates.length > 0 && (
                      <View className={styles.stepTemplates}>
                        {recommendedTemplates.slice(0, 2).map((t) => (
                          <View
                            key={t.id}
                            className={styles.stepTemplateTag}
                            onClick={() => handleGoReply(t.id)}
                          >
                            <Text className={styles.stepTemplateText}>📝 {t.title}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                    <Button
                      className={classnames(styles.stepBtn, styles.stepBtnOutline)}
                      onClick={() => handleGoReply()}
                    >
                      去生成回复 →
                    </Button>
                  </View>
                </View>

                <View className={styles.stepDivider} />

                <View className={styles.stepItem}>
                  <View className={styles.stepNum}>2</View>
                  <View className={styles.stepContent}>
                    <Text className={styles.stepTitle}>协同核实</Text>
                    <Text className={styles.stepDesc}>
                      同步给责任部门，等待反馈结果
                    </Text>
                    {recommendedRoles.length > 0 && (
                      <View className={styles.stepRoles}>
                        {recommendedRoles.map((r) => (
                          <View key={r} className={styles.stepRoleTag}>
                            <Text className={styles.stepRoleText}>
                              {ROLE_MAP[r]?.icon || '👤'} {ROLE_MAP[r]?.label}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                    {clueTasks.length === 0 ? (
                      <Button
                        className={classnames(styles.stepBtn, styles.stepBtnPrimary)}
                        onClick={handleQuickDispatch}
                      >
                        一键派发{recommendedRoles.length}项任务
                      </Button>
                    ) : (
                      <Text className={styles.stepDoneText}>✓ 已派发 {clueTasks.length} 项任务</Text>
                    )}
                  </View>
                </View>

                <View className={styles.stepDivider} />

                <View className={styles.stepItem}>
                  <View className={styles.stepNum}>3</View>
                  <View className={styles.stepContent}>
                    <Text className={styles.stepTitle}>更新进展</Text>
                    <Text className={styles.stepDesc}>
                      收到反馈后及时更新，持续跟进直到闭环
                    </Text>
                    <Button
                      className={classnames(styles.stepBtn, styles.stepBtnOutline)}
                      onClick={handleChangeStatus}
                    >
                      更新处理状态
                    </Button>
                  </View>
                </View>
              </View>
            </View>
          </View>

        <View className={styles.tasksSection}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>协同任务（{clueTasks.length}项）</Text>
            <Text className={styles.addTaskBtn} onClick={handleOpenTaskModal}>
              + 派发任务
            </Text>
          </View>
          {clueTasks.length === 0 ? (
            <View className={styles.emptyHint}>
              <Text className={styles.emptyIcon}>📋</Text>
              <Text className={styles.emptyText}>暂无协同任务，点击上方按钮派发</Text>
            </View>
          ) : (
            clueTasks.map((task) => (
              <TaskItem key={task.id} task={task} showClueTitle={false} />
            ))
          )}
        </View>

        <View className={styles.timelineSection}>
          <Text className={styles.sectionTitle}>处理时间线</Text>
          <View className={styles.timelineCard}>
            <View className={styles.timelineList}>
              {clue.timeline.map((item) => (
                <View key={item.id} className={styles.timelineItem}>
                  <View className={styles.timelineDot} />
                  <Text className={styles.timelineTitle}>{item.action}</Text>
                  <Text className={styles.timelineTime}>{formatFullTime(item.time)}</Text>
                  <TypeTag type="role" value={item.role} size="sm" />
                  <Text className={styles.timelineOperator}> - {item.operator}</Text>
                  {item.note && (
                    <Text className={styles.timelineNote}>{item.note}</Text>
                  )}
                </View>
              ))}
            </View>
          </View>
        </View>
      </View>

      <View className={styles.bottomBar}>
        <Button className={`${styles.btn} ${styles.btnSecondary}`} onClick={handleOpenTaskModal}>
          + 派发任务
        </Button>
        <Button className={`${styles.btn} ${styles.btnSecondary}`} onClick={handleChangeStatus}>
          变更状态
        </Button>
        <Button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleGoReply}>
          生成回复
        </Button>
      </View>

      {showTaskModal && (
        <View className={styles.modalMask} onClick={() => setShowTaskModal(false)}>
          <View className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <View className={styles.modalHeader}>
              <Text className={styles.modalTitle}>派发协同任务</Text>
              <Text className={styles.modalClose} onClick={() => setShowTaskModal(false)}>
                ✕
              </Text>
            </View>

            <View className={styles.modalBody}>
              {recommendedRoles.length > 0 && (
                <View className={styles.tipsCard}>
                  <Text className={styles.tipsTitle}>💡 智能推荐</Text>
                  <Text className={styles.tipsText}>
                    根据【{EVENT_TYPE_MAP[clue.eventType]?.label}】事件类型，推荐优先联系：
                    {recommendedRoles.map((r) => ROLE_MAP[r]?.label).join('、')}
                  </Text>
                </View>
              )}

              <View className={styles.formGroup}>
                <Text className={styles.formLabel}>
                  责任角色<Text className={styles.required}>*</Text>
                </Text>
                <View className={styles.roleGrid}>
                  {roleOptions.map((opt) => (
                    <View
                      key={opt.key}
                      className={classnames(
                        styles.roleItem,
                        selectedRole === opt.key && styles.roleActive,
                        recommendedRoles.includes(opt.key) && styles.roleRecommended
                      )}
                      onClick={() => setSelectedRole(opt.key)}
                    >
                      <Text className={styles.roleName}>{opt.label}</Text>
                      <Text className={styles.roleDept}>{opt.department}</Text>
                      {recommendedRoles.includes(opt.key) && (
                        <Text className={styles.recommendBadge}>推荐</Text>
                      )}
                    </View>
                  ))}
                </View>
              </View>

              <View className={styles.formGroup}>
                <Text className={styles.formLabel}>责任人（选填）</Text>
                <Input
                  className={styles.formInput}
                  placeholder="如：张老师、李师傅"
                  value={assignee}
                  onInput={(e) => setAssignee(e.detail.value)}
                  maxlength={20}
                />
              </View>

              <View className={styles.formGroup}>
                <Text className={styles.formLabel}>
                  核实内容<Text className={styles.required}>*</Text>
                </Text>
                <Textarea
                  className={styles.formTextarea}
                  placeholder="请描述需要核实的具体事项..."
                  value={taskContent}
                  onInput={(e) => setTaskContent(e.detail.value)}
                  maxlength={300}
                  autoHeight={false}
                />
              </View>

              <View className={styles.formGroup}>
                <Text className={styles.formLabel}>
                  反馈时限<Text className={styles.required}>*</Text>
                </Text>
                <View className={styles.deadlineRow}>
                  {deadlineOptions.map((opt) => (
                    <View
                      key={opt.key}
                      className={classnames(
                        styles.deadlineItem,
                        deadlineOption === opt.key && styles.deadlineActive
                      )}
                      onClick={() => setDeadlineOption(opt.key)}
                    >
                      <Text className={styles.deadlineText}>{opt.label}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>

            <View className={styles.modalFooter}>
              <Button
                className={`${styles.modalBtn} ${styles.modalBtnSecondary}`}
                onClick={() => setShowTaskModal(false)}
              >
                取消
              </Button>
              <Button
                className={`${styles.modalBtn} ${styles.modalBtnPrimary}`}
                onClick={handleSaveTask}
              >
                确认派发
              </Button>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default DetailPage;
