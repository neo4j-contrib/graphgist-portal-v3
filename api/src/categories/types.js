const Category = {
  my_perms: async (obj, args, context, info) => {
    try {
      const user = context.user;

      if (user) {
        if (user.admin) {
          return ["edit", "delete", "admin"];
        }
      }
    } catch (error) {
      console.error(error);
    }

    return [];
  },
  num_graphgists: async (obj, args, context, info) => {
    const session = context.driver.session();
    return await session.readTransaction(async txc => {
      const result = await txc.run(`
        MATCH (c {uuid: $uuid})<-[:FOR_INDUSTRY|:FOR_USE_CASE|:FOR_CHALLENGE]-(g:GraphGist {status: 'live'})
        RETURN count(g) AS num_graphgists
      `, {uuid: obj.num_graphgists.properties.uuid});
      return result.records[0].get('num_graphgists').low;
    });

  }
};

export const UseCase = Category;
export const Challenge = Category;
export const Industry = Category;
