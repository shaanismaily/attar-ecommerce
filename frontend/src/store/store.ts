import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./authSlice";
import cartSlice from "./cartSlice";
import checkoutSlice from "./checkoutSlice";

const store = configureStore({
    reducer: {
        auth: authSlice,
        cart: cartSlice,
        checkout: checkoutSlice
    }
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store