import React, { useState } from 'react';
import { View, Text, Input, Textarea, Button } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { EVENT_TYPE_MAP, SOURCE_MAP, URGENT_MAP } from '@/types';
import type { EventType, ClueSource, UrgentLevel } from '@/types';
import { useClueStore } from '@/store/useClueStore';
import styles from './index.module.scss';
import classnames from 'classnames';

const CreatePage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState<EventType>('dorm');
  const [source, setSource] = useState<ClueSource>('group');
  const [urgentLevel, setUrgentLevel] = useState<UrgentLevel>('medium');
  const [location, setLocation] = useState('');
  const [involvedCount, setInvolvedCount] = useState('');
  const addClue = useClueStore((s) => s.addClue);

  const eventTypeOptions = Object.entries(EVENT_TYPE_MAP).map(([k, v]) => ({
    key: k as EventType,
    label: v.label,
    color: v.color
  }));

  const sourceOptions = Object.entries(SOURCE_MAP).map(([k, v]) => ({
    key: k as ClueSource,
    label: v.label
  }));

  const urgentOptions: { key: UrgentLevel; label: string; color: string }[] = [
    { key: 'high', label: URGENT_MAP.high.label, color: '#E5484D' },
    { key: 'medium', label: URGENT_MAP.medium.label, color: '#F5A623' },
    { key: 'low', label: URGENT_MAP.low.label, color: '#718096' }
  ];

  const handleCancel = () => {
    Taro.navigateBack();
  };

  const handleSave = () => {
    if (!title.trim()) {
      Taro.showToast({ title: '请输入线索标题', icon: 'none' });
      return;
    }
    if (!description.trim()) {
      Taro.showToast({ title: '请输入事件描述', icon: 'none' });
      return;
    }
    const newClue = addClue({
      title: title.trim(),
      description: description.trim(),
      eventType,
      source,
      urgentLevel,
      location: location.trim() || undefined,
      involvedCount: involvedCount ? parseInt(involvedCount, 10) || 0 : undefined
    });
    Taro.showToast({ title: '线索登记成功', icon: 'success' });
    console.log('[CreatePage] 登记新线索:', title);
    setTimeout(() => {
      Taro.redirectTo({
        url: `/pages/detail/index?id=${newClue.id}`
      });
    }, 800);
  };

  const handleSaveAndDispatch = () => {
    handleSave();
  };

  useDidShow(() => {
    console.log('[CreatePage] 页面显示');
  });

  return (
    <View className={styles.page}>
      <View className={styles.content}>
        <View className={styles.tipsCard}>
          <Text className={styles.tipsTitle}>💡 快速登记指引</Text>
          <Text className={styles.tipsText}>
            请简要描述事件经过，标注清楚事件类型和来源渠道。
            如涉及学生人身安全，请直接标记为"紧急"。
          </Text>
        </View>

        <View className={styles.formCard}>
          <Text className={styles.sectionTitle}>基本信息</Text>

          <View className={styles.formGroup}>
            <Text className={styles.formLabel}>
              线索标题<Text className={styles.required}>*</Text>
            </Text>
            <Input
              className={styles.formInput}
              placeholder="请输入事件标题，如：3号楼空调漏水严重"
              value={title}
              onInput={(e) => setTitle(e.detail.value)}
              maxlength={60}
            />
          </View>

          <View className={styles.formGroup}>
            <Text className={styles.formLabel}>
              事件描述<Text className={styles.required}>*</Text>
            </Text>
            <Textarea
              className={styles.formTextarea}
              placeholder="请详细描述事件经过、涉及人员、学生情绪等情况..."
              value={description}
              onInput={(e) => setDescription(e.detail.value)}
              maxlength={500}
            />
          </View>

          <View className={styles.formGroup}>
            <Text className={styles.formLabel}>
              事件类型<Text className={styles.required}>*</Text>
            </Text>
            <View className={styles.tagRow}>
              {eventTypeOptions.map((opt) => (
                <View
                  key={opt.key}
                  className={classnames(styles.tagItem, eventType === opt.key && styles.active)}
                  onClick={() => setEventType(opt.key)}
                >
                  <Text className={styles.tagText}>
                    <Text
                      className={styles.colorDot}
                      style={{ backgroundColor: opt.color }}
                    />
                    {opt.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View className={styles.formGroup}>
            <Text className={styles.formLabel}>
              信息来源<Text className={styles.required}>*</Text>
            </Text>
            <View className={styles.tagRow}>
              {sourceOptions.map((opt) => (
                <View
                  key={opt.key}
                  className={classnames(styles.tagItem, source === opt.key && styles.active)}
                  onClick={() => setSource(opt.key)}
                >
                  <Text className={styles.tagText}>{opt.label}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className={styles.formGroup}>
            <Text className={styles.formLabel}>
              紧急程度<Text className={styles.required}>*</Text>
            </Text>
            <View className={styles.tagRow}>
              {urgentOptions.map((opt) => (
                <View
                  key={opt.key}
                  className={classnames(styles.tagItem, urgentLevel === opt.key && styles.active)}
                  onClick={() => setUrgentLevel(opt.key)}
                >
                  <Text className={styles.tagText}>
                    <Text
                      className={styles.colorDot}
                      style={{ backgroundColor: opt.color }}
                    />
                    {opt.label}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View className={styles.formCard}>
          <Text className={styles.sectionTitle}>补充信息（选填）</Text>

          <View className={styles.formGroup}>
            <Text className={styles.formLabel}>涉及地点</Text>
            <Input
              className={styles.formInput}
              placeholder="如：3号学生宿舍楼、第二食堂一楼"
              value={location}
              onInput={(e) => setLocation(e.detail.value)}
              maxlength={50}
            />
          </View>

          <View className={styles.formGroup}>
            <Text className={styles.formLabel}>涉及人数（估算）</Text>
            <Input
              className={styles.formInput}
              type="number"
              placeholder="请输入涉及学生人数"
              value={involvedCount}
              onInput={(e) => setInvolvedCount(e.detail.value)}
            />
          </View>
        </View>
      </View>

      <View className={styles.bottomBar}>
        <Button
          className={`${styles.btn} ${styles.btnSecondary}`}
          onClick={handleCancel}
        >
          取消
        </Button>
        <Button
          className={`${styles.btn} ${styles.btnPrimary}`}
          onClick={handleSave}
        >
          保存线索
        </Button>
      </View>
    </View>
  );
};

export default CreatePage;
