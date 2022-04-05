import { Category } from "src/entity/Category";
import { ServiceError } from '@ncf/microkernel';
import { getManager } from '.';

interface IRequest {
  add?: '1' | '2';
}

export const faas = async (req: IRequest) => {
  const m = await getManager();
  if (req.add === '1') {
    const c1 = new Category();
    c1.id = 1;
    c1.name = 'first';
    c1.description = 'first category';
    c1.level = 1;
    await m.save(c1);
  } else if (req.add === '2') {
    const c2 = new Category();
    c2.id = 2;
    c2.name = 'second';
    c2.description = 'second category';
    c2.level = 2;
    const c1 = (await m.findOneBy(Category, { id: 1 }))!;
    if (!c1) {
      return 'no c1';
    }
    c2.parent = c1;
    c2.level = c1.level + 1;
    await m.save(c2);
  } else {
    const c1 = (await m.findOne(Category, { where: { name: 'first' } }));
    console.log({ c1 });
    return c1;
  }
  return 'ok';
};

