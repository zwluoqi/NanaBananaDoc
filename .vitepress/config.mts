import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "Nano Banana",
  description: "Nano Banana API Documentation",
  lang: 'zh-CN',
  head: [['link', { rel: 'icon', href: '/static/icon.png' }]],
  ignoreDeadLinks: true,

  themeConfig: {
    logo: '/static/icon.png',
    siteTitle: 'Nano Banana',

    nav: [
      { text: '首页', link: '/' },
      { text: 'API 文档', link: '/api' },
      { text: '官网', link: 'https://www.nananobanana.com' }
    ],

    sidebar: {
      '/': [
        {
          text: '开发者文档',
          items: [
            { text: 'API 使用文档', link: '/api' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/zwluoqi/NanoBananaDoc' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026 Nano Banana'
    },

    search: {
      provider: 'local'
    },

    docFooter: {
      prev: '上一页',
      next: '下一页'
    },

    outline: {
      label: '页面导航'
    }
  }
})
