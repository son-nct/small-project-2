import { defineNuxtPlugin } from '#app'

import en from 'javascript-time-ago/locale/en'
import TimeAgo from 'javascript-time-ago'

TimeAgo.addDefaultLocale(en)

export default defineNuxtPlugin(async () => {
  const timeAgo = new TimeAgo('en-US')
  return {
    provide: {
      TimeFormatter: timeAgo,
    },
  }
})
