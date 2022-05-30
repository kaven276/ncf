import db from '.';

export const faas = async () => {
  const userCollection = db.collection('user');
  const results = await userCollection.find({
    role: 'father'
  }).toArray();
  return results;
}
