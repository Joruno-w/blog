import type { Site, Ui, Features } from './types'

export const SITE: Site = {
  website: 'https://wangshengliang.cn/',
  base: '/',
  title: 'Joruno Jobaāna',
  description: "Joruno Jobaāna's blog",
  author: 'Joruno Jobaāna',
  lang: 'zh-Hans',
  ogLocale: 'zh_CN',
  imageDomains: ['cdn.jsdelivr.net', '*.unsplash.com'],
}

export const UI: Ui = {
  internalNavs: [
    {
      path: '/blog',
      title: 'Blog',
      displayMode: 'alwaysText',
      text: 'Blog',
    },
    {
      path: '/projects',
      title: 'Projects',
      displayMode: 'alwaysText',
      text: 'Projects',
    },
    {
      path: '/highlights',
      title: 'Highlights',
      displayMode: 'iconToTextOnMobile',
      text: 'Highlights',
      icon: 'i-ri-screenshot-line',
    },
    {
      path: '/photos',
      title: 'Photos',
      displayMode: 'iconToTextOnMobile',
      text: 'Photos',
      icon: 'i-ri-camera-ai-line',
    },
    {
      path: '/shorts',
      title: 'Shorts',
      displayMode: 'iconToTextOnMobile',
      text: 'Shorts',
      icon: 'i-meteor-icons-grid',
    },
    {
      path: '/changelog',
      title: 'Changelog',
      displayMode: 'iconToTextOnMobile',
      text: 'Changelog',
      icon: 'i-ri-draft-line',
    },
  ],
  socialLinks: [
    {
      link: 'https://github.com/Joruno-w',
      title: 'GitHub Profile',
      displayMode: 'alwaysIcon',
      icon: 'i-uil-github-alt',
    },
    // {
    //   link: 'https://x.com/astrodotbuild',
    //   title: 'Astro on Twitter',
    //   displayMode: 'alwaysIcon',
    //   icon: 'i-ri-twitter-x-fill',
    // },
    // {
    //   link: 'https://bsky.app/profile/astro.build',
    //   title: 'Astro on Bluesky',
    //   displayMode: 'alwaysIcon',
    //   icon: 'i-meteor-icons-bluesky',
    // },
  ],
  navBarLayout: {
    left: [],
    right: [
      'internalNavs',
      'hr',
      'socialLinks',
      'hr',
      'searchButton',
      'themeButton',
      'rssLink',
    ],
    mergeOnMobile: true,
  },
  tabbedLayoutTabs: [
    { title: 'Changelog', path: '/changelog' },
    { title: 'AstroBlog', path: '/feeds' },
    { title: 'AstroStreams', path: '/streams' },
  ],
  groupView: {
    maxGroupColumns: 3,
    showGroupItemColorOnHover: true,
  },
  githubView: {
    monorepos: [
      'withastro/astro',
      'withastro/starlight',
      'lin-stephanie/astro-loaders',
    ],
    mainLogoOverrides: [
      [/starlight/, 'https://starlight.astro.build/favicon.svg'],
    ],
    subLogoMatches: [
      [/theme/, 'i-unjs-theme-colors'],
      [/github/, 'https://github.githubassets.com/favicons/favicon.svg'],
      [/tweet/, 'i-logos-twitter'],
      [/bluesky/, 'i-logos-bluesky'],
    ],
  },
  externalLink: {
    newTab: false,
    cursorType: '',
    showNewTabIcon: false,
  },
  postMetaStyle: 'minimal',
}

/**
 * Configures whether to enable special features:
 *  - Set to `false` or `[false, {...}]` to disable the feature.
 *  - Set to `[true, {...}]` to enable and configure the feature.
 */
export const FEATURES: Features = {
  slideEnterAnim: [true, { enterStep: 40 }],
  ogImage: [
    true,
    {
      authorOrBrand: `${SITE.title}`,
      fallbackTitle: `${SITE.description}`,
      fallbackBgType: 'plum',
    },
  ],
  toc: [
    true,
    {
      minHeadingLevel: 2,
      maxHeadingLevel: 4,
      displayPosition: 'left',
      displayMode: 'content',
    },
  ],
  share: [
    true,
    {
      twitter: false,
      bluesky: false,
      mastodon: false,
      facebook: false,
      pinterest: false,
      reddit: false,
      telegram: false,
      whatsapp: false,
      email: false,
    },
  ],
  giscus: [
    true,
    {
      'data-repo': 'Joruno-w/blog',
      'data-repo-id': 'R_kgDOP4yOiQ',
      'data-category': 'Announcements',
      'data-category-id': 'DIC_kwDOP4yOic4CwBgk',
      'data-mapping': 'pathname',
      'data-strict': '0',
      'data-reactions-enabled': '1',
      'data-emit-metadata': '0',
      'data-input-position': 'bottom',
      'data-lang': 'zh-CN',
    },
  ],
}
