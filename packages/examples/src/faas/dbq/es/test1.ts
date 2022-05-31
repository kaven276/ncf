import client from '.';

async function makeSeedData() {
  await client.index({
    index: 'game-of-thrones',
    document: {
      character: 'Ned Stark',
      quote: 'Winter is coming.'
    }
  })

  await client.index({
    index: 'game-of-thrones',
    document: {
      character: 'Daenerys Targaryen',
      quote: 'I am the blood of the dragon.'
    }
  })

  await client.index({
    index: 'game-of-thrones',
    document: {
      character: 'Tyrion Lannister',
      quote: 'A mind needs books like a sword needs a whetstone.'
    }
  })

  // here we are forcing an index refresh, otherwise we will not
  // get any result in the consequent search
  await client.indices.refresh({ index: 'game-of-thrones' })

}

interface Request {
  opType: 'insert' | 'query' | 'delete',
}

export const faas = async (req: Request) => {
  const opType = req.opType ?? 'query';
  // Let's search!
  if (opType === 'query') {
    return await client.search({
      index: 'game-of-thrones',
      query: {
        match: { quote: 'needs' }
      }
    });
  } else if (opType === 'delete') {
    return await client.deleteByQuery({
      index: 'game-of-thrones',
      query: {
        match: { quote: 'blood' }
      }
    });
  } else if (opType === 'insert') {
    return await makeSeedData();
  }
}
