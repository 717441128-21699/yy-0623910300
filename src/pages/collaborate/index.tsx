import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import TaskItem from '@/components/TaskItem';
import { useClueStore } from '@/store/useClueStore';
import { ROLE_MAP } from '@/types';
import type { RoleType } from '@/types';
import styles from './index.module.scss';
import classnames from 'classnames';

type TabKey = 'all' | 'pending' | 'confirmed' | 'completed' | 'overdue';

const CollaboratePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [selectedRole, setSelectedRole] = useState<RoleType | 'all'>('all');
  const tasks = useClueStore((s) => s.tasks);

  const taskCounts = useMemo(() => {
    const pending = tasks.filter((t) => t.status === 'pending').length;
    const confirmed = tasks.filter((t) => t.status === 'confirmed').length;
    const completed = tasks.filter((t) => t.status === 'completed').length;
    const overdue = tasks.filter((t) => t.status === 'overdue').length;
    return { pending, confirmed, completed, overdue, total: tasks.length };
  }, [tasks]);

  const roleList: { key: RoleType | 'all'; icon: string; name: string }[] = [
    { key: 'all', icon: '👥', name: '全部角色' },
    { key: 'security', icon: '🛡️', name: ROLE_MAP.security.label },
    { key: 'logistics', icon: '🔧', name: ROLE_MAP.logistics.label },
    { key: 'counselor', icon: '💙', name: ROLE_MAP.counselor.label },
    { key: 'academic', icon: '📚', name: ROLE_MAP.academic.label },
    { key: 'propaganda', icon: '📢', name: ROLE_MAP.propaganda.label },
    { key: 'dorm_admin', icon: '🏠', name: ROLE_MAP.dorm_admin.label },
    { key: 'canteen_admin', icon: '🍽️', name: ROLE_MAP.canteen_admin.label },
    { key: 'leader', icon: '👔', name: ROLE_MAP.leader.label }
  ];

  const getRoleCount = (role: RoleType | 'all') => {
    if (role === 'all') return tasks.length;
    return tasks.filter((t) => t.role === role).length;
  };

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        if (activeTab !== 'all' && t.status !== activeTab) return false;
        if (selectedRole !== 'all' && t.role !== selectedRole) return false;
        return true;
      })
      .sort((a, b) => {
        const statusPriority = { overdue: 0, pending: 1, confirmed: 2, completed: 3 };
        if (statusPriority[a.status] !== statusPriority[b.status]) {
          return statusPriority[a.status] - statusPriority[b.status];
        }
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      });
  }, [tasks, activeTab, selectedRole]);

  const tabOptions: { key: TabKey; label: string; count?: number }[] = [
    { key: 'all', label: '全部' },
    { key: 'pending', label: '待确认', count: taskCounts.pending },
    { key: 'confirmed', label: '处理中', count: taskCounts.confirmed },
    { key: 'completed', label: '已完成', count: taskCounts.completed }
  ];

  useDidShow(() => {
    console.log('[CollaboratePage] 页面显示，任务总数:', tasks.length);
  });

  return (
    <ScrollView
      className={styles.page}
      scrollY
      refresherEnabled
      onRefresherrefresh={() => {
        Taro.showToast({ title: '刷新成功', icon: 'success' });
        setTimeout(() => Taro.stopPullDownRefresh(), 500);
      }}
    >
      <View className={styles.headerSection}>
        <View className={styles.summaryCard}>
          <Text className={styles.summaryTitle}>任务协同总览</Text>
          <View className={styles.summaryGrid}>
            <View className={styles.summaryItem}>
              <Text className={styles.summaryValue}>{taskCounts.pending + taskCounts.confirmed}</Text>
              <Text className={styles.summaryLabel}>待处理</Text>
            </View>
            <View className={styles.summaryItem}>
              <Text className={styles.summaryValue}>{taskCounts.completed}</Text>
              <Text className={styles.summaryLabel}>已完成</Text>
            </View>
            <View className={styles.summaryItem}>
              <Text className={styles.summaryValue}>{taskCounts.overdue}</Text>
              <Text className={styles.summaryLabel}>已超时</Text>
            </View>
          </View>
        </View>
      </View>

      <View className={styles.tabsSection}>
        <View className={styles.tabs}>
          {tabOptions.map((tab) => (
            <View
              key={tab.key}
              className={classnames(styles.tab, activeTab === tab.key && styles.active)}
              onClick={() => setActiveTab(tab.key)}
            >
              <Text className={styles.tabText}>
                {tab.label}
                {tab.count !== undefined && tab.count > 0 ? `(${tab.count})` : ''}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.roleSection}>
        <View className={styles.roleScroll}>
          {roleList.map((role) => (
            <View
              key={role.key}
              className={classnames(
                styles.roleCard,
                selectedRole === role.key && styles.active
              )}
              onClick={() => setSelectedRole(role.key)}
            >
              <View className={styles.roleIcon}>{role.icon}</View>
              <Text className={styles.roleName}>{role.name}</Text>
              <Text className={styles.roleCount}>{getRoleCount(role.key)} 项任务</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.listSection}>
        <View className={styles.sectionHeader}>
          <Text className={styles.sectionTitle}>任务列表</Text>
          <Text className={styles.sectionBadge}>
            {filteredTasks.length} 项待跟进
          </Text>
        </View>

        {activeTab === 'pending' && (
          <View className={styles.tipsCard}>
            <Text className={styles.tipsTitle}>💡 值班提示</Text>
            <Text className={styles.tipsText}>
              待确认任务请在30分钟内响应。紧急事件请电话联系责任人确认，避免延误处置时机。
            </Text>
          </View>
        )}

        {filteredTasks.length === 0 ? (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>✅</Text>
            <Text className={styles.emptyText}>
              暂无任务
              {'\n'}
              当前筛选条件下没有待处理事项
            </Text>
          </View>
        ) : (
          filteredTasks.map((task) => (
            <TaskItem key={task.id} task={task} showClueTitle />
          ))
        )}
      </View>
    </ScrollView>
  );
};

export default CollaboratePage;
