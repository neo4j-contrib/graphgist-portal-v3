import { renderMathJax } from "./utils";
import { getUserProfile } from "../auth.js";

export const GraphGist = {
  my_perms: async (obj, args, context, info) => {
    try {
      const user = context.user;

      if (user && user.admin) {
        return ["edit", "delete", "admin"];
      }

      const profile = await getUserProfile(context.driver, user);
      if (profile && profile.uuid === obj.author.uuid) {
        return ["edit"];
      }
    } catch (error) {
      console.error(error);
    }

    return [];
  },
  raw_html: (obj, args, context, info) => {
    return renderMathJax(obj.raw_html);
  },
};

export const GraphGistCandidate = {
  my_perms: async (obj, args, context, info) => {
    try {
      const user = context.user;

      if (user && user.admin) {
        return ["edit", "delete", "admin"];
      }

      const profile = await getUserProfile(context.driver, user);
      if (profile && profile.uuid === obj.author.uuid) {
        return ["edit"];
      }
    } catch (error) {
      console.error(error);
    }

    return [];
  },
  raw_html: (obj, args, context, info) => {
    return renderMathJax(obj.raw_html);
  },
};

const Category = {
  num_graphgists: async (obj, args, context, info) => {
    const session = context.driver.session();
    return await session.readTransaction(async txc => {
      const result = await txc.run(`
        MATCH (c {uuid: $uuid})<-[:FOR_INDUSTRY|:FOR_USE_CASE|:FOR_CHALLENGE]-(g)
        RETURN count(g) AS num_graphgists
      `, {uuid: obj.num_graphgists.properties.uuid});
      return result.records[0].get('num_graphgists').low;
    });

  }
};

export const UseCase = Category;
export const Challenge = Category;
export const Industry = Category;
