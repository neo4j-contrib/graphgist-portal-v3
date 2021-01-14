import { renderMathJax } from "./utils";
import { getUserProfile } from "../auth.js";

export const GraphGist = {
  my_perms: async (obj, args, context, info) => {
    try {
      const user = context.user;

      if (user) {
        if (user.admin) {
          return ["edit", "delete", "admin"];
        }

        const profile = await getUserProfile(context.driver, user);
        if (profile && profile.uuid === obj.author.uuid) {
          return ["edit"];
        }
      }
    } catch (error) {
      console.error(error);
    }

    return [];
  },
  raw_html: (obj, args, context, info) => {
    return renderMathJax(obj.raw_html);
  },
  my_rating: async (obj, args, context, info) => {
    const session = context.driver.session();
    const current_user = context.user;

    if (!current_user || !current_user.uuid) {
      return null;
    }

    const rating = await session.readTransaction(async txc => {
      const asset_result = await txc.run(
        `
        MATCH (a {uuid: $to})<-[r:RATES]-(u:User {uuid: $user})
        RETURN r
      `, { to: obj.uuid, user: current_user.uuid }
      );
      const rate = asset_result.records[0];
      if (rate) {
        return rate.get("r").properties;
      }
    });

    return rating;
  }
};

export const GraphGistCandidate = {
  my_perms: async (obj, args, context, info) => {
    try {
      const user = context.user;

      if (user) {
        if (user.admin) {
          return ["edit", "delete", "admin"];
        }

        const profile = await getUserProfile(context.driver, user);
        if (profile && profile.uuid === obj.author.uuid) {
          return ["edit"];
        }
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
