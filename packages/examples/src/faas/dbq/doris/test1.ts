import db from '.';

export const faas = async () => {
  return await db.query('select now() as now')
  return db.query('select * from saas2022_dat.wpabsall LIMIT 2 ')
  return db.query(`select b.inventroname,count(*) count from saas2022_dat.wpabsall a group by b.inventroname order by count desc`)
  return db.query(`select b.inventroname,count(*) count from saas2022_dat.wpabsall a join liukai.cn_patent2022_v2_inventroname b on a.pubnumber = b.pubnumber where esquery(a.applicantnamest,'{
    "match_phrase":{
    "applicantnamest":"刘建"}
    }') group by b.inventroname order by count desc;`)
}
