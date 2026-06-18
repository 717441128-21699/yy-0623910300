import React, { useMemo } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import StatusBadge from '@/components/StatusBadge';
import TypeTag from '@/components/TypeTag';
import { useClueStore } from '@/store/useClueStore';
import { ROLE_MAP, EVENT_TYPE_MAP, URGENT_MAP, AUDIENCE_MAP } from '@/types';
import type { Clue } from '@/types';
import { formatTime, isNightTime, isWeekend, getTimeGreeting } from '@/utils';
import styles from './index.module.scss';
import classnames from 'classnames';

const DutyPage: React.FC = () => {
  const clues = useClueStore((s) => s.clues);
  const tasks = useClueStore((s) => s.tasks);
  const templates = useClueStore((s) => s.templates);
  const getRecommendedRoles = useClueStore((s) => s.getRecommendedRoles);
  const getRecommendedTemplates = useClueStore((s) => s.getRecommendedTemplates);
  const setReplyContext = useClueStore((s) => s.setReplyContext);
  const dispatchTasksForClue = useClueStore((s) => s.dispatchTasksForClue);
  const updateClueStatus = useClueStore((s) => s.updateClueStatus);
  const getTasksByClueId = useClueStore((s) => s.getTasksByClueId);

  const isNight = isNightTime();
  const isWeekendDay = isWeekend();
  const greeting = getTimeGreeting();

  const urgentClues = useMemo(
    () =>
      clues
        .filter((c) => c.urgentLevel === 'high' && c.status !== 'archived')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [clues]
  );

  const pendingTasks = useMemo(
    () =>
      tasks
        .filter((t) => t.status === 'pending' || t.status === 'confirmed')
        .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()),
    [tasks]
  );

  const pacifyTemplates = useMemo(
    () => templates.filter((t) => t.category === 'emotion' && t.audience === 'students'),
    [templates]
  );

  const getClueStepStatus = (clue: Clue) => {
    const clueTasks = getTasksByClueId(clue.id);
    const hasTask = clueTasks.length > 0;
    const hasCompleted = clueTasks.some((t) => t.status === 'completed');
    const hasFeedback = clueTasks.some((t) => t.feedback);

    if (clue.status === 'archived' || clue.status === 'replied') return 'done';
    if (hasFeedback) return 'feedback';
    if (hasTask && clueTasks.some((t) => t.status === 'confirmed')) return 'progress';
    if (hasTask) return 'dispatched';
    return 'initial';
  };

  const handleGoDetail = (clueId: string) => {
    Taro.navigateTo({ url: `/pages/detail/index?id=${clueId}` });
  };

  const handleQuickPacify = (clue: Clue) => {
    const recommended = getRecommendedTemplates(clue.eventType, 'students');
    const templateId = recommended.length > 0 ? recommended[0].id : undefined;
    setReplyContext({
      clueId: clue.id,
      audience: 'students',
      templateId
    });
    Taro.switchTab({ url: '/pages/reply/index' });
  };

  const handleQuickDispatch = (clue: Clue) => {
    const roles = getRecommendedRoles(clue.eventType, clue.urgentLevel);
    if (roles.length > 0) {
      dispatchTasksForClue(clue.id, roles);
      if (clue.status === 'pending') {
        updateClueStatus(clue.id, 'processing');
      }
      Taro.showToast({ title: `已派发${roles.length}项任务`, icon: 'success' });
    } else {
      Taro.navigateTo({ url: `/pages/detail/index?id=${clue.id}` });
    }
  };

  const handleCreateClue = () => {
    Taro.navigateTo({ url: '/pages/create/index' });
  };

  const stepStatusMap: Record<string, { label: string; color: string; icon: string }> = {
    initial: { label: '待响应', color: '#E5484D', icon: '🔴' },
    dispatched: { label: '已派发', color: '#F5A623', icon: '🟡' },
    progress: { label: '核实中', color: '#3A7BD5', icon: '🔵' },
    feedback: { label: '有反馈', color: '#22C55E', icon: '🟢' },
    done: { label: '已闭环', color: '#718096', icon: '⚪' }
  };

  return (
    <ScrollView className={styles.page} scrollY>
      <View className={styles.headerSection}>
        <View className={styles.dutyCard}>
          <View className={styles.dutyCardDecoration} />
          <View className={styles.dutyCardContent}>
            <Text className={styles.dutyGreeting}>{greeting}，值班老师</Text>
            <Text className={styles.dutyTitle}>
              {isNight && isWeekendDay
                ? '🌙 周末夜间值班'
                : isNight
                ? '🌙 夜间值班'
                : isWeekendDay
                ? '📅 周末值班'
                : '📋 当日值班'}
            </Text>
            <Text className={styles.dutySubtitle}>
              {urgentClues.length > 0
                ? `当前有 ${urgentClues.length} 条紧急线索待处理`
                : '当前无紧急线索，保持关注'}
            </Text>
            <View className={styles.dutyStats}>
              <View className={styles.dutyStatItem}>
                <Text className={styles.dutyStatValue}>{urgentClues.length}</Text>
                <Text className={styles.dutyStatLabel}>紧急线索</Text>
              </View>
              <View className={styles.dutyStatItem}>
                <Text className={styles.dutyStatValue}>{pendingTasks.length}</Text>
                <Text className={styles.dutyStatLabel}>待处理任务</Text>
              </View>
              <View className={styles.dutyStatItem}>
                <Text className={styles.dutyStatValue}>
                  {clues.filter((c) => c.status === 'archived' || c.status === 'replied').length}
                </Text>
                <Text className={styles.dutyStatLabel}>已闭环</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {urgentClues.length > 0 && (
        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>🚨 紧急线索</Text>
            <Text className={styles.sectionAction} onClick={handleCreateClue}>
              + 登记
            </Text>
          </View>

          {urgentClues.map((clue) => {
            const stepStatus = getClueStepStatus(clue);
            const statusInfo = stepStatusMap[stepStatus];
            const recommendedRoles = getRecommendedRoles(clue.eventType, clue.urgentLevel);
            const clueTasks = getTasksByClueId(clue.id);

            return (
              <View key={clue.id} className={styles.urgentCard}>
                <View className={styles.urgentCardHeader}>
                  <View className={styles.urgentCardTags}>
                    <StatusBadge type="urgent" value={clue.urgentLevel} size="sm" />
                    <StatusBadge type="status" value={clue.status} size="sm" />
                    <TypeTag type="event" value={clue.eventType} size="sm" />
                  </View>
                  <View
                    className={classnames(styles.stepBadge, styles[`step_${stepStatus}`])}
                  >
                    <Text className={styles.stepBadgeIcon}>{statusInfo.icon}</Text>
                    <Text className={styles.stepBadgeText}>{statusInfo.label}</Text>
                  </View>
                </View>

                <Text className={styles.urgentCardTitle}>{clue.title}</Text>
                <Text className={styles.urgentCardDesc} numberOfLines={2}>
                  {clue.description}
                </Text>

                <View className={styles.urgentCardMeta}>
                  <Text className={styles.urgentCardTime}>🕐 {formatTime(clue.createdAt)}</Text>
                  {clue.location && (
                    <Text className={styles.urgentCardLoc}>📍 {clue.location}</Text>
                  )}
                </View>

                <View className={styles.stepFlow}>
                  <View
                    className={classnames(
                      styles.flowStep,
                      stepStatus !== 'initial' && styles.flowStepDone
                    )}
                  >
                    <View className={styles.flowDot}>1</View>
                    <Text className={styles.flowLabel}>安抚</Text>
                  </View>
                  <View className={styles.flowLine} />
                  <View
                    className={classnames(
                      styles.flowStep,
                      ['dispatched', 'progress', 'feedback', 'done'].includes(stepStatus) &&
                        styles.flowStepDone
                    )}
                  >
                    <View className={styles.flowDot}>2</View>
                    <Text className={styles.flowLabel}>派发</Text>
                  </View>
                  <View className={styles.flowLine} />
                  <View
                    className={classnames(
                      styles.flowStep,
                      ['feedback', 'done'].includes(stepStatus) && styles.flowStepDone
                    )}
                  >
                    <View className={styles.flowDot}>3</View>
                    <Text className={styles.flowLabel}>反馈</Text>
                  </View>
                  <View className={styles.flowLine} />
                  <View
                    className={classnames(
                      styles.flowStep,
                      stepStatus === 'done' && styles.flowStepDone
                    )}
                  >
                    <View className={styles.flowDot}>4</View>
                    <Text className={styles.flowLabel}>闭环</Text>
                  </View>
                </View>

                <View className={styles.urgentCardActions}>
                  {stepStatus === 'initial' && (
                    <>
                      <Button
                        className={classnames(styles.actionBtn, styles.actionPrimary)}
                        onClick={() => handleQuickPacify(clue)}
                      >
                        📝 先发安抚
                      </Button>
                      <Button
                        className={classnames(styles.actionBtn, styles.actionSecondary)}
                        onClick={() => handleQuickDispatch(clue)}
                      >
                        📤 派发核实
                      </Button>
                    </>
                  )}
                  {stepStatus === 'dispatched' && (
                    <Button
                      className={classnames(styles.actionBtn, styles.actionSecondary)}
                      onClick={() => handleGoDetail(clue.id)}
                    >
                      👁 查看进度
                    </Button>
                  )}
                  {(stepStatus === 'progress' || stepStatus === 'feedback') && (
                    <>
                      <Button
                        className={classnames(styles.actionBtn, styles.actionPrimary)}
                        onClick={() => handleQuickPacify(clue)}
                      >
                        📝 发进展回复
                      </Button>
                      <Button
                        className={classnames(styles.actionBtn, styles.actionSecondary)}
                        onClick={() => handleGoDetail(clue.id)}
                      >
                        👁 查看详情
                      </Button>
                    </>
                  )}
                  {stepStatus === 'done' && (
                    <Button
                      className={classnames(styles.actionBtn, styles.actionSecondary)}
                      onClick={() => handleGoDetail(clue.id)}
                    >
                      ✓ 已闭环
                    </Button>
                  )}
                </View>

                {clueTasks.some((t) => t.feedback) && (
                  <View className={styles.feedbackHint}>
                    <Text className={styles.feedbackHintIcon}>💬</Text>
                    <Text className={styles.feedbackHintText}>
                      最新反馈：{clueTasks.find((t) => t.feedback)?.feedback?.slice(0, 50)}
                      {clueTasks.find((t) => t.feedback)?.feedback?.length > 50 ? '...' : ''}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}

      {pendingTasks.length > 0 && (
        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>⏰ 待处理任务</Text>
          </View>
          {pendingTasks.slice(0, 5).map((task) => (
            <View key={task.id} className={styles.taskCard}>
              <View className={styles.taskCardHeader}>
                <TypeTag type="role" value={task.role} size="sm" />
                <StatusBadge type="task" value={task.status} size="sm" />
              </View>
              <Text className={styles.taskCardContent}>{task.content}</Text>
              <View className={styles.taskCardMeta}>
                <Text className={styles.taskCardAssignee}>
                  {ROLE_MAP[task.role]?.icon} {task.assignee}
                </Text>
                <Text
                  className={styles.taskCardLink}
                  onClick={() => handleGoDetail(task.clueId)}
                >
                  查看线索 →
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {pacifyTemplates.length > 0 && (
        <View className={styles.section}>
          <View className={styles.sectionHeader}>
            <Text className={styles.sectionTitle}>💬 学生群安抚话术</Text>
          </View>
          {pacifyTemplates.slice(0, 3).map((tpl) => (
            <View key={tpl.id} className={styles.templateCard}>
              <View className={styles.templateHeader}>
                <Text className={styles.templateTitle}>{tpl.title}</Text>
                <Text className={styles.templateUsage}>🔥 {tpl.usageCount}次</Text>
              </View>
              <Text className={styles.templatePreview} numberOfLines={3}>
                {tpl.content}
              </Text>
              <View className={styles.templateActions}>
                {urgentClues.length > 0 && (
                  <Button
                    className={classnames(styles.actionBtn, styles.actionPrimary)}
                    onClick={() => {
                      setReplyContext({
                        clueId: urgentClues[0].id,
                        audience: 'students',
                        templateId: tpl.id
                      });
                      Taro.switchTab({ url: '/pages/reply/index' });
                    }}
                  >
                    用于最新线索
                  </Button>
                )}
                <Button
                  className={classnames(styles.actionBtn, styles.actionSecondary)}
                  onClick={() => {
                    Taro.switchTab({ url: '/pages/reply/index' });
                  }}
                >
                  查看全部模板
                </Button>
              </View>
            </View>
          ))}
        </View>
      )}

      {urgentClues.length === 0 && pendingTasks.length === 0 && (
        <View className={styles.allClear}>
          <Text className={styles.allClearIcon}>✅</Text>
          <Text className={styles.allClearTitle}>一切正常</Text>
          <Text className={styles.allClearDesc}>
            当前无紧急线索和待处理任务，保持关注即可
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

export default DutyPage;
