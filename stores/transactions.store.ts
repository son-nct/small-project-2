import { defineStore, acceptHMRUpdate } from "pinia";
import { useFetch, useLazyFetch, useNuxtApp, useRuntimeConfig } from "#app";
import { h } from "vue";
import { useToast } from "@/components/ui/toast/use-toast";
import { ToastAction } from "@/components/ui/toast";

interface Transaction {
  hash: string;
  block_id: string;
  tx_type: string;
  wrapper_id: string;
  fee_amount_per_gas_unit: string;
  fee_token: string;
  gas_limit_multiplier: number;
  code: string;
  data: string;
  return_code: null | number;
  tx: TxContent;
}

interface TransactionsResponse {
  data: Transaction[];
  total: number;
}

interface TxContent {
  VoteProposal?: VoteProposal;
}

interface VoteProposal {
  id: number;
  vote: string;
  voter: string;
  delegations: string[];
}

export const useTransactionStore = defineStore("transactions", {
  state: () => ({
    latestTransaction: [] as Transaction[],
    rawData: "" as string,
    currentPage: 1,
    pageSize: 10,
    totalData: 0,
  }),
  actions: {
    showCopiedToast() {
      const { toast } = useToast();
      toast({
        title: "Copied !",
        duration: 1000,
      });
    },
    showErrToast(msg: string) {
      const { toast } = useToast();
      toast({
        duration: 2000,
        title: `Uh oh! Something went wrong with ${msg}.`,
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
    async fetchLatestTransactionList() {
      try {
        const runtimeConfig = useRuntimeConfig();
        const baseURI = "/tx";
        const apiUrl = runtimeConfig.public.NAMANDA_BASE_URL + baseURI;

        const { data, error } = await useFetch(`${apiUrl}`, {
          params: {
            page: this.currentPage,
            size_of_page: this.pageSize,
          },
        });

        if (data.value as TransactionsResponse) {
          const newData = await this.normalizeTransactionData(data.value.data);
          this.latestTransaction = [...newData];

          if (this.currentPage === 1) {
            this.totalData = data.value.total;
          }
          // return data.value.data;
        } else if (error.value) {
          this.showErrToast("fetch transaction list");
        }
      } catch (error) {
        this.showErrToast("fetch transaction list");
      }
    },
    formatTimeAgo(dateTime: string) {
      if (!dateTime) return;
      const nuxtApp = useNuxtApp();
      const timeAgo = nuxtApp.$TimeFormatter;
      const date = new Date(dateTime).getTime();
      return timeAgo.format(date);
    },
    async normalizeTransactionData(transactions: Transaction[]) {
      if (!transactions) return null;

      const transactionsPromises = transactions.map(
        async (transaction: Transaction) => {
          const { height, time } = await this.fetchLatestHeightBlockById(
            transaction.block_id
          ); // Await the height here
          return {
            tx: transaction.hash,
            type:
              transaction.tx && Object.keys(transaction.tx).length > 0
                ? Object.keys(transaction.tx)[0]
                : transaction?.tx_type,
            shielded:
              transaction.tx?.Transfer && transaction.tx.Transfer?.shielded
                ? "Yes"
                : "No",
            status: transaction.tx_type === "Wrapper" ? "Success" : "Fail",
            height, // Use the awaited height
            time: this.formatTimeAgo(time),
          };
        }
      );

      const transactionWithBlock = await Promise.all(transactionsPromises);
      return transactionWithBlock;
    },
    async fetchLatestHeightBlockById(blockId: string) {
      const runtimeConfig = useRuntimeConfig();
      const baseURI = "/block/hash";
      const apiUrl = runtimeConfig.public.NAMANDA_BASE_URL + baseURI;
      try {
        const { data, error } = await useFetch(`${apiUrl}/${blockId}`);

        if (data.value) {
          return {
            time: data.value.header.time,
            height: data.value.header.height,
          };
        } else if (error.value) {
          this.showErrToast("fetch block by Id");
        }
      } catch (error) {
        this.showErrToast("fetch block by Id");
      }
    },
    async normalizeTransactionByHash(data: Transaction) {
      if (!data) return;
      const { time, height } = await this.fetchLatestHeightBlockById(
        data.block_id
      );

      return {
        chan_id: "shielded-expedition.88f17d1d14",
        tx_hash: data.hash,
        status:
          data?.return_code === 0 || data?.tx_type == "Wrapper"
            ? "Success"
            : "Fail",
        height,
        time,
        fee: `${data.fee_amount_per_gas_unit ?? 0} NAAN`,
        "gas (used / wanted)": data?.gasUsed
          ? `${data.gasUsed} / ${data.gasWanted}`
          : "0 / 0",
        shielded:
          data.data?.Transfer && data.data.Transfer?.shielded ? "Yes" : "No",
      };
    },
    async fetchTransactionByHash(hash: string) {
      const runtimeConfig = useRuntimeConfig();
      const baseURI = "/tx";
      const apiUrl = runtimeConfig.public.NAMANDA_BASE_URL + baseURI;

      try {
        const { data, error } = await useFetch(`${apiUrl}/${hash}`);
        const transaction = data.value as Transaction;
        this.updateRawData(transaction);
        return transaction;
        // return await this.normalizeTransactionByHash(transaction);
      } catch (error) {}
    },
    updateRawData(data: Transaction) {
      const rawData = {
        hash: data.hash,
        blockId: data.block_id,
        gasWanted: "0",
        gasUsed: "0",
        returnCode: data.return_code,
        fee: data.fee_amount_per_gas_unit ? data.fee_amount_per_gas_unit : 0,
        data: data.data,
        tx:
          data.tx_type === "Decrypted" && data.tx && data.tx.Ibc
            ? {
                typeUrl: data.tx.Ibc.Any.type_url,
                value: [...data.tx.Ibc.Any.value.slice(0, 10), "..."],
              }
            : { ...data.tx },
        txType: data.tx_type,
      };
      this.rawData = JSON.stringify(rawData, null, 3);
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useTransactionStore, import.meta.hot));
}
