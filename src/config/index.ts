/*
 * @Version    : v1.00
 * @Author     : itchaox
 * @Date       : 2023-12-10 11:10
 * @LastAuthor : itchaox
 * @LastTime   : 2023-12-10 11:23
 * @desc       : 区分环境变量
 */
let BASE_URL = '';
if (import.meta.env.PROD) {
  // 生产环境
  BASE_URL = 'https://open.feishu.cn';
} else {
  // 开发环境
  BASE_URL = '/api';
}

export { BASE_URL };
