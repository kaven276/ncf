// 警告：本脚本不经过 webpack/babel 转移降低低版本js处理，要控制 js features 使用，确保在主流浏览器中能正常运行
// 用到的较现代的 web API 和 es 语法：Promise, =>, Map(QQ/Baidu浏览器不支持，不用了)

const externalsConfig = JSON.parse(window.$externalsInfo);
const externalsSrcConfig = externalsConfig.externalsSrc;
const orderDep = externalsConfig.orderDep;
const externalsArr = externalsConfig.externalsArr;

let prefix;

const timeTag = 'scripts load';
console.time(timeTag);
const bundlesArr = window.$bundles.split(',');

function loadScriptAsync(src, isBundle, integrity) {
  const script = document.createElement('script');
  script.type = 'text/javascript';
  if (isBundle) {
    script.defer = true;
  } else {
    script.async = true;
  }
  script.src = src;
  if (integrity) {
    // 下面不注释会报
    // Subresource Integrity: The resource '<URL>' has an integrity attribute,
    // but the resource requires the request to be CORS enabled to check the integrity, and it is not.
    // The resource has been blocked because the integrity cannot be enforced.
    // script.integrity = integrity;
  }
  return new Promise((resolve, reject) => {
    document.head.appendChild(script);
    script.onload = () => resolve(0);
    script.onerror = () => reject(1);
  });
}

function preload(href, cdn) {
  // <link rel="preload" href="/path/to/style.css" as="script">
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'script';
  link.href = href;
  let startTime = Date.now();
  return new Promise((resolve, reject) => {
    document.head.appendChild(link);
    link.onload = () => {
      resolve({ cdn: cdn, ms: Date.now() - startTime });
    };
    link.onerror = () => reject({ cdn: cdn });
  });
}

function loadStyle(url) {
  if (!url) return;
  const link = document.createElement('link');
  link.type = 'text/css';
  link.rel = 'stylesheet';
  link.href = url;
  return new Promise((resolve, reject) => {
    document.head.appendChild(link);
    link.onload = () => resolve(0);
    link.onerror = () => reject(1);
  });
}

// 只有生产构建才会有值
if (window.$styles) {
  const stylesArr = window.$styles.split(',');
  stylesArr.forEach(loadStyle);
}


// console.info('orderDep', orderDep);

// 保存各个 js 加载 promise
const state = {};
function loadExternalAsync(id) {
  // console.log('id =', id);
  const src = prefix + externalsSrcConfig[id].src;
  const integrity = externalsSrcConfig[id].integrity;
  const deps = orderDep[id] || [];
  // console.log('start', id);
  preload(src); // 全部依赖脚本上来全部 preload，不用管依赖关系
  const promise = Promise.all(deps.map(dep => state[dep])).then(() => loadScriptAsync(src, false, integrity));
  state[id] = promise;
  return promise;
}

// kick off loading
function loadAllScripts() {
  Promise.all(bundlesArr.map(preload));
  return Promise.all(externalsArr.map(loadExternalAsync)).then(() => {
    Promise.all(bundlesArr.map((src) => loadScriptAsync(src, true))).then(() => {
      console.log('all loaded !!!');
      console.timeEnd(timeTag);
      // 脚本加载完马上更新 loading 为加载完，免得误会以为是前端加载出问题
      const loadingDiv = document.getElementById('initLoading');
      if (loadingDiv) {
        loadingDiv.innerHTML = '<span>all scripts loaded</span>';
      }
    });
  });
}

const times = {};
const innerCDN = window.envConfig.ICON_URL ? (window.envConfig.ICON_URL + '/npm/') : '';
const cdnList = [
  innerCDN,
  'https://njr.xxx.cn/',
  'https://unpkg.com/',
  'https://cdn.jsdelivr.net/npm/',
].filter(Boolean);
// console.log(cdnList, cdnList.length);
// 测试新智云cdn，unpkg, jsdelivr 哪个可用，哪个最快，选出 prefix
function selectBest() {
  const firstExternal = externalsArr[0];
  return new Promise(resolve => {
    if (!firstExternal) {
      return resolve();
    }
    cdnList.forEach(cdn => preload(cdn + externalsSrcConfig[firstExternal].src, cdn).then((d) => {
      console.info(`${d.cdn} for ${firstExternal} use (${d.ms})ms`);
      if (!prefix) {
        console.info(`${d.cdn} (${d.ms})ms is the best cdn among all cdn list`);
        prefix = cdn;
        resolve();
      }
    }).catch((d) => {
      console.info(`${d.cdn} is unavailable !!!`);
    }));
  })
}

