export const User = {
  my_perms: async (obj, args, context, info) => {
    try {
      const user = context.user;

      if (user) {
        if (user.admin) {
          return ["review_candidates"];
        }
      }
    } catch (error) {
      console.error(error);
    }

    return [];
  },
};
