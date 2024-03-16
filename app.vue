<script setup></script>

<template>
  <NuxtLayout class="min-h-screen bg-primary">
    <NuxtPage />
  </NuxtLayout>
</template>

<style lang="scss">
.page-enter-active {
  transition: all 0.3s ease-in-out;
}

.page-leave-active {
  transition: all 0.8s cubic-bezier(1, 0.5, 0.8, 1);
}

.page-enter-from,
.page-leave-to {
  transform: translateX(30px);
  opacity: 0;
}

</style>
