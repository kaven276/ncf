/** 允许根据开发生产环境区分分别引用不同版本的 js */
const isDev = process.env.NODE_ENV === 'development';
const path = require('path');
const currApp = path.basename(process.cwd());
console.log(currApp);
const isAntd3 = process.env.isAntd3 ?? [
  'enncloud-portal',
  'enncloud-ucenter',
  'enncloud-bss',
  'enncloud-oss',
  'enncloud-cmp',
  'enncloud-others'
].includes(currApp);
const isImmutable4 = currApp === 'enncloud-cmp';

// 【 请特别注意！！！】  有增加或改变 js src 时，
// 需要运行 fetch_script.mjs 重新生成 npm 目录，
// 并“添加”模式复制到 icon 工程 npm 目录下
/** 各个 npm 包的 CDN url path 部分的配置，及其 script.integity 值，需要不断完善 */
exports.externalsSrcConfigMaker = ({ isDev, isAntd3, isImmutable4 }) => ({
  'react': isDev ? {
    src: 'react@17.0.2/umd/react.development.js',
    integrity: 'sha256-QoQkvFHtz5oCOcl2oGlRo0NnSv5iAC8rMtEUDx31wCQ=',
  } : {
    src: 'react@17.0.2/umd/react.production.min.js',
    integrity: 'sha256-Ipu/TQ50iCCVZBUsZyNJfxrDk0E2yhaEIz0vqI+kFG8=',
  },
  'react-dom': isDev ? {
    src: 'react-dom@17.0.2/umd/react-dom.development.js',
    integrity: 'sha256-SxURW871LR4j9t5iZ7x9lieLlmxT4XsmJKUSeaLe3wE=',
  } : {
    src: 'react-dom@17.0.2/umd/react-dom.production.min.js',
    integrity: 'sha256-nbMykgB6tsOFJ7OdVmPpdqMFVk4ZsqWocT6issAPUF0=',
  },
  'lodash': {
    src: 'lodash@4.17.21/lodash.min.js',
    integrity: 'sha256-qXBd/EfAdjOA2FGrGAG+b3YBn2tn5A6bhz+LSgYD96k=',
  },
  'mobx': {
    src: 'mobx@6.3.0/dist/mobx.umd.production.min.js',
    integrity: 'sha256-+ntaEASi+i02zxKZ976kwgW08E9pw7sPShvDvHb6qGs=',
  },
  'mobx-state-tree': {
    src: 'mobx-state-tree@5.0.1/dist/mobx-state-tree.umd.min.js',
    integrity: 'sha256-ZnnAvMBf17JF8c8w55VxzyabvNmkA0QbmWKJYrcUrZc=',
  },
  'mobx-react': {
    src: 'mobx-react-lite@3.2.0/dist/mobxreactlite.umd.production.min.js',
    integrity: 'sha256-DrQxYu4lW8N2vQKZsCE6pqkIRZdJJ3YZ1nDEsRiqlTE=',
  },
  'mobx-react-lite': {
    src: 'mobx-react-lite@3.2.0/dist/mobxreactlite.umd.production.min.js',
    integrity: 'sha256-DrQxYu4lW8N2vQKZsCE6pqkIRZdJJ3YZ1nDEsRiqlTE=',
  },
  'antd': isAntd3 ? {
    src: 'antd@3.26.20/dist/antd.min.js',
    integrity: 'sha256-f1q3md44YFzsxIK3QptrZ0mWUsTr3rWxy7ZAG+wK5DI=',
  } : {
    src: 'antd@4.18.4/dist/antd.min.js',
    integrity: 'sha256-EiB+xWpXChSb/sevah515qwh3XtW2P383EnY6E9f1CM=',
  },
  'moment': {
    src: 'moment@2.29.1/min/moment.min.js',
    integrity: 'sha256-c95CVJWVMOTR2b7FhjeRhPlrSVPaz5zV5eK917/s7vc=',
  },
  'immutable': isImmutable4 ? {
    src: 'immutable@4.0.0-rc.12/dist/immutable.min.js',
    integrity: 'sha256-2c5eQW1HkxjqEKN6dj1RihWLh9GZP48aoG4u7FSZg3o=',
  } : {
    src: 'immutable@3.8.2/dist/immutable.min.js',
    integrity: 'sha256-+0IwgnFxUKpHZPXBhTQkuv+Dqy0eDno7myZB6OOjORA=',
  },
  'jsencrypt': {
    src: 'jsencrypt@3.2.1/bin/jsencrypt.min.js',
    integrity: 'sha256-BEIJbRFpY6iG+W6xAWA40Bp5h5socHW2cM8t4+tUj14=',
  },
  '@antv/g2': {
    src: '@antv/g2@4.1.16/dist/g2.min.js',
    integrity: 'sha256-HxJ52UF3HK4nMQhv/fIuEq3xxedeiF9+kLRijIp8sLw=',
  },
  'braft-editor': {
    src: 'braft-editor@2.3.9/dist/index.js',
    integrity: 'sha256-yl/5XOM0tu+4fhYwNNUFPpyx9+s9/GSvpzntzsYIDDQ=',
  },
  'markdown-it': {
    src: 'markdown-it@12.0.6/dist/markdown-it.min.js',
    integrity: 'sha256-mkusANAsHSTrjUlaSCtZbvJshVW2tZrPGQsuoDQ8eKc=',
  },
  'wangeditor': {
    src: 'wangeditor@4.6.17/dist/wangEditor.min.js',
    integrity: 'sha256-UNDjwcFR2LgFWUNQYS9I0LwpgSVaOnWO48VsY7n/bFw=',
  },
  'echarts': {
    src: 'echarts@5.0.2/dist/echarts.min.js',
    integrity: 'sha256-NZlQFkif+Cpc0rqEGGpSmaU55Vw4aMWK5KC3BRACd/Q=',
  },
  'react-ace': {
    src: 'react-ace@9.4.0/dist/react-ace.min.js/main.js',
    integrity: 'sha256-nSPdOhx/2gjyvST71nqh1Yseqr77228/FM8Cgy1t1J4='
  },
  'vis-network': {
    src: 'vis-network@8.5.6/peer/umd/vis-network.min.js',
    integrity: 'sha256-h4I6C9jQDb4bRnW6WKHyaMIA6ZQLbpXe0kbw1PkzuhA='
  }
});

