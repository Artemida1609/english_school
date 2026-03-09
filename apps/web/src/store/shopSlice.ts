// store/shopSlice.ts
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
  balance: 350,
  purchases: [],
};

export const shopSlice = createSlice({
  name: "shop",
  initialState,
  reducers: {
    buyItem: (state, action: PayloadAction<{ icon: string; title: string; price: number }>) => {
      const { icon, title, price } = action.payload;
      if (state.balance < price) return;
      state.balance -= price;
      state.purchases.unshift({
        icon,
        name: title,
        date: new Date().toLocaleDateString("uk", { day: "numeric", month: "long" }),
      });
    },
  },
});

export const { buyItem } = shopSlice.actions;
export default shopSlice.reducer;