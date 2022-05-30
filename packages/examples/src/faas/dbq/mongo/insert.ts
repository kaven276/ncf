import db from '.';

export const faas = async () => {
  const userCollection = db.collection('user');
  const results = await userCollection.insertMany([
    {
      name: 'LiYong',
      role: 'father',
    },
    {
      name: 'Li Yuze',
      role: 'son'
    },
    {
      name: 'Li Xinyan',
      role: 'daughter'
    }
  ]);
  return results;
}
