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
  const [showProgress, setShowProgress] = useState(false);
  const [progressText, setProgressText] = useState('');
  const updateTaskStatus = useClueStore((s) => s.updateTaskStatus);

  const deadlineInfo = formatDeadline(task.deadline);

  const handleConfirm = () => {
    updateTaskStatus(task.id, 'confirmed');
    Taro.showToast({ title: '已确认任务', icon: 'success' });
    console.log('[TaskItem] 确认任务:', task.id);
  };

  const handleProgress = () => {
    if (!progressText.trim()) {
      setShowProgress(true);
      return;
    }
    updateTaskStatus(task.id, 'confirmed', progressText);
    Taro.showToast({ title: '进展已保存', icon: 'success' });
    setShowProgress(false);
    setProgressText('');
    console.log('[TaskItem] 填写进展:', task.id);
  };

  const handleComplete = () => {
    if (task.status === 'completed') return;
    const completeFeedback = feedbackText.trim() || task.feedback || '';
    if (!completeFeedback) {
      setShowFeedback(true);
      return;
    }
    updateTaskStatus(task.id, 'completed', completeFeedback);
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

      {task.feedback && task.status !== 'completed' && (
        <View className={styles.progressBox}>
          <Text className={styles.progressLabel}>🔄 进展更新：</Text>
          <Text className={styles.progressText}>{task.feedback}</Text>
          {task.feedbackAt && (
            <Text className={styles.progressTime}>{formatTime(task.feedbackAt)}</Text>
          )}
        </View>
      )}

      {task.feedback && task.status === 'completed' && (
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

      {showProgress && (
        <View className={styles.feedbackForm}>
          <Input
            className={styles.feedbackInput}
            placeholder="请输入进展内容..."
            value={progressText}
            onInput={(e) => setProgressText(e.detail.value)}
          />
          <View className={styles.feedbackActions}>
            <Button
              className={classnames(styles.btn, styles.btnCancel)}
              onClick={() => setShowProgress(false)}
            >
              取消
            </Button>
            <Button
              className={classnames(styles.btn, styles.btnProgress)}
              onClick={handleProgress}
            >
              保存进展
            </Button>
          </View>
        </View>
      )}

      {showFeedback && (
        <View className={styles.feedbackForm}>
          <Input
            className={styles.feedbackInput}
            placeholder={task.feedback ? '可编辑完成反馈（默认使用进展内容）...' : '请输入处理结果反馈...'}
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
          {task.status === 'confirmed' && (
            <Button
              className={classnames(styles.actionBtn, styles.actionProgress)}
              onClick={() => setShowProgress(true)}
            >
              📝 填写进展
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
