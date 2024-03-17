<script setup lang="ts">
import { onMounted, ref, computed, onUnmounted, reactive } from 'vue'
import { useAsyncData } from '#app'
import { useRouter } from 'vue-router'
import { Badge } from '@/components/ui/badge'
import { Loader2, ChevronRight, ChevronLeft } from "lucide-vue-next";
import ShieldedHeader from "~/components/molecules/ShieldedHeader.vue";
import Loading from '~/components/ui/loading/index.vue'

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { useTransactionStore } from '~/stores/transactions.store'
import { useUtils } from '~/composables/useUtils'

const header = ['No', 'Tx', 'Height', 'Type', 'Shielded', 'Status', 'Time']

const searchValue = ref('')
const isLoading = ref(false)
const isLoadingInterval = ref(false)
const forceUpdate = ref(1)

const transactionStore = useTransactionStore()

const forceUpdateUI = () => {
  forceUpdate.value += 1;
};

const navigateToValidatorDetail = (address: string) => {
  if (!address) return {}
  return {
    name: 'validators-address',
    params: { address },
  }
}

const setLoading = (status: boolean) => (isLoading.value = status);

const updateCurrentPage = async (type: string) => {
  if (isLoading.value) return
  switch (type) {
    case "next":
      if (transactionStore.currentPage * transactionStore.pageSize < transactionStore.totalData) {
        setLoading(true);
        transactionStore.currentPage += 1;
        await transactionStore.fetchLatestTransactionList();
        forceUpdateUI();
      }
      break;
    case "prev":
      if (transactionStore.currentPage > 1) {
        setLoading(true);
        transactionStore.currentPage -= 1;
        await transactionStore.fetchLatestTransactionList();
        forceUpdateUI();
      }
      break;
    default:
      break;
  }
  setLoading(false);
};

const { data: transactions, pending } = await useAsyncData(
  'latest-transactions',
  () => transactionStore.fetchLatestTransactionList(),
)

const hasTransactionData = computed(
  () => transactionStore.latestTransaction.length > 0,
)

const navigateToBlockDetail = (height: string) => {
  if (!height) return {}
  return {
    name: 'blocks-height',
    params: { height },
  }
}

const navigateToTransactionDetail = (hash: string) => {
  if (!hash) return {}
  return {
    name: 'transactions-hash',
    params: { hash },
  }
}

const router = useRouter()
const searchByTransactionHash = () => {
  if (searchValue.value.trim().length === 0) return
  router.push({
    name: 'transactions-hash',
    params: { hash: searchValue.value },
  })
}

const trunCateText = (text: string) => {
  const { truncateText } = useUtils()
  const startChars = 7
  const endCharts = 5
  return truncateText(text, startChars, endCharts)
}

let fetchInterval = null

onMounted(() => {
  fetchInterval = setInterval(async () => {
    if (transactionStore.currentPage === 1 && !pending.value && !isLoadingInterval.value) {
      isLoadingInterval.value = true
      await transactionStore.fetchLatestTransactionList()
      forceUpdateUI()
      isLoadingInterval.value = false
    }
  }, 4000)
})

onUnmounted(() => {
  clearInterval(fetchInterval)
})
</script>

