import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import StatusBadge from '@/components/StatusBadge';
import TypeTag from '@/components/TypeTag';
import TaskItem from '@/components/TaskItem';
import { useClueStore } from '@/store/useClueStore';
import { ROLE_MAP, EVENT_TYPE_MAP, URGENT_MAP, AUDIENCE_MAP } from '@/types';
import type { Clue, TargetAudience, TemplateCategory } from '@/types';
import { formatTime, isNightTime, isWeekend, getTimeGreeting, copyToClipboard } from '@/utils';
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
  const getRepliesByClueId = useClueStore((s) => s.getRepliesByClueId);
  const updateTaskStatus = useClueStore((s) => s.updateTaskStatus);
  const recordReply = useClueStore((s) => s.recordReply);
  const copyToClipboardUtil = copyToClipboard;
  const getClosureSummary = useClueStore((s) => s.getClosureSummary);
  const archiveClue = useClueStore((s) => s.archiveClue);
  const getLatestFeedbackForClue = useClueStore((s) => s.getLatestFeedbackForClue);

  const [expandedClueId, setExpandedClueId] = useState<string>('');

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
    const latestFeedback = getLatestFeedbackForClue(clue.id);
    const preferCategory: TemplateCategory | undefined = latestFeedback ? 'progress' : undefined;
    const recommended = getRecommendedTemplates(clue.eventType, 'students', clue.urgentLevel, preferCategory);
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

  const handleToggleExpand = (clueId: string) => {
    setExpandedClueId((prev) => (prev === clueId ? '' : clueId));
  };

  const handleCopyReply = async (reply: {
    id: string;
    clueId: string;
    audience: TargetAudience;
    templateId?: string;
    content: string;
    sentAt: string;
  }) => {
    const ok = await copyToClipboardUtil(reply.content);
    if (ok) {
      recordReply({
        clueId: reply.clueId,
        audience: reply.audience,
        templateId: reply.templateId,
        content: reply.content
      });
      Taro.showToast({ title: '已复制，记录已更新', icon: 'success' });
    }
  };

  const handleMarkReplied = (clue: Clue) => {
    updateClueStatus(clue.id, 'replied');
    Taro.showToast({ title: '已标记为已回复', icon: 'success' });
  };

  const handleMarkArchived = (clue: Clue) => {
    handleArchiveClue(clue.id);
  };

  const handleArchiveClue = (clueId: string) => {
    archiveClue(clueId);
    setExpandedClueId('');
    Taro.showToast({ title: '已归档，记录已保存', icon: 'success' });
  };

  const stepStatusMap: Record<string, { label: string; color: string; icon: string }> = {
    initial: { label: '待响应', color: '#E5484D', icon: '🔴' },
    dispatched: { label: '已派发', color: '#F5A623', icon: '🟡' },
    progress: { label: '核实中', color: '#3A7BD5', icon: '🔵' },
    feedback: { label: '有反馈', color: '#22C55E', icon: '🟢' },
    done: { label: '已闭环', color: '#718096', icon: '⚪' }
  };

  const getNextStepButtons = (clue: Clue, stepStatus: string) => {
    const buttons: { label: string; icon: string; onClick: () => void; primary?: boolean }[] = [];

    switch (stepStatus) {
      case 'initial':
        buttons.push({
          label: '先发安抚',
          icon: '📝',
          onClick: () => handleQuickPacify(clue),
          primary: true
        });
        buttons.push({
          label: '派发核实',
          icon: '📤',
          onClick: () => handleQuickDispatch(clue)
        });
        break;
      case 'dispatched':
        buttons.push({
          label: '等待反馈中',
          icon: '⏳',
          onClick: () => handleGoDetail(clue.id)
        });
        buttons.push({
          label: '先发安抚',
          icon: '📝',
          onClick: () => handleQuickPacify(clue),
          primary: true
        });
        break;
      case 'progress':
        buttons.push({
          label: '更新进展',
          icon: '🔄',
          onClick: () => handleGoDetail(clue.id),
          primary: true
        });
        buttons.push({
          label: '发进展回复',
          icon: '📝',
          onClick: () => handleQuickPacify(clue)
        });
        break;
      case 'feedback':
        buttons.push({
          label: '发进展回复',
          icon: '📝',
          onClick: () => handleQuickPacify(clue),
          primary: true
        });
        buttons.push({
          label: '查看详情',
          icon: '👁',
          onClick: () => handleGoDetail(clue.id)
        });
        break;
      case 'done':
        buttons.push({
          label: '查看详情',
          icon: '👁',
          onClick: () => handleGoDetail(clue.id)
        });
        break;
    }

    return buttons;
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
            const clueReplies = getRepliesByClueId(clue.id);
            const isExpanded = expandedClueId === clue.id;
            const nextButtons = getNextStepButtons(clue, stepStatus);

            const repliesByAudience: Record<string, typeof clueReplies> = {
              students: [],
              parents: [],
              public: []
            };
            clueReplies.forEach((r) => {
              if (repliesByAudience[r.audience]) {
                repliesByAudience[r.audience].push(r);
              }
            });
            const summary = getClosureSummary(clue.id);
            const miniTimelineItems = clue.timeline.slice(-10).reverse();

            return (
              <View
                key={clue.id}
                className={classnames(styles.urgentCard, isExpanded && styles.urgentCardExpanded)}
              >
                <View onClick={() => handleToggleExpand(clue.id)} className={styles.urgentCardClickable}>
                  <View className={styles.urgentCardHeader}>
                    <View className={styles.urgentCardTags}>
                      <StatusBadge type="urgent" value={clue.urgentLevel} size="sm" />
                      <StatusBadge type="status" value={clue.status} size="sm" />
                      <TypeTag type="event" value={clue.eventType} size="sm" />
                    </View>
                    <View className={styles.urgentCardHeaderRight}>
                      <View
                        className={classnames(styles.stepBadge, styles[`step_${stepStatus}`])}
                      >
                        <Text className={styles.stepBadgeIcon}>{statusInfo.icon}</Text>
                        <Text className={styles.stepBadgeText}>{statusInfo.label}</Text>
                      </View>
                      <Text className={styles.expandIcon}>{isExpanded ? '▲' : '▼'}</Text>
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

                  {!isExpanded && (
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
                  )}

                  {!isExpanded && clueTasks.some((t) => t.feedback) && (
                    <View className={styles.feedbackHint}>
                      <Text className={styles.feedbackHintIcon}>💬</Text>
                      <Text className={styles.feedbackHintText}>
                        最新反馈：{clueTasks.find((t) => t.feedback)?.feedback?.slice(0, 50)}
                        {clueTasks.find((t) => t.feedback)?.feedback?.length > 50 ? '...' : ''}
                      </Text>
                    </View>
                  )}
                </View>

                {!isExpanded && (
                  <View className={styles.urgentCardActions}>
                    {stepStatus === 'initial' && (
                      <>
                        <Button
                          className={classnames(styles.actionBtn, styles.actionPrimary)}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickPacify(clue);
                          }}
                        >
                          📝 先发安抚
                        </Button>
                        <Button
                          className={classnames(styles.actionBtn, styles.actionSecondary)}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickDispatch(clue);
                          }}
                        >
                          📤 派发核实
                        </Button>
                      </>
                    )}
                    {stepStatus === 'dispatched' && (
                      <Button
                        className={classnames(styles.actionBtn, styles.actionSecondary)}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGoDetail(clue.id);
                        }}
                      >
                        👁 查看进度
                      </Button>
                    )}
                    {(stepStatus === 'progress' || stepStatus === 'feedback') && (
                      <>
                        <Button
                          className={classnames(styles.actionBtn, styles.actionPrimary)}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickPacify(clue);
                          }}
                        >
                          📝 发进展回复
                        </Button>
                        <Button
                          className={classnames(styles.actionBtn, styles.actionSecondary)}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGoDetail(clue.id);
                          }}
                        >
                          👁 查看详情
                        </Button>
                      </>
                    )}
                    {stepStatus === 'done' && (
                      <Button
                        className={classnames(styles.actionBtn, styles.actionSecondary)}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGoDetail(clue.id);
                        }}
                      >
                        ✓ 已闭环
                      </Button>
                    )}
                  </View>
                )}

                {isExpanded && (
                  <View className={styles.expandedContent}>
                    <View className={styles.workbenchSection}>
                      <View className={styles.workbenchSectionHeader}>
                        <Text className={styles.workbenchSectionIcon}>�</Text>
                        <Text className={styles.workbenchSectionTitle}>处置状态摘要</Text>
                      </View>
                      <View className={styles.summaryGrid}>
                        <View className={styles.summaryItem} style={{ background: 'rgba(58, 123, 213, 0.08)', borderColor: 'rgba(58, 123, 213, 0.2)' }}>
                          <Text className={styles.summaryValue} style={{ color: '#3A7BD5' }}>{summary.duration || '0分钟'}</Text>
                          <Text className={styles.summaryLabel}>🕐 处置时长</Text>
                        </View>
                        <View className={styles.summaryItem} style={{ background: 'rgba(139, 92, 246, 0.08)', borderColor: 'rgba(139, 92, 246, 0.2)' }}>
                          <Text className={styles.summaryValue} style={{ color: '#8B5CF6' }}>
                            {summary.totalReplies}条
                            <Text style={{ fontSize: '20rpx', opacity: 0.8 }}>
                              （学生{summary.replyByAudience.students || 0}/家长{summary.replyByAudience.parents || 0}/公告{summary.replyByAudience.public || 0}）
                            </Text>
                          </Text>
                          <Text className={styles.summaryLabel}>💬 发送回复</Text>
                        </View>
                        <View className={styles.summaryItem} style={{ background: 'rgba(34, 197, 94, 0.08)', borderColor: 'rgba(34, 197, 94, 0.2)' }}>
                          <Text className={styles.summaryValue} style={{ color: '#22C55E' }}>
                            {summary.completedTasks}/{summary.totalTasks}项
                          </Text>
                          <Text className={styles.summaryLabel}>📋 任务完成</Text>
                        </View>
                        <View className={styles.summaryItem} style={{ background: 'rgba(245, 166, 35, 0.08)', borderColor: 'rgba(245, 166, 35, 0.2)' }}>
                          <Text className={styles.summaryValue} style={{ color: '#F5A623' }} numberOfLines={1}>
                            {summary.latestFeedback ? summary.latestFeedback.slice(0, 20) + (summary.latestFeedback.length > 20 ? '...' : '') : '暂无反馈'}
                          </Text>
                          <Text className={styles.summaryLabel}>📝 最新反馈</Text>
                        </View>
                      </View>
                    </View>

                    <View className={styles.workbenchSection}>
                      <View className={styles.workbenchSectionHeader}>
                        <Text className={styles.workbenchSectionIcon}>��</Text>
                        <Text className={styles.workbenchSectionTitle}>下一步处置</Text>
                      </View>
                      <View className={styles.nextStepButtons}>
                        {nextButtons.map((btn, idx) => (
                          <Button
                            key={idx}
                            className={classnames(
                              styles.nextStepBtn,
                              btn.primary && styles.nextStepBtnPrimary
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              btn.onClick();
                            }}
                          >
                            <Text className={styles.nextStepBtnIcon}>{btn.icon}</Text>
                            <Text className={styles.nextStepBtnText}>{btn.label}</Text>
                          </Button>
                        ))}
                      </View>
                    </View>

                    <View className={styles.workbenchSection}>
                      <View className={styles.workbenchSectionHeader}>
                        <Text className={styles.workbenchSectionIcon}>💬</Text>
                        <Text className={styles.workbenchSectionTitle}>
                          已发回复记录
                          <Text className={styles.workbenchSectionCount}>（{clueReplies.length}条）</Text>
                        </Text>
                      </View>
                      {clueReplies.length === 0 ? (
                        <View className={styles.emptySubSection}>
                          <Text className={styles.emptySubText}>暂无发送记录，点击上方"先发安抚"开始处置</Text>
                        </View>
                      ) : (
                        <View className={styles.replyList}>
                          {(['students', 'parents', 'public'] as TargetAudience[]).map((aud) =>
                            repliesByAudience[aud]?.length > 0 ? (
                              <View key={aud} className={styles.replyGroup}>
                                <View className={styles.replyGroupHeader}>
                                  <View
                                    className={styles.replyGroupBadge}
                                    style={{ backgroundColor: `${AUDIENCE_MAP[aud].color}15`, color: AUDIENCE_MAP[aud].color }}
                                  >
                                    {AUDIENCE_MAP[aud].label}
                                  </View>
                                  <Text className={styles.replyGroupCount}>{repliesByAudience[aud].length}条</Text>
                                </View>
                                {repliesByAudience[aud].map((reply) => (
                                  <View key={reply.id} className={styles.replyItem}>
                                    <View className={styles.replyItemHeader}>
                                      <Text className={styles.replyItemTime}>{formatTime(reply.sentAt)}</Text>
                                      <Button
                                        className={styles.replyCopyBtn}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleCopyReply(reply);
                                        }}
                                      >
                                        📋 再次复制
                                      </Button>
                                    </View>
                                    <Text className={styles.replyItemContent} numberOfLines={3}>
                                      {reply.content}
                                    </Text>
                                  </View>
                                ))}
                              </View>
                            ) : null
                          )}
                        </View>
                      )}
                    </View>

                    <View className={styles.workbenchSection}>
                      <View className={styles.workbenchSectionHeader}>
                        <Text className={styles.workbenchSectionIcon}>📋</Text>
                        <Text className={styles.workbenchSectionTitle}>
                          待回收反馈
                          <Text className={styles.workbenchSectionCount}>（{clueTasks.length}项）</Text>
                        </Text>
                      </View>
                      {clueTasks.length === 0 ? (
                        <View className={styles.emptySubSection}>
                          <Text className={styles.emptySubText}>暂无派发任务，点击"派发核实"创建任务</Text>
                        </View>
                      ) : (
                        <View className={styles.taskListInWorkbench}>
                          {clueTasks.map((task) => (
                            <TaskItem key={task.id} task={task} showClueTitle={false} />
                          ))}
                        </View>
                      )}
                    </View>

                    <View className={styles.workbenchSection}>
                      <View className={styles.workbenchSectionHeader}>
                        <Text className={styles.workbenchSectionIcon}>🔄</Text>
                        <Text className={styles.workbenchSectionTitle}>
                          处置时间线
                          <Text className={styles.workbenchSectionCount}>（最近{miniTimelineItems.length}条）</Text>
                        </Text>
                      </View>
                      <View className={styles.miniTimeline}>
                        {miniTimelineItems.length === 0 ? (
                          <View className={styles.emptySubSection}>
                            <Text className={styles.emptySubText}>暂无处置记录</Text>
                          </View>
                        ) : (
                          miniTimelineItems.map((item) => (
                            <View key={item.id} className={styles.miniTimelineItem}>
                              <View className={styles.miniTimelineDot} />
                              <View className={styles.miniTimelineContent}>
                                <View className={styles.miniTimelineHeader}>
                                  <Text className={styles.miniTimelineAction}>{item.action}</Text>
                                  <Text className={styles.miniTimelineTime}>{formatTime(item.time)}</Text>
                                </View>
                                {item.note && (
                                  <Text className={styles.miniTimelineNote} numberOfLines={2}>{item.note}</Text>
                                )}
                              </View>
                            </View>
                          ))
                        )}
                      </View>
                    </View>

                    <View className={styles.workbenchSection}>
                      <View className={styles.workbenchSectionHeader}>
                        <Text className={styles.workbenchSectionIcon}>✅</Text>
                        <Text className={styles.workbenchSectionTitle}>闭环管理</Text>
                      </View>
                      <View className={styles.closureButtons}>
                        <Button
                          className={classnames(styles.closureBtn, styles.closureBtnReplied)}
                          disabled={clue.status === 'replied' || clue.status === 'archived'}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkReplied(clue);
                          }}
                        >
                          {clue.status === 'replied' || clue.status === 'archived' ? '✓ 已标记回复' : '📨 标记为已回复'}
                        </Button>
                        <Button
                          className={classnames(styles.closureBtn, styles.closureBtnArchived)}
                          disabled={clue.status === 'archived'}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkArchived(clue);
                          }}
                        >
                          {clue.status === 'archived' ? '✓ 已闭环' : '🎯 闭环归档'}
                        </Button>
                      </View>
                      <Button
                        className={classnames(styles.archiveBtn)}
                        disabled={clue.status === 'archived'}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleArchiveClue(clue.id);
                        }}
                      >
                        {clue.status === 'archived' ? '✓ 已完成归档' : '📦 一键归档（自动生成处置摘要）'}
                      </Button>
                      <View className={styles.closureHint}>
                        <Text className={styles.closureHintText}>
                          💡 建议流程：确认所有任务完成 → 标记为已回复 → 一键归档
                        </Text>
                      </View>
                    </View>
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
