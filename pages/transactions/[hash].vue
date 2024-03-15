<script lang="ts" setup>
import { useAsyncData } from "#app";
import { computed, ref, watchEffect } from "vue";
import { useRoute } from "vue-router";
import { Loader2 } from "lucide-vue-next";
import { Badge } from "@/components/ui/badge";
import ShieldedHeader from "~/components/molecules/ShieldedHeader.vue";

import { useTransactionStore } from "~/stores/transactions.store";
import { useUtils } from "#imports";

interface TransactionDetail {
  chanId: string;
  txHash: string;
  gasWanted: string;
  gasUsed: string;
  status: "Success" | "false";
  height: number;
  time: string;
  fee: string;
  gas: string;
  shielded: "Yes" | "No";
}

const route = useRoute();
const transactionStore = useTransactionStore();
const hash = ref("");
const { formatDateTime } = useUtils();
const transactionDetail = ref<TransactionDetail | null>(null);

const navigateToTransactionDetail = (address: string) => {
  if (!address) return {};
  return {
    name: "validators-address",
    params: { address },
  };
};

const navigateToBlockDetail = (height: string) => {
  if (!height) return {};
  return {
    name: "blocks-height",
    params: { height },
  };
};

watchEffect(() => {
  hash.value = typeof route.params.hash === "string" ? route.params.hash : "";
});

const { data: transaction } = await useAsyncData(
  `transaction-detail-by-hash`,
  () => transactionStore.fetchTransactionByHash(hash.value)
);

const { data: detail, pending } = await useAsyncData(
  `transaction-detail-normalize`,
  () => transactionStore.normalizeTransactionByHash(transaction.value)
);

transactionDetail.value = detail.value;

const hasTransactionData = computed(() => transactionDetail.value);

const formatDateTimeFunc = (dateTimeString: string) => {
  if (!dateTimeString) return "";
  return formatDateTime(dateTimeString);
};

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

const copyDataToClipboard = () => {
  navigator.clipboard
    .writeText(transactionStore.rawData)
    .then(() => {
      transactionStore.showCopiedToast();
    })
    .catch((err) => {
      console.error("Failed to copy data to clipboard:", err);
    });
};
</script>

<template lang="pug">
main
    article
        section
            .container(class='z-10 p-8 mx-auto lg:p-10')
                .element-section
                  .py-24.text-center
                    h1.mb-6.text-5xl.text-white.font-display(class='lg:text-6xl xl:text-7xl')
                      | Transaction Detail
                  .p-6.border.rounded-t-lg.rounded-b-lg(class='bg-[#13163f] border-[#323659] md:p-10')
                    .grid.grid-cols-1.gap-5
                      .flex.items-center.mb-2(v-for='(value, key) in transactionDetail')
                        template(v-if="key === 'time'")
                          ClientOnly
                            h5.mr-2.text-white.font-md(class='min-w-[9rem]')
                              | {{ formatString(key) }}:
                            span(class='text-[#5e617d]')
                              | {{
                              | &grave;${value} ( ${formatDateTimeFunc(value) })&grave;
                              | }}
                        template(v-else-if="key === 'status'")
                          ClientOnly
                            h5.mr-2.text-white.font-md(class='min-w-[9rem]')
                              | {{ formatString(key) }}:
                            badge.text-sm.text-red-500.border-red-500(variant='outline' v-if="value === 'Fail'")
                              | {{ value }}
                            badge.text-sm.text-green-500.border-green-600(variant='outline' v-else='')
                              | {{ value }}
                        template(v-else-if="key === 'height'")
                          ClientOnly
                            h5.mr-2.text-white.font-md(class='min-w-[9rem]')
                              | {{ formatString(key) }}:
                            NuxtLink.text-sm.text-green-500(:to='navigateToBlockDetail(value)')
                              | {{ value }}
                        template(v-else='')
                          h5.mr-2.text-white.font-md(class='min-w-[9rem]')
                            | {{ formatString(key) }}:
                          span.overflow-x-auto(class='text-[#5e617d]')
                            | {{ value }}
                  .element-section(v-if='transaction')
                    div(class='relative flex flex-col w-full gap-4 h-fit lg:gap-10')
                      h1.mb-6.text-5xl.text-white.font-display(class='lg:text-6xl xl:text-7xl')
                        | Raw Data
                      div(class='w-full')
                        div(class='border-[#323659] relative flex items-start justify-between w-full p-4 m-2 mb-8 space-x-3 rounded stories drop-shadow-xl').h-auto.border.rounded-lg.text-white.overflow-y-auto
                          //- Icon(name="solar:clipboard-bold" size="3rem" class='absolute top-0 right-0 z-10 text-white cursor-pointer' @click='copyDataToClipboard')
                          Button(class='absolute top-0 right-0 z-10 text-white cursor-pointer bg-secondary' @click='copyDataToClipboard') Copy
                          pre(style='max-height: 500px; overflow-x: auto; overflow-y: auto;')
                            | {{ transactionStore.rawData }}           
                .container(v-if='!hasTransactionData')
                  h5.text-primary.text-center.text-3xl No Data Found

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
