export const generateShortCode = (url: string) => {
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    hash = (hash * 31 + url.charCodeAt(i)) & 0xffffffff;
  }
  const chars =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  let n = Math.abs(hash);
  for (let i = 0; i < 5; i++) {
    code += chars[n % 62];
    n = Math.floor(n / 62);
  }
  return code;
};
