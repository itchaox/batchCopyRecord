/*
 * @Version    : v1.00
 * @Author     : itchaox
 * @Date       : 2023-12-24 08:12
 * @LastAuthor : itchaox
 * @LastTime   : 2023-12-24 08:12
 * @desc       :
 */

// useTheme.js

import { bitable } from '@lark-base-open/js-sdk';

export const useTheme = () => {
  const theme = ref('');

  const setThemeColor = () => {
    const el = document.documentElement;

    const themeStyles = {
      LIGHT: {
        '--el-color-primary': 'rgb(20, 86, 240)',
        '--el-bg-color': '#fff',
        '--el-border-color-lighter': '#dee0e3',
        // 其他样式...
      },
      DARK: {
        '--el-color-primary': '#4571e1',
        '--el-bg-color': '#252525',
        '--el-border-color-lighter': '#434343',
        // 其他样式...
      },
    };

    const currentThemeStyles = themeStyles[theme.value];

    // 设置样式变量
    Object.entries(currentThemeStyles).forEach(([property, value]) => {
      el.style.setProperty(property, value);
    });
  };

  onMounted(async () => {
    theme.value = await bitable.bridge.getTheme();
    setThemeColor();
  });

  bitable.bridge.onThemeChange((event) => {
    theme.value = event.data.theme;
    setThemeColor();
  });

  return {
    theme,
  };
};
