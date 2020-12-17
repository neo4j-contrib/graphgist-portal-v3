import { renderMathJax } from "./utils";
import { getUserProfile } from "../auth.js";

export const GraphGist = {
  my_perms: async (obj, args, context, info) => {
    try {
      const user = context.user;

      if (user.admin) {
        return ["edit", "delete", "admin"];
      }

      const profile = await getUserProfile(context.driver, user);
      if (profile.uuid === obj.author.uuid) {
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

      if (user.admin) {
        return ["edit", "delete", "admin"];
      }

      const profile = await getUserProfile(context.driver, user);
      if (profile.uuid === obj.author.uuid) {
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