// 测试指定资源是否可用
function testUrl(id) {
  const prefixSaved = prefix;
  const stime = Date.now();
  const url = prefix + externalsSrcConfig[id].src;
  let timer = 0;
  const promise = new Promise((resolve, reject) => {
    function fail(reason, resp) {
      // console.log(`${url} failed (${reason})`, resp);
      reject(reason);
    }
    // 超过指定时长没响应都认为不可用
    // 比如 njr.xxx.cn 从香港服务，大陆访问慢，不做选择
    // 比如 cdn.jsdelivr.net 从国内访问从 2021 年底变慢，不做选择
    timer = setTimeout(() => fail('timeout'), 1000);
    fetch(url, {
      cache: 'reload',
      // mode: 'cors',
      // integrity: externalsSrcConfig[id].integrity, // 目的是测试 cdn 可用性，随机测试方式下没意义，注释
    }).then(resp => {
      if (!timer) return;
      // console.log(resp, resp.headers.get('content-type'));
      if (resp.headers.get('content-type') === 'text/html') {
        fail(`is text/html`, resp);
      }
      if (prefixSaved !== prefix) {
        return reject('cancel', resp);
      }
      if (resp.ok) {
        resp.text().then((text) => {
          if (text.length > 100) {
            // console.log(text.slice(0, 100));
            times[prefixSaved] = Date.now() - stime;
            resolve();
          } else {
            fail(`text() is small ${text.length}`, resp)
          }
        }).catch((e) => {
          // console.warn(e);
          fail('resp.text() failed');
        })
      } else {
        fail('resp.ok=false', resp);
      }
    }).catch(() => {
      fail('fetch failed');
    });
  });
  promise.catch(() => null).then(() => {
    clearTimeout(timer);
    timer = 0;
  });
  return promise;
}

// 按照 cdnList 顺序依次检测可用性(无缓存方式，随机)，列表中第一个可用的被选中
// 确保 njr.xxx.cn 为正式 cdn，其他 cdn 为备份 cdn.
// 测试选一个 js，不用浏览器本地缓存，模拟第一次访问。失败或者超过1s都认为不可用。
// 测试包含内容长度测试，防止服务返回 200 但是内容不是想要的 js 内容。
function selectFirstAvailable() {
  const testPath = externalsArr.find(path => path.match(/react\./)) || externalsArr[0];
  function testOne(i) {
    if (i >= cdnList.length) {
      console.log(times);
      if (times[innerCDN] > times['https://unpkg.com/']) {
        prefix = 'https://unpkg.com/'; // 如果测试 unpkg 更快，则选 unpkg
      } else {
        prefix = innerCDN; // 最终 fallback 到内网 js 服务
      }
      return Promise.resolve();
    }
    prefix = cdnList[i];
    // console.log(`try cdn ${i} ${prefix}`);
    // const idx = Math.floor(Math.random() * externalsArr.length);
    // const tasks = externalsArr.slice(idx, idx + 1).map(testUrl);
    // const tasks = externalsArr.map(testUrl);
    const tasks = [testPath].map(testUrl);
    return Promise.all(tasks).then(() => {
      console.warn(`try cdn ${i} ${prefix} succeed `);
      // throw new Error('fake'); // 打开注释模拟全部CDN失败，走最终 fallback 的逻辑
    }).catch(e => {
      // console.warn(e);
      console.warn(`try cdn ${i} ${prefix} failed `);
      return testOne(i + 1);
    });
  }
  return testOne(0);
}

selectFirstAvailable().then(loadAllScripts);
