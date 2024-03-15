export const useUtils = () => ({
  uppercaseFirstCharacter: (str: string) => {
    if (!str && str.trim().length === 0) return str
    return str.charAt(0).toUpperCase() + str.slice(1)
  },
  truncateText: (text: string, startChars: number, endChars: number) => {
    if (text.length <= startChars + endChars) return text
    const start = text.substring(0, startChars)
    const end = text.substring(text.length - endChars)
    return `${start}...${end}`
  },
  formatDateTime: (dateTimeString: string) => {
    const date = new Date(dateTimeString)

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0') // getMonth() is zero-based
    const day = String(date.getDate()).padStart(2, '0')

    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const seconds = String(date.getSeconds()).padStart(2, '0')

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
  },
})
