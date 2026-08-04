import { useEffect, useState, type ReactNode } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState } from "../store/store";

type ProtectedProps = {
    children: ReactNode;
    authentication?: boolean;
};

export function Protected ({ children, authentication = true }: ProtectedProps) {
    const authStatus = useSelector((state: RootState) => state.auth.status)
    const navigate = useNavigate()

    const [loading, setLoading] = useState(true) 

    useEffect(() => {
      if (authentication && !authStatus) {
        navigate("/login")
      } 
      else if (!authentication && authStatus) {
        navigate("/")
      }
      else {
        setLoading(false)
      }
    }, [authStatus, navigate, authentication])
    
    return loading ? <p>Loading...</p> : <>{children}</>
}