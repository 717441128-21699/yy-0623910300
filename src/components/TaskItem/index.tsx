import React, { useState } from 'react';
import { View, Text, Button, Input } from '@tarojs/components';
import Taro from '@tarojs/taro';
import type { Task } from '@/types';
import StatusBadge from '@/components/StatusBadge';
import TypeTag from '@/components/TypeTag';
import { formatDeadline, formatTime } from '@/utils';
import { useClueStore } from '@/store/useClueStore';
import styles from './index.module.scss';
import classnames from 'classnames';

interface TaskItemProps {
  task: Task;
  showClueTitle?: boolean;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, showClueTitle = true }) => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const updateTaskStatus = useClueStore((s) => s.updateTaskStatus);

  const deadlineInfo = formatDeadline(task.deadline);

  const handleConfirm = () => {
    updateTaskStatus(task.id, 'confirmed');
    Taro.showToast({ title: '已确认任务', icon: 'success' });
    console.log('[TaskItem] 确认任务:', task.id);
  };

  const handleComplete = () => {
    if (task.status === 'completed') return;
    if (!feedbackText.trim()) {
      setShowFeedback(true);
      return;
    }
    updateTaskStatus(task.id, 'completed', feedbackText);
    Taro.showToast({ title: '任务已完成', icon: 'success' });
    setShowFeedback(false);
    setFeedbackText('');
    console.log('[TaskItem] 完成任务:', task.id);
  };

  const handleGoToClue = () => {
    Taro.navigateTo({ url: `/pages/detail/index?id=${task.clueId}` });
  };

  return (
    <View
      className={classnames(
        styles.card,
        deadlineInfo.isOverdue && styles.cardOverdue,
        deadlineInfo.isUrgent && !deadlineInfo.isOverdue && styles.cardUrgent
      )}
    >
      <View className={styles.header}>
        <View className={styles.leftInfo}>
          <TypeTag type="role" value={task.role} size="sm" />
          <Text className={styles.assignee}>{task.assignee}</Text>
        </View>
        <StatusBadge type="task" value={task.status} />
      </View>

      {showClueTitle && (
        <View className={styles.clueLink} onClick={handleGoToClue}>
          <Text className={styles.clueIcon}>📎</Text>
          <Text className={styles.clueTitle}>{task.clueTitle}</Text>
          <Text className={styles.arrow}>→</Text>
        </View>
      )}

      <Text className={styles.content}>{task.content}</Text>

      {task.feedback && (
        <View className={styles.feedbackBox}>
          <Text className={styles.feedbackLabel}>📝 反馈：</Text>
          <Text className={styles.feedbackText}>{task.feedback}</Text>
          {task.feedbackAt && (
            <Text className={styles.feedbackTime}>{formatTime(task.feedbackAt)}</Text>
          )}
        </View>
      )}

      <View className={styles.metaRow}>
        <View className={classnames(
          styles.deadline,
          deadlineInfo.isOverdue && styles.deadlineOverdue,
          deadlineInfo.isUrgent && !deadlineInfo.isOverdue && styles.deadlineUrgent
        )}>
          <Text className={styles.deadlineIcon}>⏰</Text>
          <Text className={styles.deadlineText}>{deadlineInfo.text}</Text>
        </View>
        <Text className={styles.createTime}>创建 {formatTime(task.createdAt)}</Text>
      </View>

      {showFeedback && (
        <View className={styles.feedbackForm}>
          <Input
            className={styles.feedbackInput}
            placeholder="请输入处理结果反馈..."
            value={feedbackText}
            onInput={(e) => setFeedbackText(e.detail.value)}
          />
          <View className={styles.feedbackActions}>
            <Button
              className={classnames(styles.btn, styles.btnCancel)}
              onClick={() => setShowFeedback(false)}
            >
              取消
            </Button>
            <Button
              className={classnames(styles.btn, styles.btnPrimary)}
              onClick={handleComplete}
            >
              提交并完成
            </Button>
          </View>
        </View>
      )}

      {task.status !== 'completed' && task.status !== 'overdue' && (
        <View className={styles.actions}>
          {task.status === 'pending' && (
            <Button
              className={classnames(styles.actionBtn, styles.actionConfirm)}
              onClick={handleConfirm}
            >
              ✓ 确认任务
            </Button>
          )}
          <Button
            className={classnames(styles.actionBtn, styles.actionDone)}
            onClick={() => setShowFeedback(true)}
          >
            {showFeedback ? '收起' : '✓ 标记完成'}
          </Button>
        </View>
      )}
    </View>
  );
};

export default TaskItem;
