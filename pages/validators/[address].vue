<script lang="ts" setup>
import { useAsyncData, useLazyAsyncData, useNuxtApp } from "#app";
import { computed, onMounted, onUnmounted, ref, watchEffect } from "vue";
import { useRoute } from "vue-router";
import { Loader2 } from "lucide-vue-next";
import { useValidatorStore } from "~/stores/validators.store";
import ShieldedHeader from "~/components/molecules/ShieldedHeader.vue";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
// Reactively update address based on the route parameter

const route = useRoute();
const address = ref("");
const validatorStore = useValidatorStore();
const message = ref<string>("");

watchEffect(() => {
  address.value =
    typeof route.params.address === "string" ? route.params.address : "";
});

if (validatorStore.allValidators.length === 0) {
  const { data: allValidators } = await useAsyncData("all-validators", () =>
    validatorStore.fetchValidatorList()
  );
}

const { data: validator } = await useAsyncData(`validators-detail`, () =>
  validatorStore.fetchValidatorDetail(address.value)
);

const { data: blocks, pending } = await useLazyAsyncData(
  `validators-blocks`,
  () => validatorStore.fetchBlocksByAddress(address.value)
);

const navigateToBlockDetail = (height: string) => {
  if (!height) return {};
  return {
    name: "blocks-height",
    params: { height },
  };
};

const formatString = (input: string): string => {
  const trimmedInput = input.trim();
  const words = trimmedInput.split("_");

  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase() + words[0].slice(1);
  } else if (words.length === 2) {
    return words
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }
  return trimmedInput;
};

let fetchInterval = null;
const keyTransition = ref(1);

onMounted(() => {
  fetchInterval = setInterval(async () => {
    const newBlocks = await validatorStore.fetchLatestSignatures(address.value);
    if (newBlocks && newBlocks.length > 0) {
      if (blocks.value.length >= 100) {
        blocks.value.splice(-100, 100);
      }
      blocks.value.unshift(...newBlocks);
      keyTransition.value += 1;
    }
  }, 5000);
});

onUnmounted(() => {
  clearInterval(fetchInterval);
});
</script>

<template lang="pug">
main
  article
    section
      .container(class='z-10 p-8 mx-auto lg:p-10')
        .py-24.text-center
          h1(class="lg:text-6xl xl:text-7xl").mb-6.text-5xl.text-white.font-display
            | Validator Detail
        .p-6.border.rounded-t-lg.rounded-b-lg.rounded-tl-none(class='bg-[#13163f] border-[#323659] md:p-10')
          .flex.flex-col.p-5.space-y-2.text-center.transition-shadow.border.rounded-lg(v-for='(value, key) in validator' class='border-[#323659] bg-[#101437] hover:shadow-lg')
            h5.text-3xl.text-center.text-secondary.font-ultraBold
              | {{ formatString(key) }}
            p.overflow-x-auto.text-base.tracking-tight.text-center.break-words.whitespace-nowrap.text-neutralPink(class='lg:text-lg')
              | {{ value }}

          .element-section(v-if='validator')
            div(class='relative flex flex-col w-full gap-4 h-fit lg:gap-10')
              h1(class="lg:text-6xl xl:text-7xl").mb-6.text-5xl.text-white.font-display.text-center
                | 100 Blocks
              ClientOnly
                div(class='flex flex-wrap items-center justify-start w-full gap-2 border rounded lg:p-8 bg-[#13163f] shadow-md border-[#323659]')
                  div.w-full.h-full.flex.items-center.justify-center(v-if='pending')
                    Loader2(class="w-10 h-10 mr-2 text-secondary animate-spin")
                  TransitionGroup(name='block-list' tag='div' class='flex flex-wrap items-center justify-start w-full gap-2 p-8' v-else)
                    div.flex.items-center.flex-wrap.gap-2(:key='keyTransition')
                      TooltipProvider(v-for='(block,index) in blocks' :key="`block-${block.block_number}-${index}`")
                        Tooltip
                          NuxtLink(:to='navigateToBlockDetail(block.block_number)')
                            TooltipTrigger
                              div(:class="block.sign_status ? 'bg-green-500' : 'bg-red-500'").w-4.h-4.rounded-xs
                          TooltipContent.bg-third.border-neutral.shadow-md
                            .flex.flex-col
                              .flex.flex-col
                                h5.text-secondary Height:
                                p.text-white {{ block.block_number }}
                              .flex.flex-col
                                h5.text-secondary Signed:
                                p(:class="block.sign_status ? 'text-white' : 'text-red-500'") {{ block.sign_status }}
                  div.w-full.h-full.flex.items-center.justify-center.mt-4.gap-4
                    div(class='flex flex-col items-center gap-2 lg:flex-row')
                      .w-4.h-4.rounded-xs.bg-green-500
                      p.text-white Signed Block
                    div(class='flex flex-col items-center gap-2 lg:flex-row')
                      .w-4.h-4.rounded-xs.bg-red-500
                      p.text-white Missed Block
          .container(v-if='!validator')
            h5.text-secondary.text-center.text-3xl No Data Found

</template>

<style lang="scss" scoped>
.block-list-move,
.block-list-enter-active,
.block-list-leave-active {
  transition: all 0.5s ease;
}

.block-list-enter-from,
.block-list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.block-list-leave-active {
  position: absolute;
}
</style>
