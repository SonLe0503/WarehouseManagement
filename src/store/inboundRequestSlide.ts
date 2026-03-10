import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { request } from "../utils/request";
import type { RootState } from "./index";

export interface InboundRequestItem {
    id: number;
    inboundRequestId: number;
    productId: number;
    quantity: number;
    receivedQuantity: number;
    storagePosition: string;
    lineNote: string;
    unitId: number;
    unitName: string;
    unitCode: string;
}

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

export interface BinQuantityDto {
    storagePosition: string;
    quantity: number;
}

export interface ReceiveInboundItemDto {
    inboundItemId: number;
    totalReceivedQuantity: number;
    binQuantities: BinQuantityDto[];
    lineNote?: string;
}

export interface ReceiveInboundRequestDto {
    items: ReceiveInboundItemDto[];
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

export const getInboundRequests = createAsyncThunk(
    "inboundRequest/get-all",
    async (_, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;

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

export const approveRejectRequest = createAsyncThunk(
    "inboundRequest/approve-reject",
    async (
        { id, action }: { id: number; action: "Approve" | "Reject" },
        { rejectWithValue, getState }
    ) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;

            await request({
                url: `/InboundRequest/${id}/approval`,
                method: "POST",
                data: { action },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return { id, action };
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const receiveGoods = createAsyncThunk(
    "inboundRequest/receive-goods",
    async (
        { id, data }: { id: number; data: ReceiveInboundRequestDto },
        { rejectWithValue, getState }
    ) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;

            await request({
                url: `/InboundRequest/${id}/receive`,
                method: "POST",
                data,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return { id };
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
            })

            .addCase(approveRejectRequest.pending, (state) => {
                state.loading = true;
                state.error = undefined;
            })
            .addCase(approveRejectRequest.fulfilled, (state, action) => {
                state.loading = false;
                const req = state.requests.find((r) => r.id === action.payload.id);
                if (req) {
                    req.status = action.payload.action === "Approve" ? "Approved" : "Rejected";
                    req.approvedAt = new Date().toISOString();
                }
            })
            .addCase(approveRejectRequest.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            .addCase(receiveGoods.pending, (state) => {
                state.loading = true;
                state.error = undefined;
            })
            .addCase(receiveGoods.fulfilled, (state, action) => {
                state.loading = false;
                const req = state.requests.find((r) => r.id === action.payload.id);
                if (req) {
                    req.status = "Completed";
                }
            })
            .addCase(receiveGoods.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const selectInboundRequests = (state: RootState) => state.inboundRequest.requests;
export const selectInboundRequestLoading = (state: RootState) => state.inboundRequest.loading;

export default inboundRequestSlice.reducer;