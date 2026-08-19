import { useCallback, useEffect, useState } from "react"
import { getAddresses, type Address } from "../api/addresses"
import axios from "axios"

function useAddress() {
  const [addresses, setAddresses] = useState<Address[] | []>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const refetch = useCallback( async(signal?: AbortSignal) => {

    if (signal?.aborted)
        return;

    setLoading(true)
    setError("")

    try {
        const response = await getAddresses(signal)
        setAddresses(response.data.data)
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
            setError("Could not get addresses")
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

  return { refetch, loading, error, addresses }
}

export default useAddress