import axios from "axios"
import { getVariants, type Variant } from "../api/variants"
import { useCallback, useEffect, useState } from "react"

function useVariants(productId: string) {
    const [variants, setVariants] = useState<Variant[]>([])
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)

    const refetch = useCallback( async() => {
        setError("")
        setLoading(true)

        try {
            const response = await getVariants(productId)
            setVariants(response.data.data)

        } catch (error) {
            if (axios.isAxiosError(error)) {
                setError(error.response?.data?.message ?? error.message)
            } else {
                setError("Could not fetch variants")
            }
        } finally {
            setLoading(false);
        }
    }, [productId])

    useEffect(() => {
        void refetch()
    }, [refetch])

    return { variants, error, loading, refetch }
}

export default useVariants;