import { Photo, Post, Question } from "src/entity/Fusion";
import { getManager } from '..';

export const faas = async (req: any) => {
  const m = await getManager();
  if (req.action === 'create') {
    const photo = new Photo();
    photo.description = 'a photo';
    photo.title = 'The Cat';
    photo.size = '20M';
    await m.save(photo);
    const post = new Post();
    post.description = 'a post';
    post.title = 'Welcome to Tianjin';
    post.viewCount = 100;
    await m.save(post);
    const question = new Question();
    question.description = 'a question';
    question.title = 'what is NCF?';
    question.answersCount = 312;
    await m.save(question);
    return 'created';
  } else {
    return 'does nothing';
  }
};
