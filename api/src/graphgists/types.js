import { renderMathJax } from "./utils";

export const GraphGist = {
  my_perms: async (obj, args, context, info) => {
    try {
      const user = await context.user;

      if (user.admin) {
        return ["edit", "delete", "admin"];
      }

      if (user.uuid === obj.author.uuid) {
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
      const user = await context.user;

      if (user.admin) {
        return ["edit", "delete", "admin"];
      }

      if (user.uuid === obj.author.uuid) {
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
