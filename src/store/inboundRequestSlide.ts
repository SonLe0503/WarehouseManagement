import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { request } from "../utils/request";
import type { RootState } from "./index";

// Interface cho từng item trong Inbound Request
export interface InboundRequestItem {
    id: number;
    inboundRequestId: number;
    productId: number;
    quantity: number;
    receivedQuantity: number;
    storagePosition: string;
    lineNote: string;
}

// Interface chính cho Inbound Request
export interface InboundRequest {
    id: number;
    requestNo: string;
    supplierName: string;
    status: string;
    note: string;
    warehouseId: number;
    createdBy: number;
    approvedBy: number;
    approvedAt: string;
    createdAt: string;
    inboundItems: InboundRequestItem[];
}

type InboundRequestState = {
    requests: InboundRequest[];
    loading: boolean;
    error?: string;
};

const initialState: InboundRequestState = {
    requests: [],
    loading: false,
};

// Async thunk để lấy danh sách Inbound Requests
export const getInboundRequests = createAsyncThunk(
    "inboundRequest/get-all",
    async (_, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;

            // Giả sử API endpoint là /inbound-request. Cần điều chỉnh nếu backend khác.
            const res = await request({
                url: `/InboundRequest`,
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return res.data as InboundRequest[];
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

const inboundRequestSlice = createSlice({
    name: "inboundRequest",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getInboundRequests.pending, (state) => {
                state.loading = true;
                state.error = undefined;
            })
            .addCase(getInboundRequests.fulfilled, (state, action) => {
                state.requests = action.payload;
                state.loading = false;
            })
            .addCase(getInboundRequests.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const selectInboundRequests = (state: RootState) => state.inboundRequest.requests;
export const selectInboundRequestLoading = (state: RootState) => state.inboundRequest.loading;

export default inboundRequestSlice.reducer;