<template lang="pug">
main
  article
    section.relative.overflow-hidden.min-h-screen
      .container(class='z-10 p-8 mx-auto lg:p-10')
        div(class='relative w-full h-fit rounded-3xl')
          .flex.flex-col.items-center.justify-center.gap-10.w-full
            h2.uppercase.font-ultraBold.text-white.text-center
              | Transactions
              
            //- Seach bar
            div.w-full.flex.items-start
              label.sr-only(for='simple-search') Search
              .relative.w-full.min-w-80
                .absolute.inset-y-0.start-0.flex.items-center.ps-3.pointer-events-none.text-white
                  Icon(name="ic:baseline-search" size="1.5rem")
                input#simple-search.border.text-white.text-sm.block.w-full.ps-10.rounded-l-lg(type='text' @keyup.enter='searchByTransactionHash' v-model='searchValue'  class='p-4 focus:ring-blue-500 focus:border-secondary' placeholder='Search by Transaction Hash...' required='')
              button(type='button' class='hidden w-full px-6 py-3 text-white rounded-r-lg cursor-pointer bg-secondary font-ultraBold lg:w-fit h-14 lg:block' @click='searchByTransactionHash') Search
            
            ClientOnly
              Table
              div(class="relative w-full overflow-x-auto rounded-s-none")
                div.w-full.h-full.flex.items-center.justify-center(v-if='pending')
                  Loader2(class="w-10 h-10 mr-2 text-primary animate-spin")
              
                div(v-if="isLoading" class="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white rounded-2xl bg-blue-950/50")
                  Loading
                  h1 Loading
                
                table.w-full.text-sm.text-left.text-white(class='lg:rounded-2xl bg-[#363a5d]' v-if='hasTransactionData')
                  thead.text-xs.text-gray-700.uppercase.bg-gray-50
                    tr
                      th.px-6.py-3(v-for='text in header' :key='text' scope='col')
                        | {{ text }}
                  tbody
                    tr(v-for='(transaction,index) in transactionStore.latestTransaction' :key='transaction.tx' class='bg-[#13163f] hover:bg-[#13163f] border-b-[0.5px] !border-slate-500/50')
                      th.px-6.py-4.font-medium.text-gray-900.whitespace-nowrap(scope='row')
                        span {{ (transactionStore.currentPage * transactionStore.pageSize) + index + 1 - transactionStore.pageSize }}
                      td.px-6.py-4(class='hover:bg-secondary group')
                        NuxtLink(:to='navigateToTransactionDetail(transaction.tx)' class='text-green-500 group-hover:text-white') {{ trunCateText(transaction.tx) }}
                      td.px-6.py-4(class='hover:bg-secondary group')
                        NuxtLink(:to='navigateToBlockDetail(transaction.height)' class='text-green-500 group-hover:text-white') {{ transaction.height }}
                      td.px-6.py-4(class='hover:bg-secondary group')
                        span {{ transaction.type }}
                      td.px-6.py-4(class='hover:bg-secondary group')
                        span {{ transaction.shielded }}
                      td.px-6.py-4(class='hover:bg-secondary group')
                        span(v-if='transaction.status === "Fail"').border-red-500.text-red-500
                          | {{ transaction.status }}
                        span(v-else).border-green-500.text-green-500
                          | {{ transaction.status }}
                      td.px-6.py-4(class='hover:bg-secondary group')
                        span  {{ transaction.time }}
                
              .w-full.flex.justify-center(v-if='hasTransactionData')
                TableCaption.text-white.text-lg {{ ((transactionStore.currentPage - 1 ) * transactionStore.pageSize) + 1 }} - {{ transactionStore.currentPage * transactionStore.pageSize }} of {{ transactionStore.totalData }}
            
              .flex.justify-end.w-full
                .my-1(class='mr-2.5' @click="updateCurrentPage('prev')")
                  button#blockchainFilter.flex.items-center.justify-center.px-4.text-sm.font-semibold.text-white.transition-colors.border.rounded-lg.bg-third.dropdown-toggle.group.h-9.border-customBorder.font-display(class='hover:border-transparent hover:bg-secondary hover:text-white' data-bs-toggle='dropdown' aria-expanded='false')
                    icon(name='ic:baseline-arrow-back-ios')
                .my-1(class='mr-2.5' @click="updateCurrentPage('next')")
                  button#blockchainFilter.flex.items-center.justify-center.px-4.text-sm.font-semibold.text-white.transition-colors.border.rounded-lg.bg-third.dropdown-toggle.group.h-9.border-customBorder.font-display(class='hover:border-transparent hover:bg-secondary hover:text-white' data-bs-toggle='dropdown' aria-expanded='false')
                    icon(name='ic:baseline-arrow-forward-ios')
</template>

<style lang="scss" scoped>
input{
  @apply bg-third border-secondary/10;
}

input::placeholder {
  @apply text-white;
}
</style>
