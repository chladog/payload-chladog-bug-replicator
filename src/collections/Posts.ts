import { CollectionConfig } from 'payload/types';

const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    defaultColumns: ['title', 'author', 'category', 'tags', 'status'],
    useAsTitle: 'title',
  },
  access: {
    read: () => true,
  },
  hooks: {
    beforeChange: [
      ({ data, req: { user }, operation, originalDoc }) => {
        if (operation === "create") {
          Object.assign(data, { owner: user.id });
        }
        return data;
      },
    ],
    afterChange: [
      async ({ doc, req: { user, payload }, operation }) => {
        await payload.update({
          collection: 'users',
          id: user.id,
          data: {
            activePost: doc.id
          }
        });
        return doc;
      }
    ]
  },
  fields: [
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
    },
    
  ],
}

export default Posts;