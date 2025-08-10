import { useQuery, useMutation } from '@tanstack/react-query'

interface InvoiceCustomizations {
  logo?: string
  headerColor?: string
  accentColor?: string
  showGST?: boolean
  showDiscount?: boolean
  customFooter?: string
  customHeader?: string
}

interface InvoiceData {
  orderId: string
  template?: string
  customizations?: InvoiceCustomizations
}

export const useInvoice = (orderId: string, restaurantId?: string) => {
  return useQuery({
    queryKey: ['invoice', orderId, restaurantId],
    queryFn: async () => {
      const params = new URLSearchParams({ orderId })
      if (restaurantId) params.append('restaurantId', restaurantId)
      
      const response = await fetch(`/api/invoices?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch invoice data')
      }
      return response.json()
    },
    enabled: !!orderId,
  })
}

export const useGenerateInvoice = () => {
  return useMutation({
    mutationFn: async (data: InvoiceData) => {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        throw new Error('Failed to generate invoice')
      }
      
      return response.json()
    },
  })
}

export const useDownloadInvoice = () => {
  return useMutation({
    mutationFn: async (data: InvoiceData) => {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        throw new Error('Failed to generate invoice for download')
      }
      
      const result = await response.json()
      
      // Create blob and download
      const blob = new Blob([result.html], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `invoice-${result.orderNumber}.html`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      return result
    },
  })
}

export const usePrintInvoice = () => {
  return useMutation({
    mutationFn: async (data: InvoiceData) => {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        throw new Error('Failed to generate invoice for printing')
      }
      
      const result = await response.json()
      
      // Create print window
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(result.html)
        printWindow.document.close()
        printWindow.print()
        printWindow.close()
      }
      
      return result
    },
  })
}