import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { request } from "../utils/request";
import type { RootState } from ".";

export interface IWarehouse {
    id: number;
    code: string;
    name: string;
}

type WarehouseState = {
    warehouses: IWarehouse[];
    loading: boolean;
    error?: string;
};

const initialState: WarehouseState = {
    warehouses: [],
    loading: false,
};

export const getActiveWarehouses = createAsyncThunk(
    "warehouse/get-active",
    async (_, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;

            const res = await request({
                url: "/warehouses",
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return res.data as IWarehouse[];
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

const warehouseSlice = createSlice({
    name: "warehouse",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getActiveWarehouses.pending, (state) => {
                state.loading = true;
                state.error = undefined;
            })
            .addCase(getActiveWarehouses.fulfilled, (state, action) => {
                state.warehouses = action.payload;
                state.loading = false;
            })
            .addCase(getActiveWarehouses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const selectWarehouses = (state: RootState) => state.warehouse.warehouses;
export const selectWarehouseLoading = (state: RootState) => state.warehouse.loading;

export default warehouseSlice.reducer;