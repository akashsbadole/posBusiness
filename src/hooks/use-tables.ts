import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tableApi } from '@/services/api'
import { usePOSStore } from '@/store'

export const useTables = (restaurantId: string, outletId?: string) => {
  const setTables = usePOSStore((state) => state.setTables)
  
  return useQuery({
    queryKey: ['tables', restaurantId, outletId],
    queryFn: async () => {
      const response = await tableApi.getAll(restaurantId, outletId)
      setTables(response.data)
      return response.data
    },
    enabled: !!restaurantId,
  })
}

export const useCreateTable = () => {
  const queryClient = useQueryClient()
  const addTable = usePOSStore((state) => state.addTable)
  
  return useMutation({
    mutationFn: tableApi.create,
    onSuccess: (response) => {
      addTable(response.data)
      queryClient.invalidateQueries({ queryKey: ['tables'] })
    },
  })
}

export const useUpdateTable = () => {
  const queryClient = useQueryClient()
  const updateTable = usePOSStore((state) => state.updateTable)
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      tableApi.update(id, data),
    onSuccess: (response, { id }) => {
      updateTable(id, response.data)
      queryClient.invalidateQueries({ queryKey: ['tables'] })
    },
  })
}

export const useDeleteTable = () => {
  const queryClient = useQueryClient()
  const deleteTable = usePOSStore((state) => state.deleteTable)
  
  return useMutation({
    mutationFn: tableApi.delete,
    onSuccess: (_, id) => {
      deleteTable(id)
      queryClient.invalidateQueries({ queryKey: ['tables'] })
    },
  })
}