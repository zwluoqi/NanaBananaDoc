import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "Nano Banana",
  head: [['link', { rel: 'icon', href: '/static/icon.png' }]],
  ignoreDeadLinks: true,

  themeConfig: {
    logo: '/static/icon.png',
    siteTitle: 'Nano Banana',

    socialLinks: [
      { icon: 'github', link: 'https://github.com/nanobanana/NanoBananaDoc' }
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
          { text: 'Agent Skill', link: '/skills' },
          { text: '官网', link: 'https://www.nananobanana.com' }
        ],

        sidebar: {
          '/': [
            {
              text: '开发者文档',
              items: [
                { text: 'API 概览', link: '/api' },
                { text: '同步请求模式', link: '/api-sync' },
                { text: '流式请求模式', link: '/api-stream' },
                { text: '异步请求模式', link: '/api-async' },
                { text: 'Agent Skill', link: '/skills' },
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
          { text: 'Agent Skill', link: '/en/skills' },
          { text: 'Official Website', link: 'https://www.nananobanana.com' }
        ],

        sidebar: {
          '/en/': [
            {
              text: 'Developer Docs',
              items: [
                { text: 'API Overview', link: '/en/api' },
                { text: 'Sync Mode', link: '/en/api-sync' },
                { text: 'Stream Mode', link: '/en/api-stream' },
                { text: 'Async Mode', link: '/en/api-async' },
                { text: 'Agent Skill', link: '/en/skills' },
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
