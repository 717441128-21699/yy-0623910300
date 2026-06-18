import React, { useMemo } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro, { useRouter, useDidShow } from '@tarojs/taro';
import StatusBadge from '@/components/StatusBadge';
import TypeTag from '@/components/TypeTag';
import TaskItem from '@/components/TaskItem';
import { useClueStore } from '@/store/useClueStore';
import { formatFullTime, timeFromNow } from '@/utils';
import styles from './index.module.scss';

const DetailPage: React.FC = () => {
  const router = useRouter();
  const clueId = router.params.id || '';
  const getClueById = useClueStore((s) => s.getClueById);
  const getTasksByClueId = useClueStore((s) => s.getTasksByClueId);
  const updateClueStatus = useClueStore((s) => s.updateClueStatus);
  const clues = useClueStore((s) => s.clues);

  const clue = useMemo(() => getClueById(clueId), [clueId, clues]);
  const tasks = useMemo(() => getTasksByClueId(clueId), [clueId]);

  const handleAddTask = () => {
    Taro.showToast({ title: '功能开发中', icon: 'none' });
  };

  const handleGoReply = () => {
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

        <View className={styles.tasksSection}>
          <Text className={styles.sectionTitle}>协同任务（{tasks.length}项）</Text>
          {tasks.length === 0 ? (
            <View className={styles.emptyHint}>
              <Text className={styles.emptyIcon}>📋</Text>
              <Text className={styles.emptyText}>暂无协同任务</Text>
            </View>
          ) : (
            tasks.map((task) => (
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
        <Button className={`${styles.btn} ${styles.btnSecondary}`} onClick={handleAddTask}>
          + 派发任务
        </Button>
        <Button className={`${styles.btn} ${styles.btnSecondary}`} onClick={handleChangeStatus}>
          变更状态
        </Button>
        <Button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleGoReply}>
          生成回复
        </Button>
      </View>
    </View>
  );
};

export default DetailPage;
