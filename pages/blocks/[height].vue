<script lang="ts" setup>
import { useAsyncData } from "#app";
import { computed, ref, watchEffect } from "vue";
import { useRoute } from "vue-router";
import { Loader2 } from "lucide-vue-next";
import ShieldedHeader from "~/components/molecules/ShieldedHeader.vue";

import { ScrollArea } from '@/components/ui/scroll-area'

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useBlocksStore } from "~/stores/blocks.store";
import { useUtils } from "#imports";

interface BlockDetailType {
  hash: string;
  height: string;
  txs: number;
  proposer: string;
  time: string | null | undefined;
}

const route = useRoute();
const height = ref("");
const blockStore = useBlocksStore();
const blockDetail = ref<BlockDetailType | null>(null);
const dateTime = ref("");
const { formatDateTime } = useUtils();

const navigateToTransactionDetail = (hash: string) => {
  if (!hash) return {};
  return {
    name: "transactions-hash",
    params: { hash },
  };
};

watchEffect(() => {
  height.value =
    typeof route.params.height === "string" ? route.params.height : "";
});

const header = ["No", "Transaction Type", "Hash Id"];

const { data: block } = await useAsyncData(`block-height`, () =>
  blockStore.fetchBlockDetailByHeight(height.value)
);

if (block.value) {
  blockDetail.value = blockStore.normalizeBlockData(block.value);
  dateTime.value = formatDateTime(block.value.header.time);
}

const isExistHashData = computed(
  () => block.value && block.value.tx_hashes.length > 0
);

const navigateToValidatorDetail = (address: string) => {
  if (!address) return {};
  return {
    name: "validators-address",
    params: { address },
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
</script>

<template>
  <div class="container">
    <div class="py-24 text-center">
      <h1 class="mb-6 text-5xl text-white font-display lg:text-6xl xl:text-7xl">
        Block Detail
      </h1>
    </div>
    <div class="p-6 border rounded-t-lg rounded-b-lg rounded-tl-none bg-[#13163f] border-[#323659] md:p-10">
      <div class="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-2">
        <div v-for="(value, key) in blockDetail"
          class="flex flex-col p-5 space-y-2 text-center transition-shadow border rounded-2lg border-[#323659] bg-[#101437] hover:shadow-lg">
          <template v-if="key === 'time'">
            <ClientOnly>
              <h5 class="text-xl uppercase text-secondary font-ultraSemiBold">
                {{ formatString(key) }}
              </h5>
              <span class="text-sm text-[#5e617d]">{{
          `${value} ( ${dateTime})`
        }}</span>
            </ClientOnly>
          </template>
          <template v-else-if="key === 'proposer'">
            <ClientOnly>
              <h5 class="text-xl uppercase text-secondary font-ultraSemiBold">
                {{ key }}
              </h5>
              <NuxtLink :to="navigateToValidatorDetail(value)" class="text-green-500">
                {{ value }}</NuxtLink>
            </ClientOnly>
          </template>
          <template v-else>
            <span class="text-xl uppercase text-secondary font-ultraSemiBold">{{
          key
        }}</span>
            <span class="text-sm text-[#5e617d]">{{ value }}</span>
          </template>
        </div>
      </div>
      <div class="container text-center text-secondary fond-bold" v-if="!block">
        <h5 class="text-3xl text-center text-secondary">No Data Found</h5>
      </div>
    </div>
    <div class="py-24 text-center" v-if="isExistHashData">
      <h1 class="mb-6 text-5xl text-white font-display lg:text-6xl xl:text-7xl">
        Transactions
      </h1>
      <ClientOnly>

      </ClientOnly>
      <ScrollArea class="w-full rounded-md h-[500px]">
        <table class="w-full text-sm text-left text-white lg:rounded-2xl bg-[#363a5d]" v-if='isExistHashData'>
          <thead class="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th class="px-6 py-3" v-for="text in header" :key="text" scope="col">{{ text }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for='(block, index) in block.tx_hashes' :key="block.hash_id"
              class="bg-[#13163f] border-b-[0.5px] !border-slate-500/50 hover:cursor-pointer">
              <th class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap" scope="row"><span>{{ index + 1 }}</span>
              </th>
              <td class="px-6 py-4"><span>{{ block.tx_type }}</span></td>
              <td class="px-6 py-4">
                <NuxtLink :to='navigateToTransactionDetail(block.hash_id)' class="text-green-500">{{ block.hash_id }}
                </NuxtLink>
              </td>
            </tr>
          </tbody>
        </table>
      </ScrollArea>

    </div>
  </div>
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
