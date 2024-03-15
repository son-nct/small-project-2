import { defineNuxtRouteMiddleware, navigateTo } from '#app'

export default defineNuxtRouteMiddleware((to, from) => {
  if (to.path !== '/blocks') {
    return navigateTo('/blocks')
  }
})
