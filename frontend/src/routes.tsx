import { createBrowserRouter } from "react-router-dom";
import Root from "./Root";
import Login from "./components/Login";
import Signup from "./components/Signup";
import { 
    Home,
    Shop,
    ProductDetailPage,
} from "./pages";
import Cart from "./pages/Cart/Cart";
import Checkout from "./pages/Checkout/Checkout";
import { AdminProtected, Protected } from "./components/AuthLayout";
import UserDashboard from "./pages/UserDashboard/UserDashboard";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Products from "./pages/Admin/Products";
import Dashboard from "./pages/Admin/Dashboard";
import Categories from "./pages/Admin/Categories";
import Orders from "./pages/Admin/Orders";
import AdminLayout from "./components/AdminLayout";

export const router = createBrowserRouter([
    {
        path: "/",
        Component: Root,
        children: [
            {index: true, Component: Home},
            { path: "shop", Component: Shop },
            { path: "product/:slug", Component: ProductDetailPage },
            { path: "cart", Component: Cart },
            { path: "about", Component: About },
            { path: "contact", Component: Contact },
            {
                path: "checkout",
                element: (
                    <Protected authentication={true}>
                        <Checkout />
                    </Protected>
                )
            },
            {
                path: "dashboard",
                element: (
                    <Protected authentication={true}>
                        <UserDashboard />
                    </Protected>
                )
            },
            {
                path: "dashboard/:section",
                element: (
                    <Protected authentication={true}>
                        <UserDashboard />
                    </Protected>
                )
            },
        ]
    },
    {
        path: "/admin",
        element: (
            <AdminProtected>
                <AdminLayout />
            </AdminProtected>
        ),
        children: [
            { index: true, Component: Dashboard },
            { path: "products", Component: Products },
            { path: "categories", Component: Categories },
            { path: "orders", Component: Orders },
        ],
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
