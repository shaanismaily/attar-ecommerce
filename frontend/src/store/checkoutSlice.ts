import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type CheckoutIntent =
  | {
      type: "cart";
    }
  | {
      type: "buyNow";
      variantId: string;
      quantity: number;
    };

interface CheckoutState {
  intent: CheckoutIntent | null;
}

const initialState: CheckoutState = {
  intent: null,
};

const checkoutSlice = createSlice({
  name: "checkout",
  initialState,
  reducers: {
    setCheckoutIntent: (state, action: PayloadAction<CheckoutIntent>) => {
        state.intent = action.payload;
    },
    clearCheckoutIntent: (state) => {
        state.intent = null;
    }
  },
});

export const { setCheckoutIntent, clearCheckoutIntent } = checkoutSlice.actions;
export default checkoutSlice.reducer;
