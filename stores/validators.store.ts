import { defineStore, acceptHMRUpdate } from 'pinia'
import { useFetch, useRuntimeConfig } from '#app'
import { h } from 'vue'
import type { Validator } from '@/models/validator.ts'
import { useToast } from '@/components/ui/toast/use-toast'
import { ToastAction } from '@/components/ui/toast'

export const useValidatorStore = defineStore('validators', {
  state: () => ({
    allValidators: [] as Validator[],
    validatorPagination: [] as Validator[],
    currentPage: 1,
    pageSize: 10,
    totalData: 1,
    isLoadingData: false,
  }),
  actions: {
    showErrToast(msg: string) {
      const { toast } = useToast()
      toast({
        title: `Uh oh! Something went wrong with ${msg}.`,
        duration: 2000,
        description: 'There was a problem with your request.',
        variant: 'destructive',
        action: h(
          ToastAction,
          {
            altText: 'Try again',
          },
          {
            default: () => 'Try again',
          },
        ),
      })
    },
    async fetchValidatorList() {
      try {
        const url =
          'https://namada-explorer-api.stakepool.dev.br/node/validators/list'
        const { data, error } = await useFetch(`${url}`)

        if (data.value) {
          this.allValidators = data.value.currentValidatorsList || []
          this.totalData = data.value.currentValidatorsList.length
        } else if (error.value) {
          this.showErrToast('fetching validator list')
        }
      } catch (error) {
        this.showErrToast('fetchValidatorList')
      }
    },
    addressExists(searchAddress: string) {
      return this.allValidators.some(
        (validator) =>
          validator.address.toLowerCase() ===
          searchAddress.trim().toLowerCase(),
      )
    },
    async paginationValidator(page: number, searchValue = '') {
      this.currentPage = page
      const start = (page - 1) * this.pageSize
      const end = start + this.pageSize

      const filteredValidators = searchValue.trim()
        ? this.allValidators.filter(
            (validator) =>
              validator.moniker
                .toLowerCase()
                .includes(searchValue.toLowerCase()) ||
              validator.address
                .toLowerCase()
                .includes(searchValue.toLowerCase()),
          )
        : this.allValidators

      const validatorsToPaginate = filteredValidators.slice(start, end)

      const validatorsDataPromises = validatorsToPaginate.map((validator) =>
        Promise.all([
          this.fetchValidatorUptime(validator.address),
          this.fetchValidatorSignature(validator.address),
        ]).then(([uptime, commitSignature]) => ({
          ...validator,
          uptime,
          commitSignature,
          voting_percentage: parseFloat(validator.voting_percentage.toFixed(2)),
        })),
      )

      const updatedValidators = await Promise.all(validatorsDataPromises)
      const uniqueValidators = updatedValidators.filter(
        (newValidator: any) =>
          !this.validatorPagination.some(
            (existingValidator) =>
              existingValidator.address === newValidator.address,
          ),
      )

      if (uniqueValidators.length > 0) {
        // this.validatorPagination.push(...uniqueValidators)
        this.validatorPagination = [...uniqueValidators]
      }
    },
    async fetchValidatorUptime(address: string) {
      if (!address) return null
      try {
        const runtimeConfig = useRuntimeConfig()
        const baseURI = '/validator'
        const apiUrl = runtimeConfig.public.BASE_URL + baseURI
        const { data, error } = await useFetch(`${apiUrl}/${address}/uptime`, {
          params: {
            start: 0,
            end: 1000,
          },
        })
        if (error.value) throw error
        return data.value.uptime
      } catch (err) {
        this.showErrToast('Fetch validator uptime')
        return null
      }
    },
    async fetchValidatorSignature(address: string) {
      if (!address) return null
      try {
        const runtimeConfig = useRuntimeConfig()
        const baseURI = '/validator'
        const apiUrl = runtimeConfig.public.BASE_URL + baseURI
        const { data, error } = await useFetch(
          `${apiUrl}/${address}/commit_signatures`,
        )
        if (error.value) throw error
        return data.value
      } catch (err) {
        this.showErrToast('Fetch validator signature')
        return null
      }
    },
    shouldShowLoadMore(searchValue: string) {
      const filteredValidators = searchValue.trim()
        ? this.allValidators.filter(
            (validator) =>
              validator.moniker
                .toLowerCase()
                .includes(searchValue.toLowerCase()) ||
              validator.address
                .toLowerCase()
                .includes(searchValue.toLowerCase()),
          )
        : this.allValidators
      return this.currentPage * this.pageSize < filteredValidators.length
      // return true;
    },
    async fetchValidatorDetail(address: string) {
      if (!this.addressExists(address)) return
      if (!address.trim()) return null

      const validatorIndex = this.allValidators.findIndex(
        (v) => v.address.toLowerCase() === address.toLowerCase(),
      )

      if (validatorIndex === -1) {
        this.showErrToast(
          `Validator with specified address not found ${address}`,
        )
        return null
      }

      const validator = this.allValidators[validatorIndex]

      try {
        const [uptime, commit_signature] = await Promise.all([
          this.fetchValidatorUptime(address),
          this.fetchValidatorSignature(address),
        ])

        const updatedValidator = {
          ...validator,
          uptime,
          commit_signature,
          participation:
            parseFloat((validator.voting_percentage ?? 0).toFixed(2)) + '%',
        }
        delete updatedValidator.pub_key
        delete updatedValidator.proposer_priority
        delete updatedValidator.voting_percentage
        delete updatedValidator.operator_address
        return updatedValidator
      } catch (error) {
        console.error('Error fetching details for validator:', error)
        this.showErrToast(`fetching details for validator ${address}`)
        return null
      }
    },
    async fetchBlocksByAddress(address: string) {
      try {
        if (!this.addressExists(address)) return
        const url = `https://namada-explorer-api.stakepool.dev.br/node/validators/validator/${address}/latestSignatures`
        const { data, error } = await useFetch(`${url}`)

        if (data.value) {
          return data.value
        } else if (error.value) {
          this.showErrToast('fetch blocks')
        }
      } catch (error) {
        this.showErrToast('fetch blocks')
      }
    },
    async fetchLatestSignatures(address: string) {
      try {
        if (!this.addressExists(address)) return

        const apiUrl = `https://namada-explorer-api.stakepool.dev.br/node/validators/validator/${address}/latestSignatures`
        const { data, error } = await useFetch(`${apiUrl}`)

        if (data.value) {
          return data.value
        } else if (error.value) {
          this.showErrToast('fetch latest block')
        }
      } catch (error) {
        this.showErrToast('fetch latest block')
      }
    },
  },
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useValidatorStore, import.meta.hot))
}
