import process from "node:process";
import { getThemeConfig } from "@sugarat/theme/node";
import type { Theme } from "@sugarat/theme";
import { defineConfig } from "vitepress";

const blogTheme = getThemeConfig({
  themeColor: "el-blue",
  oml2d: {
    mobileDisplay: false,
    models: [
      {
        path: "https://model.oml2d.com/HK416-1-normal/model.json",
        scale: 0.05,
      },
    ],
  },
  comment: {
    repo: "ATQQ/sugar-blog",
    repoId: "MDEwOlJlcG9zaXRvcnkyNDEyNDUyOTk",
    category: "Announcements",
    categoryId: "DIC_kwDODmEcc84COVc6",
    inputPosition: "top",
  },
  popover: {
    title: "公告",
    body: [
      { type: "text", content: "👇公众号👇---👇 微信 👇" },
      {
        type: "image",
        src: "https://img.cdn.sugarat.top/mdImg/MTYxNTAxODc2NTIxMA==615018765210~fmt.webp",
      },
      {
        type: "text",
        content: "欢迎大家私信交流",
      },
      {
        type: "button",
        content: "关于作者",
        link: "/aboutme",
      },
    ],
    duration: -1,
  },
  search: {
    showDate: true,
  },
  recommend: {
    showSelf: true,
    nextText: "下一页",
    style: "sidebar",
  },
  hotArticle: {
    pageSize: 12,
  },
  buttonAfterArticle: {
    openTitle: '投"币"支持',
    closeTitle: "下次一定",
    content:
      '<img src="https://img.cdn.sugarat.top/mdImg/MTY0Nzc1NTYyOTE5Mw==647755629193">',
    icon: "wechatPay",
  },
});

export default defineConfig({
  extends: blogTheme,
  metaChunk: true,
  markdown: {
    image: {
      lazyLoading: true,
    },
  },
  ignoreDeadLinks: true,
  lang: "zh-cn",
  title: "Giorno Giovanna",
  description: "但行好事，莫问前程",
  vite: {
    server: {
      port: 4000,
      host: "0.0.0.0",
    },
  },
  vue: {
    template: {
      compilerOptions: {
        // https://github.com/vuejs/vitepress/discussions/468
        isCustomElement: (tag) => {
          return ["center"].includes(tag.toLocaleLowerCase());
        },
      },
    },
  },
  lastUpdated: true,
  themeConfig: {
    outline: {
      level: [2, 3],
    },
    lastUpdatedText: "上次更新于",
    logo: "https://avatars.githubusercontent.com/u/54349117?s=400&u=6874f6b910ff8161bf2812a89eb6854d9b8ec9d9&v=4",
    editLink: {
      pattern:
        "https://github.com/ATQQ/sugar-blog/tree/master/packages/blogpress/:path",
      text: "去 GitHub 上编辑内容",
    },
    nav: [
      {
        text: "关于我",
        link: "/aboutme",
      },
      {
        text: "备战春秋",
        items: [
          { text: "心得总结", link: "/offer/experience/" },
          { text: "校招考点汇总", link: "/offer/campus/" },
          { text: "面经汇总", link: "/offer/sum-interview/" },
          { text: "复习自查", link: "/offer/review/" },
        ],
      },
    ],
    socialLinks: [{ icon: "github", link: "https://github.com/Joruno-w" }],
  },
});
