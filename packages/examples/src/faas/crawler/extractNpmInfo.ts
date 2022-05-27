import * as cheerio from 'cheerio';

const URL = 'https://www.npmjs.com/package/cheerio';

export const faas = async () => {
  const htmlText = await fetch(URL).then(resp => resp.text());
  const $ = cheerio.load(htmlText);
  const downloads = $('p.f4.tl.flex-auto.fw6.black-80.ma0.pr2.pb1').text();
  const version = $('p.f2874b88.fw6.mb3.mt2.truncate.black-80.f4').first().text();
  const license = $('p.f2874b88.fw6.mb3.mt2.truncate.black-80.f4').eq(1).text();
  return { downloads, version, license };
}
