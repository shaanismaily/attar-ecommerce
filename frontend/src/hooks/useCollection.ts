import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { getAllCollections, type Collection } from "../api/collections";

function useCollections() {
    const [collections, setCollections] = useState<Collection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const latestRequestId = useRef(0);

    const refetch = useCallback(async (signal?: AbortSignal) => {
        if (signal?.aborted) {
            return;
        }

        const requestId = ++latestRequestId.current;
        setLoading(true);
        setError(null);

        try {
            const response = await getAllCollections({ signal });

            if (requestId === latestRequestId.current) {
                setCollections(response.data.data);
            }
        } catch (error) {
            if (axios.isAxiosError(error) && error.code === "ERR_CANCELED") {
                return;
            }

            if (requestId !== latestRequestId.current) {
                return;
            }

            if (axios.isAxiosError(error)) {
                setError(error.response?.data?.message ?? error.message);
            } else {
                setError("Could not load collections");
            }
        } finally {
            if (requestId === latestRequestId.current && !signal?.aborted) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        void Promise.resolve().then(() => refetch(controller.signal));

        return () => controller.abort();
    }, [refetch]);

    return { collections, error, loading, refetch };
}

export default useCollections;
