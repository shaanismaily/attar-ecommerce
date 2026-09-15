import { useEffect, useRef, type ReactNode } from "react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { getCurrentUser, refreshAccessToken } from "../api/auth";
import { login, sessionCheckComplete } from "../store/authSlice";

type AuthInitializerProps = {
  children: ReactNode;
};

/** Restores the cookie-backed session after a reload or Vite refresh. */
function AuthInitializer({ children }: AuthInitializerProps) {
  const dispatch = useDispatch();
  const hasStarted = useRef(false);

  useEffect(() => {
    // React Strict Mode runs effects twice in development. Refreshing a token twice can invalidate the first refresh token, so only run this once.
    if (hasStarted.current) return;
    hasStarted.current = true;

    const restoreSession = async () => {
      try {
        const response = await getCurrentUser();
        dispatch(login(response.data.data));
      } catch (error) {
        const isUnauthorized =
          axios.isAxiosError(error) && error.response?.status === 401;

        if (isUnauthorized) {
          try {
            await refreshAccessToken();
            const response = await getCurrentUser();
            dispatch(login(response.data.data));
          } catch {
            // No valid session is expected for visitors who are not signed in.
          }
        }
      } finally {
        dispatch(sessionCheckComplete());
      }
    };

    void restoreSession();
  }, [dispatch]);

  return <>{children}</>;
}

export default AuthInitializer;
