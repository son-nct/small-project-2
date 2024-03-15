<script setup lang="ts">
import { onMounted, ref, watch, computed } from "vue";
import { useAsyncData, useLazyAsyncData, useRuntimeConfig } from "#app";
import { Loader2 } from "lucide-vue-next";
import _ from "lodash";
import ShieldedHeader from "~/components/molecules/ShieldedHeader.vue";
import Loading from "~/components/ui/loading/index.vue";

import { useRouter } from "vue-router";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useValidatorStore } from "~/stores/validators.store";
// COMMIT SIGNATURES,	PARTICIPATION
const header = [
  "No",
  "Validator",
  "Moniker",
  "Up Time",
  "Voting Power",
  "Commit Signatures",
  "Participation",
];

const searchValue = ref("");
const currentPage = ref(1);
const isLoading = ref(false);
const isSearching = ref(false);

const validatorStore = useValidatorStore();

if (validatorStore.allValidators.length === 0) {
  const { data: allValidators } = await useAsyncData("all-validators", () =>
    validatorStore.fetchValidatorList()
  );
}

const { data: paginatedValidators } = await useAsyncData(
  `validators-pagination-${currentPage.value}`,
  () => validatorStore.paginationValidator(currentPage.value)
);

const isShowLoadMore = () => {
  return validatorStore.shouldShowLoadMore(searchValue.value);
};

const loadMoreData = async () => {
  isLoading.value = true;
  currentPage.value += 1;
  await validatorStore.paginationValidator(currentPage.value);
  isLoading.value = false;
};

const setLoading = (status: boolean) => (isLoading.value = status);

const updateCurrentPage = async (type: string) => {
  //   let newData = [];
  if (isLoading.value) return;
  switch (type) {
    case "next":
      if (
        currentPage.value * validatorStore.pageSize <
        validatorStore.totalData
      ) {
        setLoading(true);
        currentPage.value += 1;
        await validatorStore.paginationValidator(currentPage.value);
      }
      break;
    case "prev":
      if (currentPage.value > 1) {
        setLoading(true);
        currentPage.value -= 1;
        await validatorStore.paginationValidator(currentPage.value);
      }
      break;
    default:
      break;
  }
  setLoading(false);
};

const paginatedValidatorsBySearch = async () => {
  currentPage.value = 1;
  await validatorStore.paginationValidator(
    currentPage.value,
    searchValue.value
  );
  isSearching.value = false;
};
const debouncedUpdateProducts = _.debounce(paginatedValidatorsBySearch, 500);

const hasValidatorData = computed(
  () => validatorStore.validatorPagination.length > 0
);

const router = useRouter();

const navigateToAddress = (address: string) => {
  // router.push({
  //   name: "validators-address",
  //   params: { address },
  // });
  if (!address) return {};
  return {
    name: "validators-address",
    params: { address },
  };
};

watch(
  () => searchValue.value,
  (newVal: string) => {
    isSearching.value = true;
    validatorStore.validatorPagination = [];
    debouncedUpdateProducts();
  }
);

const listPageSize = [10, 20, 50];

const changePageSize = async (numberSize: number) => {
  isSearching.value = true;
  validatorStore.pageSize = numberSize;
  await validatorStore.paginationValidator(1);
  isSearching.value = false;
};
</script>

