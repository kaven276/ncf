const ut = $('.users2');
// console.dir(t);
ut.on('click', (e) => {
  // console.dir(e);
  console.info('table clicked ' + e.currentTarget.className)
});
