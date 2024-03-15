// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  imports: {
    autoImport: false,
  },
  image: {
    provider: 'netlify',
  },
  // configure meta
  app: {
    head: {
      title: 'Namanda - Stakepool & Crypto',
      htmlAttrs: {
        lang: 'en',
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          hid: 'description',
          name: 'description',
          content: 'Namanda - Stakepool & Crypto',
        },
        { name: 'format-detection', content: 'telephone=no' },
      ],
      // link: [{ rel: 'icon', type: 'image/png', href: '/favicon.png' }]
    },
    layoutTransition: { name: 'layout', mode: 'out-in' }, // out-in
    pageTransition: { name: 'page', mode: 'out-in' },
  },
  // configure tailwind and css
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  css: ['~/assets/css/main.scss'],
  // configure nitro server and compress static files
  nitro: {
    compressPublicAssets: true,
  },
  // configure build module
  modules: [
    '@nuxtjs/google-fonts',
    'nuxt-icon',
    '@nuxtjs/tailwindcss',
    'shadcn-nuxt',
    '@nuxt/image',
    '@pinia/nuxt',
  ],
  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: '',
    /**
     * Directory that the component lives in.
     * @default "./components/ui"
     */
    componentDir: './components/ui',
  },
  googleFonts: {
    // Options
    display: 'swap',
    prefetch: false,
    preconnect: false,
    preload: true,
    download: true,
    base64: false,
  },
  // configure nuxt icon
  nuxtIcon: {
    size: '24px', // default <Icon> size applied
    class: 'icon', // default <Icon> class applied
  },
  runtimeConfig: {
    // The private keys which are only available within server-side
    public: {
      RPC_URL: process.env.NUXT_PUBLIC_RPC_URL,
      BASE_URL: process.env.NUXT_PUBLIC_BASE_URL,
      NAMANDA_BASE_URL: process.env.NUXT_PUBLIC_NAMANDA_BASE_URL,
    },
  },
})
