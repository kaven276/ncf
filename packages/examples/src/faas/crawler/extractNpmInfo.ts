import * as cheerio from 'cheerio';

const URL = 'https://www.npmjs.com/package/';

interface Request {
  pkgName: string,
}

/** 搜索指定 npm 包的 npm 条目网页，提取其中的 meta 信息 */
export const faas = async (req: Request) => {
  req.pkgName = req.pkgName ?? 'lodash';
  const htmlText = await fetch(URL + req.pkgName).then(resp => resp.text());
  const $ = cheerio.load(htmlText);
  const downloads = $('p.f4.tl.flex-auto.fw6.black-80.ma0.pr2.pb1').text();
  const version = $('p.f2874b88.fw6.mb3.mt2.truncate.black-80.f4').first().text();
  const license = $('p.f2874b88.fw6.mb3.mt2.truncate.black-80.f4').eq(1).text();
  return { package: req.pkgName, downloads, version, license };
}
