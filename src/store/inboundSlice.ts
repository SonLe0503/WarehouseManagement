// store/inboundSlice.ts
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
    warehouseId?: number;
    items?: IInboundItem[];
}

export interface IInboundItem {
    id: number;
    productId: number;
    quantity: number;
    lineNote?: string;
    product?: {
        id: number;
        name: string;
        sku: string;
    };
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
    currentRequest: IInboundRequest | null;
    loading: boolean;
    error?: string;
};

const initialState: InboundState = {
    requests: [],
    currentRequest: null,
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

export const getInboundRequestById = createAsyncThunk(
    "inbound/get-by-id",
    async (id: number, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const token = state.auth.infoLogin?.accessToken;

            if (!token) {
                return rejectWithValue("No authentication token found");
            }

            const res = await request({
                url: `/inbound-requests/${id}`,
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log("API Response:", res.data);

            if (res.data.Data) {
                return res.data.Data as IInboundRequest;
            }

            if (res.data.data) {
                return res.data.data as IInboundRequest;
            }

            return res.data as IInboundRequest;
        } catch (err: any) {
            console.error("API Error:", err);
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

export const updateInboundRequest = createAsyncThunk(
    "inbound/update-request",
    async ({ id, data }: { id: number; data: InboundRequestCreateDTO }, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const token = state.auth.infoLogin?.accessToken;

            if (!token) {
                return rejectWithValue("No authentication token found");
            }

            const res = await request({
                url: `/inbound-requests/${id}`,
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

export const deleteInboundRequest = createAsyncThunk(
    "inbound/delete-request",
    async (id: number, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const token = state.auth.infoLogin?.accessToken;

            if (!token) {
                return rejectWithValue("No authentication token found");
            }

            await request({
                url: `/inbound-requests/${id}`,
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

const inboundSlice = createSlice({
    name: "inbound",
    initialState,
    reducers: {
        clearCurrentRequest: (state) => {
            state.currentRequest = null;
        },
    },
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
            .addCase(getInboundRequestById.pending, (state) => {
                state.loading = true;
                state.currentRequest = null;
            })
            .addCase(getInboundRequestById.fulfilled, (state, action) => {
                console.log("Payload received:", action.payload);
                state.currentRequest = action.payload;
                state.loading = false;
            })
            .addCase(getInboundRequestById.rejected, (state, action) => {
                state.loading = false;
                state.currentRequest = null;
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
            })
            .addCase(updateInboundRequest.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateInboundRequest.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(updateInboundRequest.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(deleteInboundRequest.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteInboundRequest.fulfilled, (state, action) => {
                state.requests = state.requests.filter(req => req.id !== action.payload);
                state.loading = false;
            })
            .addCase(deleteInboundRequest.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearCurrentRequest } = inboundSlice.actions;
export const selectInboundRequests = (state: RootState) => state.inbound.requests;
export const selectCurrentRequest = (state: RootState) => state.inbound.currentRequest;
export const selectInboundLoading = (state: RootState) => state.inbound.loading;
export default inboundSlice.reducer;