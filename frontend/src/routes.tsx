import { createBrowserRouter } from "react-router-dom";
import Root from "./Root";
import Login from "./components/Login";
import Signup from "./components/Signup";
import { Home } from "./pages";
import Shop from "./pages/Shop/Shop";

export const router = createBrowserRouter([
    {
        path: "/",
        Component: Root,
        children: [
            {index: true, Component: Home},
            { path: "/shop", Component: Shop }
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