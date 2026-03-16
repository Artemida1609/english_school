import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

interface Purchase {
  icon: string;
  name: string;
  date: string;
}

interface ShopState {
  balance: number;
  purchases: Purchase[];
}

const initialState: ShopState = {
  balance: 0,
  purchases: [],
};

export const shopSlice = createSlice({
  name: "shop",
  initialState,
  reducers: {
    setBalance: (state, action: PayloadAction<number>) => {
      state.balance = action.payload;
    },
    addPurchase: (
      state,
      action: PayloadAction<{ icon: string; title: string; createdAt?: string }>
    ) => {
      const { icon, title, createdAt } = action.payload;
      const date =
        createdAt ??
        new Date().toLocaleDateString("uk", { day: "numeric", month: "long" });
      state.purchases.unshift({
        icon,
        name: title,
        date,
      });
    },
  },
});

export const { setBalance, addPurchase } = shopSlice.actions;
export default shopSlice.reducer;