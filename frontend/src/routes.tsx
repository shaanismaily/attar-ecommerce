import { createBrowserRouter } from "react-router-dom";
import Root from "./Root";
import Login from "./components/Login";
import Signup from "./components/Signup";
import { Home } from "./pages";

export const router = createBrowserRouter([
    {
        path: "/",
        Component: Root,
        children: [
            {index: true, Component: Home}

        ]
    },
    {
        path: "/login",
        Component: Login,
    },
    {
        path: "/register",
        Component: Signup
    }
])