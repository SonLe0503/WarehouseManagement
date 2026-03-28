import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { request } from "../utils/request";
import type { RootState } from ".";
import type { IProduct } from "./productSlice";

export interface IStockCountSession {
    id: number;
    countNo: string;
    warehouseId: number;
    status: string;
    createdAt: string;
    note?: string;
}

export interface IStockCountItem {
    id: number;
    productId: number;
    storagePosition?: string;
    systemQuantity: number;
    actualQuantity?: number;
    difference?: number;
    reasonId?: number;
    note?: string;
    product?: IProduct;
    baseUnitId: number;
    baseUnitName: string;
}


export interface ICreateStockCountSession {
    note?: string;
}

export interface IUpdateActualQuantity {
    actualQuantity: number;
    reasonId?: number;
    note?: string;
}

type StockCountState = {
    sessions: IStockCountSession[];
    currentSessionItems: IStockCountItem[];
    loading: boolean;
    error?: string;
};

const initialState: StockCountState = {
    sessions: [],
    currentSessionItems: [],
    loading: false,
};

export const getStockCountSessions = createAsyncThunk(
    "stockCount/get-sessions",
    async (_, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;
            const res = await request({
                url: "/StockCount/sessions",
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            });
            return res.data as IStockCountSession[];
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const createStockCountSession = createAsyncThunk(
    "stockCount/create-session",
    async (data: ICreateStockCountSession, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;
            const res = await request({
                url: "/StockCount",
                method: "POST",
                data,
                headers: { Authorization: `Bearer ${token}` },
            });
            return res.data as IStockCountSession;
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);


export const generateStockCountItems = createAsyncThunk(
    "stockCount/generate-items",
    async ({ id, binIds }: { id: number; binIds: number[] }, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;
            await request({
                url: `/StockCount/sessions/${id}/generate-items`,
                method: "POST",
                data: { binIds },
                headers: { Authorization: `Bearer ${token}` },
            });
            return id;
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const getStockCountItems = createAsyncThunk(
    "stockCount/get-items",
    async (sessionId: number, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;
            const res = await request({
                url: `/StockCount/sessions/${sessionId}/items`,
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            });
            return res.data as IStockCountItem[];
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const updateActualQuantity = createAsyncThunk(
    "stockCount/update-actual-quantity",
    async ({ id, data }: { id: number; data: IUpdateActualQuantity }, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;
            await request({
                url: `/StockCount/items/${id}`,
                method: "PUT",
                data,
                headers: { Authorization: `Bearer ${token}` },
            });
            return { id, data };
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const approveStockCountSession = createAsyncThunk(
    "stockCount/approve-session",
    async (sessionId: number, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;
            await request({
                url: `/StockCount/sessions/${sessionId}/approve`,
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });
            return sessionId;
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

const stockCountSlice = createSlice({
    name: "stockCount",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getStockCountSessions.pending, (state) => { state.loading = true; state.error = undefined; })
            .addCase(getStockCountSessions.fulfilled, (state, action) => { state.loading = false; state.sessions = action.payload; })
            .addCase(getStockCountSessions.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

            .addCase(createStockCountSession.pending, (state) => { state.loading = true; })
            .addCase(createStockCountSession.fulfilled, (state, action) => { state.loading = false; state.sessions.unshift(action.payload); })
            .addCase(createStockCountSession.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

            .addCase(getStockCountItems.pending, (state) => { state.loading = true; })
            .addCase(getStockCountItems.fulfilled, (state, action) => { state.loading = false; state.currentSessionItems = action.payload; })
            .addCase(getStockCountItems.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

            .addCase(generateStockCountItems.pending, (state) => { state.loading = true; })
            .addCase(generateStockCountItems.fulfilled, (state) => { state.loading = false; })
            .addCase(generateStockCountItems.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

            .addCase(updateActualQuantity.pending, (state) => { state.loading = true; })
            .addCase(updateActualQuantity.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.currentSessionItems.findIndex(item => item.id === action.payload.id);
                if (index !== -1) {
                    state.currentSessionItems[index].actualQuantity = action.payload.data.actualQuantity;
                    state.currentSessionItems[index].reasonId = action.payload.data.reasonId;
                    state.currentSessionItems[index].note = action.payload.data.note;
                    state.currentSessionItems[index].difference = action.payload.data.actualQuantity - state.currentSessionItems[index].systemQuantity;
                }
            })
            .addCase(updateActualQuantity.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

            .addCase(approveStockCountSession.pending, (state) => { state.loading = true; })
            .addCase(approveStockCountSession.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.sessions.findIndex(s => s.id === action.payload);
                if (index !== -1) state.sessions[index].status = "Approved";
            })
            .addCase(approveStockCountSession.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
    },
});

export const selectStockCountSessions = (state: RootState) => state.stockCount.sessions;
export const selectStockCountItems = (state: RootState) => state.stockCount.currentSessionItems;
export const selectStockCountLoading = (state: RootState) => state.stockCount.loading;
export const selectStockCountError = (state: RootState) => state.stockCount.error;

export default stockCountSlice.reducer;