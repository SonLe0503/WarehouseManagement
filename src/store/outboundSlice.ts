// store/outboundSlice.ts
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { request } from "../utils/request";
import type { RootState } from "./index";

export interface IOutboundRequest {
    id: number;
    requestNo: string;
    customerName: string;
    status: string;
    createdAt: string;
    note: string;
    rejectReason?: string;
    warehouseId?: number;
    items?: IOutboundItem[];
}

export interface IOutboundItem {
    id: number;
    productId: number;
    unitId?: number;
    quantity: number;
    lineNote?: string;
    unit?: {
        id: number;
        code: string;
        name: string;
    };
    product?: {
        id: number;
        name: string;
        sku: string;
        baseUnitCode: string;
        createdAt: string;
    };
}

export interface OutboundRequestCreateDTO {
    customerName: string;
    note: string;
    warehouseId: number;
    items: {
        productId: number;
        unitId: number;
        quantity: number;
        lineNote?: string;
    }[];
}

type OutboundState = {
    requests: IOutboundRequest[];
    currentRequest: IOutboundRequest | null;
    loading: boolean;
    error?: string;
};

const initialState: OutboundState = {
    requests: [],
    currentRequest: null,
    loading: false,
};

export const getMyOutboundRequests = createAsyncThunk(
    "outbound/get-my-requests",
    async (_, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const token = state.auth.infoLogin?.accessToken;

            if (!token) {
                return rejectWithValue("No authentication token found");
            }

            const res = await request({
                url: `/outbound-requests/my`,
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return res.data as IOutboundRequest[];
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const getOutboundRequestById = createAsyncThunk(
    "outbound/get-by-id",
    async (id: number, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const token = state.auth.infoLogin?.accessToken;

            if (!token) {
                return rejectWithValue("No authentication token found");
            }

            const res = await request({
                url: `/outbound-requests/${id}`,
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.data.Data) {
                return res.data.Data as IOutboundRequest;
            }

            if (res.data.data) {
                return res.data.data as IOutboundRequest;
            }

            return res.data as IOutboundRequest;
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const createOutboundRequest = createAsyncThunk(
    "outbound/create-request",
    async (data: OutboundRequestCreateDTO, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const token = state.auth.infoLogin?.accessToken;

            if (!token) {
                return rejectWithValue("No authentication token found");
            }

            const res = await request({
                url: `/outbound-requests`,
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

export const updateOutboundRequest = createAsyncThunk(
    "outbound/update-request",
    async ({ id, data }: { id: number; data: OutboundRequestCreateDTO }, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const token = state.auth.infoLogin?.accessToken;

            if (!token) {
                return rejectWithValue("No authentication token found");
            }

            const res = await request({
                url: `/outbound-requests/${id}`,
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

export const deleteOutboundRequest = createAsyncThunk(
    "outbound/delete-request",
    async (id: number, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const token = state.auth.infoLogin?.accessToken;

            if (!token) {
                return rejectWithValue("No authentication token found");
            }

            await request({
                url: `/outbound-requests/${id}`,
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

const outboundSlice = createSlice({
    name: "outbound",
    initialState,
    reducers: {
        clearCurrentRequest: (state) => {
            state.currentRequest = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getMyOutboundRequests.pending, (state) => {
                state.loading = true;
            })
            .addCase(getMyOutboundRequests.fulfilled, (state, action) => {
                state.requests = action.payload;
                state.loading = false;
            })
            .addCase(getMyOutboundRequests.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(getOutboundRequestById.pending, (state) => {
                state.loading = true;
                state.currentRequest = null;
            })
            .addCase(getOutboundRequestById.fulfilled, (state, action) => {
                state.currentRequest = action.payload;
                state.loading = false;
            })
            .addCase(getOutboundRequestById.rejected, (state, action) => {
                state.loading = false;
                state.currentRequest = null;
                state.error = action.payload as string;
            })
            .addCase(createOutboundRequest.pending, (state) => {
                state.loading = true;
            })
            .addCase(createOutboundRequest.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(createOutboundRequest.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(updateOutboundRequest.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateOutboundRequest.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(updateOutboundRequest.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(deleteOutboundRequest.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteOutboundRequest.fulfilled, (state, action) => {
                state.requests = state.requests.filter(req => req.id !== action.payload);
                state.loading = false;
            })
            .addCase(deleteOutboundRequest.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearCurrentRequest } = outboundSlice.actions;
export const selectOutboundRequests = (state: RootState) => state.outbound.requests;
export const selectCurrentRequest = (state: RootState) => state.outbound.currentRequest;
export const selectOutboundLoading = (state: RootState) => state.outbound.loading;
export default outboundSlice.reducer;
