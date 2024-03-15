import { defineStore, acceptHMRUpdate } from "pinia";
import { useFetch, useNuxtApp, useRuntimeConfig } from "#app";
import { h } from "vue";
import { useToast } from "@/components/ui/toast/use-toast";
import { ToastAction } from "@/components/ui/toast";

interface Block {
  block_id: string;
  header: Header;
  last_commit: LastCommit;
  tx_hashes: TxHash[];
}

interface Header {
  version: Version;
  chain_id: string;
  height: string;
  time: string;
  last_block_id: BlockID;
  last_commit_hash: string;
  data_hash: string;
  validators_hash: string;
  next_validators_hash: string;
  consensus_hash: string;
  app_hash: string;
  last_results_hash: string;
  evidence_hash: string;
  proposer_address: string;
}

interface Version {
  block: string;
  app: string;
}

interface BlockID {
  hash: string;
  parts: Parts;
}

interface Parts {
  total: number;
  hash: string;
}

interface LastCommit {
  height: string;
  round: string;
  block_id: BlockID;
}

interface TxHash {
  tx_type: string;
  hash_id: string;
}

export const useBlocksStore = defineStore("blocks", {
  state: () => ({
    latestBlocks: [] as Block[],
    currentPage: 1,
    pageSize: 10,
    totalData: 1,
    isLoadingData: false,
  }),
  actions: {
    showErrToast(msg: string) {
      const { toast } = useToast();
      toast({
        title: `Uh oh! Something went wrong with ${msg}.`,
        duration: 2000,
        description: "There was a problem with your request.",
        variant: "destructive",
        action: h(
          ToastAction,
          {
            altText: "Try again",
          },
          {
            default: () => "Try again",
          }
        ),
      });
    },
    formatTimeAgo(dateTime: string) {
      if (!dateTime) return;
      const nuxtApp = useNuxtApp();
      const timeAgo = nuxtApp.$TimeFormatter;
      const date = new Date(dateTime).getTime();
      return timeAgo.format(date);
    },
    normalizeBlockData(block: Block) {
      if (!block) return null;
      return {
        hash: block.block_id,
        height: block.header.height,
        txs: block.tx_hashes.length,
        proposer: block.header.proposer_address,
        time: block.header.time ? this.formatTimeAgo(block.header.time) : null,
      };
    },
    async fetchLatestBlocksList() {
      try {
        const runtimeConfig = useRuntimeConfig();
        const baseURI = "/block";
        const apiUrl = runtimeConfig.public.NAMANDA_BASE_URL + baseURI;

        const { data, error } = await useFetch(`${apiUrl}`, {
          params: {
            page: this.currentPage,
            size_of_page: this.pageSize,
          },
          lazy: true,
        });

        if (data.value) {
          if (this.currentPage === 1) {
            this.totalData = data.value.total
          }
          return data.value.data;
        } else if (error.value) {
          this.showErrToast("fetch block list");
        }
      } catch (error) {
        this.showErrToast("fetch block list");
      }
    },
    async fetchBlockDetailByHeight(height: string) {
      try {
        const runtimeConfig = useRuntimeConfig();
        const baseURI = "/block/height";
        const apiUrl = runtimeConfig.public.BASE_URL + baseURI;

        const { data, error } = await useFetch(`${apiUrl}/${height}`);
        if (data.value) {
          return data.value;
        } else if (error.value) {
          this.showErrToast("fetch block detail");
        }
      } catch (error) {
        this.showErrToast("fetch block detail");
      }
    },
    paginatedBlocks() {
      const start = (this.currentPage - 1) * this.pageSize;
      const end = start + this.pageSize;
      return {
        start: start + 1,
        end,
        data: this.latestBlocks.slice(start, end),
        totalPage: this.latestBlocks.length / this.pageSize,
      };
    },
    // addressExists(searchAddress: string) {
    //   return this.allValidators.some(
    //     (validator) =>
    //       validator.address.toLowerCase() === searchAddress.trim().toLowerCase()
    //   );
    // },
    async paginationBlocks(page: number, searchValue = "") {
      try {
        const runtimeConfig = useRuntimeConfig();
        const baseURI = "/block";
        const apiUrl = runtimeConfig.public.NAMANDA_BASE_URL + baseURI;

        const { data, error } = useFetch(apiUrl, {
          params: {
            page,
            size_of_page: this.pageSize,
          },
        });
      } catch (e) {
        this.showErrToast("fetchValidatorList");
      }
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useBlocksStore, import.meta.hot));
}
