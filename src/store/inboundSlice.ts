import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { request } from "../utils/request";
import type { RootState } from "./index";

export interface IInboundRequest {
    id: number;
    requestNo: string;
    supplierName: string;
    status: string;
    createdAt: string;
    note: string;
    rejectReason?: string;
}

export interface InboundRequestCreateDTO {
    supplierName: string;
    note: string;
    warehouseId: number;
    items: {
        productId: number;
        quantity: number;
        lineNote?: string;
    }[];
}

type InboundState = {
    requests: IInboundRequest[];
    loading: boolean;
    error?: string;
};

const initialState: InboundState = {
    requests: [],
    loading: false,
};


export const getMyInboundRequests = createAsyncThunk(
    "inbound/get-my-requests",
    async (_, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const token = state.auth.infoLogin?.accessToken;

            if (!token) {
                return rejectWithValue("No authentication token found");
            }

            const res = await request({
                url: `/inbound-requests/my`,
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return res.data as IInboundRequest[];
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const createInboundRequest = createAsyncThunk(
    "inbound/create-request",
    async (data: InboundRequestCreateDTO, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const token = state.auth.infoLogin?.accessToken;

            if (!token) {
                return rejectWithValue("No authentication token found");
            }

            const res = await request({
                url: `/inbound-requests`,
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

const inboundSlice = createSlice({
    name: "inbound",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getMyInboundRequests.pending, (state) => {
                state.loading = true;
            })
            .addCase(getMyInboundRequests.fulfilled, (state, action) => {
                state.requests = action.payload;
                state.loading = false;
            })
            .addCase(getMyInboundRequests.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(createInboundRequest.pending, (state) => {
                state.loading = true;
            })
            .addCase(createInboundRequest.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(createInboundRequest.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const selectInboundRequests = (state: RootState) => state.inbound.requests;
export default inboundSlice.reducer;