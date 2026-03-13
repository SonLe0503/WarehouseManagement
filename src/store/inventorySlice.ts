import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { request } from "../utils/request";
import type { RootState } from ".";

export interface IInventory {
    id: number;
    productId: number;
    productName: string;
    sku: string;
    warehouseId: number;
    warehouseName: string;
    warehouseCode: string;
    quantity: number;
    storagePosition: string;
    updatedAt: string;
    unitId: number;
    unitName: string;
    unitCode: string;

}

type InventoryState = {
    inventories: IInventory[];
    currentInventory?: IInventory;
    bins: string[];
    loading: boolean;
    error?: string;
};

const initialState: InventoryState = {
    inventories: [],
    bins: [],
    loading: false,
};

export const getAllInventories = createAsyncThunk(
    "inventory/get-all",
    async (_, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;

            const res = await request({
                url: "/Inventories",
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return res.data as IInventory[];
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const getInventoryById = createAsyncThunk(
    "inventory/get-by-id",
    async (id: number, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;

            const res = await request({
                url: `/Inventories/${id}`,
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return res.data as IInventory;
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const getBinsByWarehouse = createAsyncThunk(
    "inventory/get-bins",
    async (warehouseId: number, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;

            const res = await request({
                url: `/Inventories/bins?warehouseId=${warehouseId}`,
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return res.data as string[];
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);


const inventorySlice = createSlice({
    name: "inventory",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getAllInventories.pending, (state) => {
                state.loading = true;
                state.error = undefined;
            })
            .addCase(getAllInventories.fulfilled, (state, action) => {
                state.inventories = action.payload;
                state.loading = false;
            })
            .addCase(getAllInventories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(getInventoryById.pending, (state) => {
                state.loading = true;

                state.error = undefined;

            })
            .addCase(getInventoryById.fulfilled, (state, action) => {
                state.currentInventory = action.payload;
                state.loading = false;
            })
            .addCase(getInventoryById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(getBinsByWarehouse.pending, (state) => {
                state.loading = true;
            })
            .addCase(getBinsByWarehouse.fulfilled, (state, action) => {
                state.bins = action.payload;
                state.loading = false;
            })
            .addCase(getBinsByWarehouse.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;

            });
    },
});

export const selectInventories = (state: RootState) => state.inventory.inventories;
export const selectInventoryLoading = (state: RootState) => state.inventory.loading;
export const selectCurrentInventory = (state: RootState) => state.inventory.currentInventory;
export const selectBins = (state: RootState) => state.inventory.bins;

export default inventorySlice.reducer;