exports.externalsSrcConfig = exports.externalsSrcConfigMaker({ isDev, isAntd3, isImmutable4 });

/** 每个 npm 包通过 externals 导入后的 global 变量名配置 */
exports.globalNameMap = {
  'lodash': '_',
  'react': 'React',
  'react-dom': 'ReactDOM',
  'moment': 'moment',
  'immutable': 'Immutable',
  'antd': 'antd',
  // '@ant-design/icons': '', // 需要进一步分析， 先补上externals
  'mobx': 'mobx',
  'mobx-react': 'mobxReactLite',
  'mobx-react-lite': 'mobxReactLite',
  'mobx-state-tree': 'mobxStateTree',
  'jsencrypt': 'JSEncrypt',
  'echarts': 'echarts',
  '@antv/g2': 'G2',
  // 'braft-editor': '', // 不确定 变量名称
  'markdown-it': 'markdownit',
  'wangeditor': 'wangEditor',
  // 'react-ace':'', // 不确定 变量名称
  'vis-network': 'vis'
}

/** 各个 npm 包的依赖关系描述  */
exports.orderDepConfig = {
  'react-dom': ['react'],
  'antd': ['react', 'react-dom', 'moment'],
  '@antv/g2': ['react', 'react-dom'],
  'mobx-state-tree': ['mobx'],
  'mst-middlewares': ['mobx-state-tree'],
  'mobx-react': ['react', 'mobx', 'react-dom'],
  'mobx-react-lite': ['react', 'mobx', 'react-dom'],
}