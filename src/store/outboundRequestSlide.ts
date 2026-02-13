import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { request } from "../utils/request";
import type { RootState } from "./index";

export interface OutboundRequestItem {
    id: number;
    outboundRequestId: number;
    productId: number;
    quantity: number;
    pickedQuantity: number;
    storagePosition: string;
    lineNote: string;
}

export interface OutboundRequest {
    id: number;
    requestNo: string;
    customerName: string;
    status: string;
    note: string;
    warehouseId: number;
    createdBy: number;
    approvedBy: number;
    approvedAt: string;
    createdAt: string;
    outboundItems: OutboundRequestItem[];
}

type OutboundRequestState = {
    requests: OutboundRequest[];
    loading: boolean;
    error?: string;
};

const initialState: OutboundRequestState = {
    requests: [],
    loading: false,
};

export const getOutboundRequests = createAsyncThunk(
    "outboundRequest/get-all",
    async (_, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;

            const res = await request({
                url: `/OutboundRequest`,
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return res.data as OutboundRequest[];
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const approveRejectOutboundRequest = createAsyncThunk(
    "outboundRequest/approve-reject",
    async (
        { id, action, comment, rejectReason }: { id: number; action: "Approve" | "Reject"; comment?: string; rejectReason?: string },
        { rejectWithValue, getState }
    ) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;

            await request({
                url: `/OutboundRequest/${id}/approval`,
                method: "POST",
                data: { action, comment, rejectReason },
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

const outboundRequestSlice = createSlice({
    name: "outboundRequest",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getOutboundRequests.pending, (state) => {
                state.loading = true;
                state.error = undefined;
            })
            .addCase(getOutboundRequests.fulfilled, (state, action) => {
                state.requests = action.payload;
                state.loading = false;
            })
            .addCase(getOutboundRequests.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            /* ===== APPROVE / REJECT ===== */
            .addCase(approveRejectOutboundRequest.pending, (state) => {
                state.loading = true;
                state.error = undefined;
            })
            .addCase(approveRejectOutboundRequest.fulfilled, (state, action) => {
                state.loading = false;
                const request = state.requests.find((r) => r.id === action.payload.id);
                if (request) {
                    request.status = action.payload.action === "Approve" ? "Approved" : "Rejected";
                    request.approvedAt = new Date().toISOString();
                }
            })
            .addCase(approveRejectOutboundRequest.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const selectOutboundRequests = (state: RootState) => state.outboundRequest.requests;
export const selectOutboundRequestLoading = (state: RootState) => state.outboundRequest.loading;

export default outboundRequestSlice.reducer;
