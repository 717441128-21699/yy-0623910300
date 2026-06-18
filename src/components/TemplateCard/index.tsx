import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import type { ReplyTemplate } from '@/types';
import TypeTag from '@/components/TypeTag';
import { renderTemplate, copyToClipboard, formatTime } from '@/utils';
import styles from './index.module.scss';
import classnames from 'classnames';

interface TemplateCardProps {
  template: ReplyTemplate;
  onUse?: (template: ReplyTemplate) => void;
  onPreview?: (template: ReplyTemplate) => void;
  compact?: boolean;
  quickFill?: Record<string, string>;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onUse,
  onPreview,
  compact = false,
  quickFill
}) => {
  const previewContent = quickFill
    ? renderTemplate(template.content, quickFill)
    : template.content;

  const handleCopy = async () => {
    const success = await copyToClipboard(previewContent);
    if (success) {
      Taro.showToast({ title: '已复制到剪贴板', icon: 'success' });
    }
    console.log('[TemplateCard] 复制模板:', template.id);
  };

  const handleUse = () => {
    if (onUse) {
      onUse(template);
    } else {
      Taro.navigateTo({
        url: `/pages/template-edit/index?id=${template.id}`
      });
    }
  };

  const handlePreview = () => {
    if (onPreview) {
      onPreview(template);
    } else {
      handleCopy();
    }
  };

  return (
    <View className={classnames(styles.card, compact && styles.cardCompact)}>
      <View className={styles.header}>
        <View className={styles.tagsRow}>
          <TypeTag type="templateCategory" value={template.category} size="sm" />
          <TypeTag type="audience" value={template.audience} showIcon size="sm" />
        </View>
        <View className={styles.usageInfo}>
          <Text className={styles.usageCount}>🔥 {template.usageCount}次</Text>
        </View>
      </View>

      <Text className={styles.title}>{template.title}</Text>

      {!compact && (
        <View className={styles.previewBox}>
          <Text className={styles.previewText}>{previewContent}</Text>
        </View>
      )}

      <View className={styles.variablesRow}>
        <Text className={styles.variablesLabel}>变量：</Text>
        <View className={styles.variablesList}>
          {template.variables.map((v, i) => (
            <View key={i} className={styles.variableTag}>
              <Text className={styles.variableText}>{v}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.footer}>
        <Text className={styles.updateTime}>更新于 {formatTime(template.updatedAt)}</Text>
        <View className={styles.actions}>
          <Button
            className={classnames(styles.btn, styles.btnSecondary)}
            onClick={handlePreview}
          >
            {compact ? '📋 复制' : '👁 预览'}
          </Button>
          <Button
            className={classnames(styles.btn, styles.btnPrimary)}
            onClick={handleUse}
          >
            ✏️ 使用模板
          </Button>
        </View>
      </View>
    </View>
  );
};

export default TemplateCard;
