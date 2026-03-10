import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { request } from "../utils/request";
import type { RootState } from ".";


export interface IStockTransferItem {
    id: number;
    productId: number;
    productName?: string;
    productSku?: string;
    unitId: number;
    unitName?: string;
    unitCode?: string;
    quantity: number;
    receivedQuantity?: number;
    fromStoragePosition?: string;
    toStoragePosition?: string;
    lineNote?: string;
}

export interface IStockTransferRequest {
    id: number;
    transferNo: string;
    fromWarehouseId: number;
    fromWarehouseName?: string;
    toWarehouseId: number;
    toWarehouseName?: string;
    status?: string;
    note?: string;
    createdBy: number;
    createdByUsername?: string;
    createdAt?: string;
    stockTransferItems: IStockTransferItem[];
}

export interface StockTransferItemCreateDto {
    productId: number;
    unitId: number;
    quantity: number;
    fromStoragePosition: string;
    toStoragePosition: string;
    lineNote?: string;
}

export interface StockTransferRequestCreateDto {
    warehouseId: number;
    note?: string;
    items: StockTransferItemCreateDto[];
}



type StockTransferState = {
    transfers: IStockTransferRequest[];
    currentTransfer?: IStockTransferRequest;
    loading: boolean;
    error?: string;
};

const initialState: StockTransferState = {
    transfers: [],
    loading: false,
};


export const getAllStockTransfers = createAsyncThunk(
    "stockTransfer/get-all",
    async (_, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const token = state.auth.infoLogin?.accessToken;
            const res = await request({
                url: "/StockTransfer",
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            });
            return res.data as IStockTransferRequest[];
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const getStockTransferById = createAsyncThunk(
    "stockTransfer/get-by-id",
    async (id: number, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const token = state.auth.infoLogin?.accessToken;
            const res = await request({
                url: `/StockTransfer/${id}`,
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            });
            return res.data as IStockTransferRequest;
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const createStockTransfer = createAsyncThunk(
    "stockTransfer/create",
    async (data: StockTransferRequestCreateDto, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const token = state.auth.infoLogin?.accessToken;
            const res = await request({
                url: "/StockTransfer",
                method: "POST",
                data,
                headers: { Authorization: `Bearer ${token}` },
            });
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);



const stockTransferSlice = createSlice({
    name: "stockTransfer",
    initialState,
    reducers: {
        clearCurrentTransfer: (state) => {
            state.currentTransfer = undefined;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getAllStockTransfers.pending, (state) => { state.loading = true; state.error = undefined; })
            .addCase(getAllStockTransfers.fulfilled, (state, action) => { state.transfers = action.payload; state.loading = false; })
            .addCase(getAllStockTransfers.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

            .addCase(getStockTransferById.pending, (state) => { state.loading = true; })
            .addCase(getStockTransferById.fulfilled, (state, action) => { state.currentTransfer = action.payload; state.loading = false; })
            .addCase(getStockTransferById.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

            .addCase(createStockTransfer.pending, (state) => { state.loading = true; state.error = undefined; })
            .addCase(createStockTransfer.fulfilled, (state) => { state.loading = false; })
            .addCase(createStockTransfer.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
    },
});

export const { clearCurrentTransfer } = stockTransferSlice.actions;
export const selectStockTransfers = (state: RootState) => state.stockTransfer.transfers;
export const selectStockTransferLoading = (state: RootState) => state.stockTransfer.loading;
export const selectCurrentTransfer = (state: RootState) => state.stockTransfer.currentTransfer;

export default stockTransferSlice.reducer;