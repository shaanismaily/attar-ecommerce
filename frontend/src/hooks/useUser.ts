import { useCallback, useEffect, useState } from "react";
import { getCurrentUser, type User } from "../api/auth";
import axios from "axios";

function useUser() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const refetch = useCallback( async(signal?: AbortSignal) => {
        if (signal?.aborted)
            return;

        setLoading(true);
        setError("");

        try {
            const response = await getCurrentUser(signal)
            setUser(response.data.data);

        } catch (error) {
            if (axios.isCancel(error))
                return;
            
            if (signal?.aborted)
                return;

            if (axios.isAxiosError(error)) {
                setError(error.response?.data?.message || error.message)
            }
            else {
                setError("could not get user")
            }
        } finally {
            if (!signal?.aborted) {
                setLoading(false)
            }
        }
    }, [])

    useEffect(() => {
        const controller = new AbortController();
        refetch(controller.signal)

        return () => {
            controller.abort()
        }
    }, [refetch])

    return { user, loading, error, refetch };
}

export default useUser