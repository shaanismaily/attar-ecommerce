import { useEffect, useState, type ReactNode } from "react";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import type { RootState } from "../store/store";

type ProtectedProps = {
    children: ReactNode;
    authentication?: boolean;
};

export function Protected ({ children, authentication = true }: ProtectedProps) {
    const authStatus = useSelector((state: RootState) => state.auth.status)
    const authInitialized = useSelector((state: RootState) => state.auth.initialized)
    const navigate = useNavigate()
    const location = useLocation()

    const [loading, setLoading] = useState(true) 

    useEffect(() => {
      if (!authInitialized) return;

      if (authentication && !authStatus) {
        navigate("/login", { state: { from: location }, replace: true })
      } 
      else if (!authentication && authStatus) {
        navigate("/")
      }
      else {
        setLoading(false)
      }
    }, [authStatus, authInitialized, navigate, authentication, location])
    
    return !authInitialized || loading ? <p>Loading...</p> : <>{children}</>
}
