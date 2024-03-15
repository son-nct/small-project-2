<script lang="ts" setup></script>

<template>
  <aside
    id="sidebar"
    class="relative top-0 left-0 z-40 w-64 h-screen transition-transform"
    aria-label="Sidebar"
  >
    <div
      class="flex flex-col h-full px-3 py-4 overflow-y-auto bg-white border-r border-slate-200"
    >
      <div
        href="#"
        class="flex items-center px-3 py-2 mb-10 rounded-lg text-slate-900"
      >
        <span class="ml-3 text-base font-semibold">Namanda</span>
      </div>
      <ul class="space-y-2 text-sm font-medium">
        <li>
          <NuxtLink
            to="/home"
            class="flex items-center px-3 py-2 rounded-lg text-slate-900 hover:bg-primary/50"
          >
            <Icon name="fluent:home-20-regular" size="1.5rem" />
            <span class="flex-1 ml-3 whitespace-nowrap">Home</span>
          </NuxtLink>
        </li>
        <li>
          <NuxtLink
            to="/blocks"
            class="flex items-center px-3 py-2 rounded-lg text-slate-900 hover:bg-primary/50"
          >
            <Icon name="bitcoin-icons:block-outline" size="1.5rem" />
            <span class="flex-1 ml-3 whitespace-nowrap">Blocks</span>
          </NuxtLink>
        </li>
        <li>
          <NuxtLink
            to="/validators"
            class="flex items-center px-3 py-2 rounded-lg text-slate-900 hover:bg-primary/50"
          >
            <Icon name="prime:compass" size="1.5rem" />
            <span class="flex-1 ml-3 whitespace-nowrap">Validators</span>
          </NuxtLink>
        </li>
        <li>
          <NuxtLink
            to="/transaction"
            class="flex items-center px-3 py-2 rounded-lg text-slate-900 hover:bg-primary/50"
          >
            <Icon name="ant-design:transaction-outlined" size="1.5rem" />
            <span class="flex-1 ml-3 whitespace-nowrap">Transaction</span>
          </NuxtLink>
        </li>
      </ul>
    </div>
  </aside>
</template>

<style lang="scss" scoped>
.router-link-active {
  @apply bg-primary text-white font-bold border shadow-sm;
}
</style>
