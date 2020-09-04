/*eslint eqeqeq: 0*/

export default function ($) {
  const mutate_event_stack = [
    {
      name: "width",
      handler: function (n) {
        var e = $(n);
        if (!e.data("mutate-width")) e.data("mutate-width", e.width());
        if (e.data("mutate-width") && e.width() != e.data("mutate-width")) {
          e.data("mutate-width", e.width());
          return true;
        }
        return false;
      },
    },
    {
      name: "height",
      handler: function (n) {
        var e = $(n);
        if (!e.data("mutate-height")) e.data("mutate-height", e.height());
        if (e.data("mutate-height") && e.height() != e.data("mutate-height")) {
          e.data("mutate-height", e.height());
          return true;
        }
      },
    },
    {
      name: "top",
      handler: function (n) {
        var e = $(n);
        if (!e.data("mutate-top")) e.data("mutate-top", e.css("top"));

        if (e.data("mutate-top") && e.css("top") != e.data("mutate-top")) {
          e.data("mutate-top", e.css("top"));
          return true;
        }
      },
    },
    {
      name: "bottom",
      handler: function (n) {
        var e = $(n);
        if (!e.data("mutate-bottom")) e.data("mutate-bottom", e.css("bottom"));

        if (
          e.data("mutate-bottom") &&
          e.css("bottom") != e.data("mutate-bottom")
        ) {
          e.data("mutate-bottom", e.css("bottom"));
          return true;
        }
      },
    },
    {
      name: "right",
      handler: function (n) {
        var e = $(n);
        if (!e.data("mutate-right")) e.data("mutate-right", e.css("right"));

        if (
          e.data("mutate-right") &&
          e.css("right") != e.data("mutate-right")
        ) {
          e.data("mutate-right", e.css("right"));
          return true;
        }
      },
    },
    {
      name: "left",
      handler: function (n) {
        var e = $(n);
        if (!e.data("mutate-left")) e.data("mutate-left", e.css("left"));

        if (e.data("mutate-left") && e.css("left") != e.data("mutate-left")) {
          e.data("mutate-left", e.css("left"));
          return true;
        }
      },
    },
    {
      name: "hide",
      handler: function (n) {
        var e = $(n);
        var isHidden = e.is(":hidden"),
          prevHidden =
            e.data("prev-hidden") == undefined
              ? isHidden
              : e.data("prev-hidden");
        e.data("prev-hidden", isHidden);
        if (isHidden && isHidden != prevHidden) {
          return true;
        }
      },
    },
    {
      name: "show",
      handler: function (n) {
        var e = $(n);
        var isVisible = e.is(":visible"),
          prevVisible =
            e.data("prev-visible") == undefined
              ? isVisible
              : e.data("prev-visible");
        e.data("prev-visible", isVisible);
        if (isVisible && isVisible != prevVisible) {
          return true;
        }
      },
    },
    {
      name: "scrollHeight",
      handler: function (n) {
        var e = $(n);
        if (!e.data("prev-scrollHeight"))
          e.data("prev-scrollHeight", e[0].scrollHeight);

        if (
          e.data("prev-scrollHeight") &&
          e[0].scrollHeight != e.data("prev-scrollHeight")
        ) {
          e.data("prev-scrollHeight", e[0].scrollHeight);
          return true;
        }
      },
    },
    {
      name: "scrollWidth",
      handler: function (n) {
        var e = $(n);
        if (!e.data("prev-scrollWidth"))
          e.data("prev-scrollWidth", e[0].scrollWidth);

        if (
          e.data("prev-scrollWidth") &&
          e[0].scrollWidth != e.data("prev-scrollWidth")
        ) {
          e.data("prev-scrollWidth", e[0].scrollWidth);
          return true;
        }
      },
    },
    {
      name: "scrollTop",
      handler: function (n) {
        var e = $(n);
        if (!e.data("prev-scrollTop"))
          e.data("prev-scrollTop", e[0].scrollTop());

        if (
          e.data("prev-scrollTop") &&
          e[0].scrollTop() != e.data("prev-scrollTop")
        ) {
          e.data("prev-scrollTop", e[0].scrollTop());
          return true;
        }
      },
    },
    {
      name: "scrollLeft",
      handler: function (n) {
        var e = $(n);
        if (!e.data("prev-scrollLeft"))
          e.data("prev-scrollLeft", e[0].scrollLeft());

        if (
          e.data("prev-scrollLeft") &&
          e[0].scrollLeft() != e.data("prev-scrollLeft")
        ) {
          e.data("prev-scrollLeft", e[0].scrollLeft());
          return true;
        }
      },
    },
  ];

  return mutate_event_stack;
}
