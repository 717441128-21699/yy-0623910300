import React, { useEffect } from 'react';
import { useDidShow, useDidHide } from '@tarojs/taro';
import { useClueStore } from '@/store/useClueStore';
import './app.scss';

function App(props) {
  const hydrateFromStorage = useClueStore((s) => s.hydrateFromStorage);

  useEffect(() => {
    hydrateFromStorage();
    console.log('[App] 应用启动，已加载本地存储数据');
  }, [hydrateFromStorage]);

  useDidShow(() => {
    hydrateFromStorage();
  });

  useDidHide(() => {});

  return props.children;
}

export default App;
