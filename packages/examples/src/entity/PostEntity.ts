import { EntitySchema } from "typeorm";

export const PostEntity = new EntitySchema({
  name: "postentity",
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: true
    },
    title: {
      type: String
    },
    text: {
      type: String
    }
  },
});
