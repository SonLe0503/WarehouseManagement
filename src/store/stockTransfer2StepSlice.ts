// store/stockTransferSlice.ts
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

export const getMyStockTransfers = createAsyncThunk(
    "stockTransfer/get-my-requests",
    async (_, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const token = state.auth.infoLogin?.accessToken;

            if (!token) {
                return rejectWithValue("No authentication token found");
            }

            const res = await request({
                url: `/stock-transfer-requests/my`,
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
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

            if (!token) {
                return rejectWithValue("No authentication token found");
            }

            const res = await request({
                url: `/stock-transfer-requests/${id}`,
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.data.Data) {
                return res.data.Data as IStockTransferRequest;
            }

            if (res.data.data) {
                return res.data.data as IStockTransferRequest;
            }

            return res.data as IStockTransferRequest;
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const createStockTransfer = createAsyncThunk(
    "stockTransfer/create-request",
    async (data: StockTransferCreateDTO, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const token = state.auth.infoLogin?.accessToken;

            if (!token) {
                return rejectWithValue("No authentication token found");
            }

            const res = await request({
                url: `/stock-transfer-requests`,
                method: "POST",
                data,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const updateStockTransfer = createAsyncThunk(
    "stockTransfer/update-request",
    async ({ id, data }: { id: number; data: StockTransferCreateDTO }, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const token = state.auth.infoLogin?.accessToken;

            if (!token) {
                return rejectWithValue("No authentication token found");
            }

            const res = await request({
                url: `/stock-transfer-requests/${id}`,
                method: "PUT",
                data,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const deleteStockTransfer = createAsyncThunk(
    "stockTransfer/delete-request",
    async (id: number, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const token = state.auth.infoLogin?.accessToken;

            if (!token) {
                return rejectWithValue("No authentication token found");
            }

            await request({
                url: `/stock-transfer-requests/${id}`,
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return id;
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
            state.currentRequest = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getMyStockTransfers.pending, (state) => {
                state.loading = true;
            })
            .addCase(getMyStockTransfers.fulfilled, (state, action) => {
                state.requests = action.payload;
                state.loading = false;
            })
            .addCase(getMyStockTransfers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(getStockTransferById.pending, (state) => {
                state.loading = true;
                state.currentRequest = null;
            })
            .addCase(getStockTransferById.fulfilled, (state, action) => {
                state.currentRequest = action.payload;
                state.loading = false;
            })
            .addCase(getStockTransferById.rejected, (state, action) => {
                state.loading = false;
                state.currentRequest = null;
                state.error = action.payload as string;
            })
            .addCase(createStockTransfer.pending, (state) => {
                state.loading = true;
            })
            .addCase(createStockTransfer.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(createStockTransfer.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(updateStockTransfer.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateStockTransfer.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(updateStockTransfer.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(deleteStockTransfer.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteStockTransfer.fulfilled, (state, action) => {
                state.requests = state.requests.filter(req => req.id !== action.payload);
                state.loading = false;
            })
            .addCase(deleteStockTransfer.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearCurrentTransfer } = stockTransferSlice.actions;
export const selectStockTransfers = (state: RootState) => state.stockTransfer.requests;
export const selectCurrentTransfer = (state: RootState) => state.stockTransfer.currentRequest;
export const selectStockTransferLoading = (state: RootState) => state.stockTransfer.loading;
export default stockTransferSlice.reducer;
