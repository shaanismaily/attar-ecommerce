import { useCallback, useEffect, useState } from "react"
import { getOrders, type Order } from "../api/order"
import axios from "axios"

function useOrder() {
  const [orders, setOrders] = useState<Order[] | []>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const refetch = useCallback( async(signal?: AbortSignal) => {

    if (signal?.aborted)
        return;

    setLoading(true)
    setError("")

    try {
        const response = await getOrders(signal)
        setOrders(response.data.data)
    } catch (error) {
        if (axios.isCancel(error)) {
          return;
        }

        if (signal?.aborted) {
          return;
        }

        if (axios.isAxiosError(error)) {
            setError(error?.response?.data?.message ?? error.message)
        } else {
            setError("Could not get orders")
        }
    } finally {
        if (!signal?.aborted) {
            setLoading(false)
        }
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    refetch(controller.signal)

    return () => {
        controller.abort()
    }
  }, [refetch])

  return { refetch, loading, error, orders }
}

export default useOrder