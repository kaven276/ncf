const ut = $('.users_table');
// console.dir(t);
ut.click((e) => {
  console.dir(e);
  console.info('table clicked ' + e.currentTarget.id)
})
