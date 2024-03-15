<script setup lang="ts">
import { provide, ref } from "vue";
import { useRouter } from "vue-router";
import AppSideBarMobile from "./AppSideBarMobile.vue";
import { useHead } from "#imports";

import { Input } from "@/components/ui/input";

const searchValue = ref("");

// const head = useHead({
//   script: [
//     {
//       hid: "stripe",
//       src: "https://cryptorank.io/widget/marquee.js",
//       defer: true,
//     },
//   ],
// });

const openMobileMenu = ref(false);
provide("openMobileMenuState", openMobileMenu);

const toggleMobileMenu = () => {
  openMobileMenu.value = !openMobileMenu.value;
};

const navigator = [
  // {
  //   text: "Home",
  //   to: "/",
  // },
  {
    text: "Blocks",
    to: "/blocks",
  },
  {
    text: "Validators",
    to: "/validators",
  },
  {
    text: "Transactions",
    to: "/transactions",
  },
];

const router = useRouter();

const globalSearch = () => {
  const trimmedSearchValue = searchValue.value.trim();
  let routeDetails = { name: "", params: {} };

  if (trimmedSearchValue.length === 64) {
    routeDetails = {
      name: "transactions-hash",
      params: { hash: trimmedSearchValue },
    };
  } else if (trimmedSearchValue.length === 40) {
    routeDetails = {
      name: "validators-address",
      params: { address: trimmedSearchValue },
    };
  } else {
    routeDetails = {
      name: "blocks-height",
      params: { height: trimmedSearchValue },
    };
  }

  router.push(routeDetails);

  // Clear the search input
  searchValue.value = "";
};
</script>

<template>
  <header class="relative top-0 z-20 w-full transition-colors js-page-header backdrop-blur js-page-header--is-sticky">
    <div class="flex items-center px-6 py-6 xl:px-24">
      <!-- <form class="relative ml-12 mr-8 hidden basis-3/12 lg:block xl:ml-[8%]">
        <input
          type="search"
          class="w-full rounded-2xl border border-jacarta-100 py-[0.6875rem] px-4 pl-10 text-jacarta-700 placeholder-jacarta-500 focus:ring-accent dark:border-transparent dark:bg-white/[.15] dark:text-white dark:placeholder-white"
          placeholder="Search"
        />
      </form> -->
      <!-- @keyup.enter="globalSearch" -->
      <form class="relative ml-12 mr-8 hidden basis-3/12 lg:block xl:ml-[8%]">
        <input type="search"
          v-model="searchValue"
          class="w-full rounded-2xl border border-[#323659] py-[0.6875rem] px-4 pl-10 focus:ring-accent dark:border-transparent bg-white/[.15] text-white placeholder-white"
          placeholder="Global Search"><span
          class="absolute top-0 left-0 flex items-center justify-center w-12 h-full rounded-2xl">
          <svg
            @click="globalSearch"
            xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" class="w-4 h-4 fill-white">
            <path fill="none" d="M0 0h24v24H0z"></path>
            <path
              d="M18.031 16.617l4.283 4.282-1.415 1.415-4.282-4.283A8.96 8.96 0 0 1 11 20c-4.968 0-9-4.032-9-9s4.032-9 9-9 9 4.032 9 9a8.96 8.96 0 0 1-1.969 5.617zm-2.006-.742A6.977 6.977 0 0 0 18 11c0-3.868-3.133-7-7-7-3.868 0-7 3.132-7 7 0 3.867 3.132 7 7 7a6.977 6.977 0 0 0 4.875-1.975l.15-.15z">
            </path>
          </svg>
        </span>
      </form>
      <div
        class="fixed inset-0 z-10 items-center invisible ml-auto bg-white opacity-0 js-mobile-menu lg:visible rtl:mr-auto rtl:ml-0 dark:bg-jacarta-800 lg:relative lg:inset-auto lg:flex lg:bg-transparent lg:opacity-100 dark:lg:bg-transparent">
        <div
          class="fixed left-0 z-10 flex items-center justify-between w-full p-6 bg-white t-0 dark:bg-jacarta-800 lg:hidden">
        </div>
        <nav class="w-full navbar">
          <ul class="flex flex-col lg:flex-row">
            <li class="relative js-nav-dropdown group" v-for="nav in navigator" :key="nav">
              <NuxtLink :to="nav.to"
                class="link hover:text-secondary duration-300 ease-out dropdown-toggle flex items-center justify-between py-3.5 font-display text-base text-jacarta-700 text-white lg:px-5">
                {{ nav.text }}</NuxtLink>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </header>
</template>
<style lang="scss" scoped>
.js-page-header--is-sticky,
.js-page-header--is-sticky.page-header--transparent {
  background-color: rgba(19, 23, 64, 0.5);
}

.router-link-active {
  @apply text-secondary font-ultraBold;
}

.link {
  @apply relative;

  &__style {
    @apply h-[1px] inline-block w-0 bg-primary absolute -bottom-0.5 left-0 z-10;
  }

  &:not(.active):hover {
    .link__style {
      @apply w-full ease-out duration-300;
    }
  }
}
</style>