<template lang="pug">
main
  article
    section.relative.overflow-hidden.min-h-screen
      .container(class='z-10 p-8 mx-auto lg:p-10')
        div(class='relative w-full h-fit rounded-3xl')
          .flex.flex-col.items-center.justify-center.gap-10.w-full
            h2.uppercase.font-ultraBold.text-white.text-center
              | Validators

            //- Seach bar
            div.w-full.flex.items-start
              label.sr-only(for='simple-search') Search
              .relative.w-full.min-w-80
                .absolute.inset-y-0.start-0.flex.items-center.ps-3.pointer-events-none.text-white
                  Icon(name="ic:baseline-search" size="1.5rem")
                input#simple-search.border.text-white.text-sm.block.w-full.ps-10.rounded-l-lg(type='text' @keyup.enter='searchByTransactionHash' v-model='searchValue'  class='p-4 focus:ring-blue-500 focus:border-secondary' placeholder='Search by validator or moniker...' required='')
              button(type='button' class='hidden w-full px-6 py-3 text-white rounded-r-lg cursor-pointer bg-secondary font-ultraBold lg:w-fit h-14 lg:block' @click='debouncedUpdateProducts') Search


            //- Table
            div(class="relative w-full overflow-x-auto rounded-s-none" v-if='!isSearching && hasValidatorData')
              div(v-if="isLoading" class="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white rounded-2xl bg-blue-950/50")
                Loading
                h1 Loading

              table.w-full.text-sm.text-left.text-white(class='lg:rounded-2xl bg-[#363a5d]')
                thead.text-xs.text-gray-700.uppercase.bg-gray-50
                  tr
                    th.px-6.py-3(v-for='text in header' :key='text' scope='col')
                      | {{ text }}
                tbody
                  tr(v-for='(validator, index) in validatorStore.validatorPagination' :key='index' class='bg-[#13163f] border-b-[0.5px] !border-slate-500/50 hover:cursor-pointer')
                    th.px-6.py-4.font-medium.text-gray-900.whitespace-nowrap(scope='row')
                      span
                        | {{ validatorStore.currentPage * validatorStore.pageSize +  index +  1 - validatorStore.pageSize       }}
                        
                       
                
                    td.px-6.py-4.text-green-500
                      NuxtLink(:to='navigateToAddress(validator.address)') {{ validator.address }}
                    td.px-6.py-4
                      span {{ validator.moniker}}
                    td.px-6.py-4
                      span {{ validator.uptime }}
                    td.px-6.py-4
                      span {{ validator.voting_power }}
                    td.px-6.py-4
                      span {{ validator.commitSignature }}
                    td.px-6.py-4
                      span {{ validator.voting_percentage }}%
              p.my-2.text-center.text-white
                | {{ ((validatorStore.currentPage - 1) * validatorStore.pageSize) + 1 }} - {{ validatorStore.currentPage * validatorStore.pageSize }} of {{ validatorStore.totalData }}

              //- Action
              .flex.justify-end.w-full.mt-4
                .my-1(class='mr-2.5' @click="updateCurrentPage('prev')")
                  button#blockchainFilter.flex.items-center.justify-center.px-4.text-sm.font-semibold.text-white.transition-colors.border.rounded-lg.bg-third.dropdown-toggle.group.h-9.border-customBorder.font-display(class='hover:border-transparent hover:bg-secondary hover:text-white' data-bs-toggle='dropdown' aria-expanded='false')
                    icon(name='ic:baseline-arrow-back-ios')
                .my-1(class='mr-2.5' @click="updateCurrentPage('next')")
                  button#blockchainFilter.flex.items-center.justify-center.px-4.text-sm.font-semibold.text-white.transition-colors.border.rounded-lg.bg-third.dropdown-toggle.group.h-9.border-customBorder.font-display(class='hover:border-transparent hover:bg-secondary hover:text-white' data-bs-toggle='dropdown' aria-expanded='false')
                    icon(name='ic:baseline-arrow-forward-ios')


                h3(v-if='!isSearching && !hasValidatorData').font-ultraBold.text-white.text-center.text-3xl  No Data Found  

                //- div.flex.items-center.gap-4(v-if='isShowLoadMore() && hasValidatorData')
                //-   Select
                //-     SelectTrigger(class='text-white bg-transparent w-fit border-neutral bg-primary')
                //-       SelectValue(placeholder="Choose number to load more")
                //-     SelectContent
                //-       SelectGroup
                //-         SelectLabel Number To Load More
                //-         SelectItem(:value='`${number}`' @click='changePageSize(number)' v-for='number in listPageSize' :key='number') {{ number }} items
                //- Button.flex.items-center.text-white(@click='loadMoreData' v-if='!isSearching')
                //-   span(class='-translate-y-[2px] ')
                //-     Loader2(class="w-4 h-4 mr-2 text-red-200 animate-spin" v-if='isLoading')
                //-   | Load More
            
            
                 
</template>

<style lang="scss" scoped>
input {
  @apply bg-third border-secondary/10;
}

input::placeholder {
  @apply text-white;
}
</style>
