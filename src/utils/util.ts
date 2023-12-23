/*
 * @Version    : v1.00
 * @Author     : itchaox
 * @Date       : 2023-12-16 10:45
 * @LastAuthor : itchaox
 * @LastTime   : 2023-12-16 10:45
 * @desc       :
 */

export const setThemeColor = () => {
  const el = document.documentElement;
  const main = document.querySelector('main');

  const themeStyles = {
    LIGHT: {
      '--el-color-primary': 'rgb(20, 86, 240)',
      '--el-bg-color': '#fff',
      '--el-border-color-lighter': '#dee0e3',
      '--el-fill-color-light': '#f5f7fa',
      '--el-fill-color-blank': '#fff',
      '--el-text-color-primary': '#303133',
      '--el-button-text-color': '#434343',
      '--el-text-color-regular': '#434343',
      '--el-mask-color': '#f5f6f7',
      '--el-bg-color-overlay': '#fff',
      color: '#434343',
      'background-color': '#fff',
    },
    DARK: {
      '--el-color-primary': '#4571e1',
      '--el-bg-color': '#252525',
      '--el-border-color-lighter': '#434343',
      '--el-fill-color-light': '#434343',
      '--el-fill-color-blank': '#434343',
      '--el-text-color-primary': '#fff',
      '--el-button-text-color': '#fff',
      '--el-text-color-regular': '#fff',
      '--el-mask-color': '#434343',
      '--el-bg-color-overlay': '#303133',
      color: '#fff',
      'background-color': '#1d1d1d',
    },
  };

  const currentThemeStyles = themeStyles[theme.value];

  // 设置样式变量
  Object.entries(currentThemeStyles).forEach(([property, value]) => {
    el.style.setProperty(property, value);
  });

  // 设置其他样式
  main.style.backgroundColor = currentThemeStyles['background-color'];

  // 设置文本颜色
  const themeViewTextColorElements = document.querySelectorAll('.theme-view-text-color');
  themeViewTextColorElements.forEach((element) => {
    element.style.color = currentThemeStyles.color;
  });
};
