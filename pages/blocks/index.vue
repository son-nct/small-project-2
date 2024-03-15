<script setup lang="ts">
import { onMounted, ref, computed, onUnmounted, reactive } from "vue";
import { useAsyncData } from "#app";
import { Loader2, ChevronRight, ChevronLeft } from "lucide-vue-next";
import { useRouter } from "vue-router";
import Loading from "~/components/ui/loading/index.vue";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useBlocksStore } from "~/stores/blocks.store";
import { useUtils } from "~/composables/useUtils";

const header = ["No", "Height", "Hash", "Txs", "Proposer", "Time"];

const searchValue = ref("");
const isLoading = ref(false);
const forceUpdateUI = ref(1);

const blockStore = useBlocksStore();

const updateLatestData = async (newData: any) => {
  if (!newData || newData.length === 0) return
  blockStore.latestBlocks = newData.map((block: any) => ({
    ...blockStore.normalizeBlockData(block),
  }));
};

const forceUpdateUIUI = () => {
  forceUpdateUI.value += 1;
};
const setLoading = (status: boolean) => (isLoading.value = status);

const updateCurrentPage = async (type: string) => {
  let newData = [];
  if (isLoading.value) return;
  switch (type) {
    case "next":
      if (blockStore.currentPage * blockStore.pageSize < blockStore.totalData) {
        setLoading(true);
        blockStore.currentPage += 1;
        newData = await blockStore.fetchLatestBlocksList();
        updateLatestData(newData);
        forceUpdateUIUI();
      }
      break;
    case "prev":
      if (blockStore.currentPage > 1) {
        setLoading(true);
        blockStore.currentPage -= 1;
        newData = await blockStore.fetchLatestBlocksList();
        updateLatestData(newData);
        forceUpdateUIUI();
      }
      break;
    default:
      break;
  }
  setLoading(false);
};

const navigateToValidatorDetail = (address: string) => {
  if (!address) return {};
  return {
    name: "validators-address",
    params: { address },
  };
};

const { data: blocks, pending } = await useAsyncData("latest-block", () =>
  blockStore.fetchLatestBlocksList()
);

await updateLatestData(blocks.value);

const hasBlocksData = computed(() => blockStore.latestBlocks.length > 0);

const navigateToBlockDetail = (height: string) => {
  if (!height) return {};
  return {
    name: "blocks-height",
    params: { height },
  };
};

const router = useRouter();

const searchByBlockHeight = () => {
  if (searchValue.value.trim().length === 0) return;
  router.push({
    name: "blocks-height",
    params: { height: searchValue.value },
  });
};

const trunCateText = (text: string) => {
  const { truncateText } = useUtils();
  const startChars = 7;
  const endCharts = 5;
  return truncateText(text, startChars, endCharts);
};

let fetchInterval = null;

onMounted(() => {
  fetchInterval = setInterval(async () => {
    if (blockStore.currentPage === 1) {
      const newData = await blockStore.fetchLatestBlocksList();
      updateLatestData(newData);
      forceUpdateUIUI();
    }
  }, 4000);
});

onUnmounted(() => {
  clearInterval(fetchInterval);
});
</script>

<template>
  <div class="container flex flex-col gap-10 p-8">
    <h2 class="font-bold text-center text-white font-display">Blocks</h2>

    <div class="flex items-start w-full">
      <label for="simple-search" class="sr-only">Search</label>
      <div class="relative w-full min-w-80">
        <i
          class="absolute inset-y-0 flex items-center text-white pointer-events-none start-0 ps-3"
        >
          <Icon name="ic:baseline-search" size="1.5rem" />
        </i>
        <input
          type="text"
          id="simple-search"
          class="block w-full p-4 text-sm text-white border rounded-l-lg ps-10 focus:ring-blue-500 focus:border-secondary"
          placeholder="Search by Blocks Hash..."
          required
          v-model="searchValue"
          @keyup.enter="searchByBlockHeight"
        />
      </div>
      <button
        type="button"
        class="hidden w-full px-6 py-3 text-white rounded-r-lg cursor-pointer bg-secondary font-ultraBold lg:w-fit h-14 lg:block"
        @click="searchByBlockHeight"
      >
        Search
      </button>
    </div>

    <div class="relative overflow-x-auto" v-if="hasBlocksData">
      <div
        v-if="isLoading"
        class="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white rounded-2xl bg-blue-950/50"
      >
        <Loading />
        <h1>Loading</h1>
      </div>
      <ClientOnly>
        <table
          class="w-full text-sm text-left text-white lg:rounded-2xl bg-[#363a5d]"
        >
          <thead class="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
              <th
                v-for="text in header"
                :key="text"
                scope="col"
                class="px-6 py-3"
              >
                {{ text }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(block, index) in blockStore.latestBlocks"
              class="bg-[#13163f] border-b-[0.5px] !border-slate-500/50 hover:cursor-pointer"
            >
              <th
                scope="row"
                class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
              >
                <span class="mr-2 lg:mr-4">
                  {{
                    blockStore.currentPage * blockStore.pageSize +
                    index +
                    1 -
                    blockStore.pageSize
                  }}
                </span>
              </th>

              <td class="px-6 py-4">
                <NuxtLink
                  class="text-green-600"
                  :to="navigateToBlockDetail(block.height)"
                  >{{ block.height }}</NuxtLink
                >
              </td>

              <td class="px-6 py-4">
                {{ trunCateText(block.hash) }}
              </td>

              <td class="px-6 py-4">
                {{ block.txs }}
              </td>

              <td class="px-6 py-4">
                <NuxtLink
                  class="text-green-600"
                  :to="navigateToBlockDetail(block.height)"
                  >{{ block.proposer }}</NuxtLink
                >
              </td>

              <td class="px-6 py-4">
                {{ block.time }}
              </td>
            </tr>
          </tbody>
        </table>
        <p class="my-2 text-center text-white">{{ ((blockStore.currentPage - 1) * blockStore.pageSize) + 1 }} - {{ blockStore.currentPage * blockStore.pageSize }} of {{ blockStore.totalData }}</p>
      </ClientOnly>

      <div class="flex justify-end w-full mt-5">
        <div class="my-1 mr-2.5" @click="updateCurrentPage('prev')">
          <button
            class="flex items-center justify-center px-4 text-sm font-semibold text-white transition-colors border rounded-lg bg-third dropdown-toggle group h-9 border-customBorder font-display hover:border-transparent hover:bg-secondary hover:text-white"
            id="blockchainFilter"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <Icon name="ic:baseline-arrow-back-ios" />
          </button>
        </div>

        <div class="my-1 mr-2.5" @click="updateCurrentPage('next')">
          <button
            class="flex items-center justify-center px-4 text-sm font-semibold text-white transition-colors border rounded-lg bg-third dropdown-toggle group h-9 border-customBorder font-display hover:border-transparent hover:bg-secondary hover:text-white"
            id="blockchainFilter"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <Icon name="ic:baseline-arrow-forward-ios" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
input {
  @apply bg-third border-secondary/10;
}

input::placeholder {
  @apply text-white;
}
</style>
