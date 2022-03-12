import { marked } from "marked";

const markedOptions = ({
  renderer: new marked.Renderer(),
  pedantic: false,
  gfm: true,
  tables: true,
  breaks: false,
  sanitize: false,
  smartLists: true,
  smartypants: false,
  xhtml: false,
});

export function loadMarkdown(text: string) {
  const lexer = new marked.Lexer(markedOptions);
  const tokens = lexer.lex(text);
  // console.log(tokens);
  const table = tokens.filter(item => item.type === 'table')[0];
  console.dir(table);
  //@ts-ignore
  const header = table.header.map((v: any) => {
    const vv = v.text.split(':');
    return {
      key: vv[0],
      type: vv[1],
    };
  });
  //@ts-ignore
  const data = table.rows.map(row => row.reduce((obj, col, idx) => {
    console.log(idx, col);
    const hc = header[idx];
    obj[hc.key] = (hc.type && hc.type.startsWith('num')) ? Number(col.text) : col.text;
    return obj;
  }, {}));
  return data;
}
