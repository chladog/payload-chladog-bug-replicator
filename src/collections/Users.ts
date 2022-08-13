import { CollectionConfig } from 'payload/types';

const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
  },
  access: {
    read: () => true,
  },
  fields: [
    // Email added by default
    {
      name: 'name',
      type: 'text',
      localized: true
    },
    {
      name: "activePost",
      type: "relationship",
      relationTo: "posts",
      hasMany: false,
    },
  ],
};

export default Users;