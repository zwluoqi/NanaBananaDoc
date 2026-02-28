import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "Nano Banana",
  head: [['link', { rel: 'icon', href: '/static/icon.png' }]],
  ignoreDeadLinks: true,

  themeConfig: {
    logo: '/static/icon.png',
    siteTitle: 'Nano Banana',

    socialLinks: [
      { icon: 'github', link: 'https://github.com/zwluoqi/NanoBananaDoc' }
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026 Nano Banana'
    },

    search: {
      provider: 'local'
    }
  },

  locales: {
    root: {
      label: '简体中文',
      lang: 'zh-CN',
      description: "Nano Banana API Documentation",
      themeConfig: {
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

        docFooter: {
          prev: '上一页',
          next: '下一页'
        },

        outline: {
          label: '页面导航'
        }
      }
    },
    en: {
      label: 'English',
      lang: 'en-US',
      description: "Nano Banana API Documentation",
      themeConfig: {
        nav: [
          { text: 'Home', link: '/en/' },
          { text: 'API Docs', link: '/en/api' },
          { text: 'Official Website', link: 'https://www.nananobanana.com' }
        ],

        sidebar: {
          '/en/': [
            {
              text: 'Developer Docs',
              items: [
                { text: 'API Usage', link: '/en/api' }
              ]
            }
          ]
        },

        docFooter: {
          prev: 'Previous page',
          next: 'Next page'
        },

        outline: {
          label: 'On this page'
        }
      }
    }
  }
})
