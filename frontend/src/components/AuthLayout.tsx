import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export function Protected ({ children, authentication=true }) {
    const authStatus = useSelector(state => state.auth.status)
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