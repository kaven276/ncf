(function () {
  const env = Object.assign({}, window.envConfig, window.envOverride || {});
  const ICON_URL = env.ICON_URL || 'https://icon.xxx.cn';
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = `${ICON_URL}/iconfont.css`;
  document.head.appendChild(link);

  const link2 = document.createElement('link');
  link2.rel = 'icon';
  link2.type = 'image/x-icon';
  link2.href = `${ICON_URL}/favicon/favicon.ico`;
  document.head.appendChild(link2);

  const script = document.createElement('script');
  script.defer = true;
  script.src = `${ICON_URL}/iconfont.js`;
  document.head.appendChild(script);

  const style = document.createElement('style');
  style.innerHTML = `.logo-image{background-image:url(${ICON_URL}/logo/fe/logo_common.png) !important}`

  document.head.appendChild(style);
})();
