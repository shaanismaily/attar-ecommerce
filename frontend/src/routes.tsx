import { createBrowserRouter } from "react-router-dom";
import Root from "./Root";
import Login from "./components/Login";
import Signup from "./components/Signup";
import { 
    Home,
    Shop,
    ProductDetailPage,
} from "./pages";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout/Checkout";
import { Protected } from "./components/AuthLayout";

export const router = createBrowserRouter([
    {
        path: "/",
        Component: Root,
        children: [
            {index: true, Component: Home},
            { path: "shop", Component: Shop },
            { path: "product/:slug", Component: ProductDetailPage },
            { path: "cart", Component: Cart },
            {
                path: "checkout",
                element: (
                    <Protected authentication={true}>
                        <Checkout />
                    </Protected>
                )
            }
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