// store/stockTransfer2StepSlice.ts
// Cross-warehouse transfer: Pending → Approve → Ship → Receive
// Backend route: /api/CrossWarehouseTransfer

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { request } from "../utils/request";
import type { RootState } from "./index";

export interface IStockTransferRequest {
    id: number;
    transferNo: string;
    fromWarehouseId: number;
    fromWarehouseName?: string;
    toWarehouseId: number;
    toWarehouseName?: string;
    status: string;
    createdAt: string;
    note: string;
    rejectReason?: string;
    createdBy?: number;
    approvedBy?: number;
    items?: IStockTransferItem[];
}

export interface IStockTransferItem {
    id: number;
    productId: number;
    unitId: number;
    unitName?: string;
    unitCode?: string;
    quantity: number;
    receivedQuantity?: number;
    fromStoragePosition?: string;
    toStoragePosition?: string;
    lineNote?: string;
    product?: {
        id: number;
        name: string;
        sku: string;
        baseUnitCode: string;
        createdAt: string;
    };
}

export interface StockTransferCreateDTO {
    fromWarehouseId: number;
    toWarehouseId: number;
    note: string;
    items: {
        productId: number;
        unitId: number;
        quantity: number;
        lineNote?: string;
    }[];
}

type StockTransferState = {
    requests: IStockTransferRequest[];
    currentRequest: IStockTransferRequest | null;
    loading: boolean;
    error?: string;
};

const initialState: StockTransferState = {
    requests: [],
    currentRequest: null,
    loading: false,
};

const BASE_URL = "/CrossWarehouseTransfer";

export const getMyStockTransfers = createAsyncThunk(
    "stockTransfer2Step/getAll",
    async (_, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const token = state.auth.infoLogin?.accessToken;
            const res = await request({
                url: BASE_URL,
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
    "stockTransfer2Step/getById",
    async (id: number, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const token = state.auth.infoLogin?.accessToken;
            const res = await request({
                url: `${BASE_URL}/${id}`,
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
    "stockTransfer2Step/create",
    async (data: StockTransferCreateDTO, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const token = state.auth.infoLogin?.accessToken;
            const res = await request({
                url: BASE_URL,
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

export const updateStockTransfer = createAsyncThunk(
    "stockTransfer2Step/update",
    async ({ id, data }: { id: number; data: StockTransferCreateDTO }, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const token = state.auth.infoLogin?.accessToken;
            const res = await request({
                url: `${BASE_URL}/${id}`,
                method: "PUT",
                data,
                headers: { Authorization: `Bearer ${token}` },
            });
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const deleteStockTransfer = createAsyncThunk(
    "stockTransfer2Step/delete",
    async (id: number, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const token = state.auth.infoLogin?.accessToken;
            await request({
                url: `${BASE_URL}/${id}`,
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            return id;
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const approveStockTransfer = createAsyncThunk(
    "stockTransfer2Step/approve",
    async (
        { id, action, comment }: { id: number; action: "Approve" | "Reject"; comment?: string },
        { rejectWithValue, getState }
    ) => {
        try {
            const state = getState() as RootState;
            const token = state.auth.infoLogin?.accessToken;
            const res = await request({
                url: `${BASE_URL}/${id}/approval`,
                method: "POST",
                data: { action, comment },
                headers: { Authorization: `Bearer ${token}` },
            });
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

const stockTransfer2StepSlice = createSlice({
    name: "stockTransfer2Step",
    initialState,
    reducers: {
        clearCurrentTransfer: (state) => {
            state.currentRequest = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getMyStockTransfers.pending, (state) => { state.loading = true; })
            .addCase(getMyStockTransfers.fulfilled, (state, action) => { state.requests = action.payload; state.loading = false; })
            .addCase(getMyStockTransfers.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

            .addCase(getStockTransferById.pending, (state) => { state.loading = true; state.currentRequest = null; })
            .addCase(getStockTransferById.fulfilled, (state, action) => { state.currentRequest = action.payload; state.loading = false; })
            .addCase(getStockTransferById.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

            .addCase(createStockTransfer.pending, (state) => { state.loading = true; })
            .addCase(createStockTransfer.fulfilled, (state) => { state.loading = false; })
            .addCase(createStockTransfer.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

            .addCase(updateStockTransfer.pending, (state) => { state.loading = true; })
            .addCase(updateStockTransfer.fulfilled, (state) => { state.loading = false; })
            .addCase(updateStockTransfer.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

            .addCase(deleteStockTransfer.pending, (state) => { state.loading = true; })
            .addCase(deleteStockTransfer.fulfilled, (state, action) => { state.requests = state.requests.filter(r => r.id !== action.payload); state.loading = false; })
            .addCase(deleteStockTransfer.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

            .addCase(approveStockTransfer.pending, (state) => { state.loading = true; })
            .addCase(approveStockTransfer.fulfilled, (state) => { state.loading = false; })
            .addCase(approveStockTransfer.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
    },
});

export const { clearCurrentTransfer } = stockTransfer2StepSlice.actions;
export const selectStockTransfers = (state: RootState) => (state.stockTransfer2Step as unknown as StockTransferState).requests;
export const selectCurrentTransfer = (state: RootState) => (state.stockTransfer2Step as unknown as StockTransferState).currentRequest;
export const selectStockTransferLoading = (state: RootState) => (state.stockTransfer2Step as unknown as StockTransferState).loading;
export default stockTransfer2StepSlice.reducer;