<script setup>
import AppHeader from '@/components/organisms/AppHeader.vue'
import Toaster from '@/components/ui/toast/Toaster.vue'
import ShieldedHeader from "~/components/molecules/ShieldedHeader.vue";

</script>

<template lang="pug">
div
  NuxtLoadingIndicator(color='#7252d6')
  AppHeader
  shielded-header
  slot
  ClientOnly
    Toaster

</template>

<style lang="scss" scoped></style>
