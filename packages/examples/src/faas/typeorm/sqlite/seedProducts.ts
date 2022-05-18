import ds from '.';
import { Product } from 'src/baas/sqlite/entity/Product';


export const faas = async () => {
  const productRepo = ds.getRepository(Product);
  const p1 = productRepo.create({
    code: 'macbook16',
    name: '16英寸macbook',
    category: 'computer',
    manufacturer: 'Apple',
    saler: 'Apple Inc',
    listPrice: 27000,
  });
  await productRepo.save(p1);
}
