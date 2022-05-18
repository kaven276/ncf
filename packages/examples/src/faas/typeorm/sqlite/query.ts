import ds from '.';
import { Product } from 'src/baas/sqlite/entity/Product';

export const faas = async () => {
  const productRepo = ds.getRepository(Product);
  const result = await productRepo.find({
    select: {
      name: true,
      listPrice: true,
    }
  });
  return result;
}
