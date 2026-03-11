import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { request } from "../utils/request";
import type { RootState } from ".";

export interface IWarehouse {
    id: number;
    code: string;
    name: string;
    address?: string;
    status?: string;
    createdAt?: string;
}

export interface ICreateWarehouse {
    code: string;
    name: string;
    address?: string;
}

export interface IUpdateWarehouse {
    id: number;
    code: string;
    name: string;
    address?: string;
    status?: string;
}

type WarehouseState = {
    warehouses: IWarehouse[];
    currentWarehouse?: IWarehouse;
    loading: boolean;
    error?: string;
};

const initialState: WarehouseState = {
    warehouses: [],
    loading: false,
};

// --- CÁC API CŨ (Giữ nguyên) ---
export const getActiveWarehouses = createAsyncThunk(
    "warehouse/get-active",
    async (_, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;

            const res = await request({
                url: "/warehouses",
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return res.data as IWarehouse[];
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

// --- CÁC API MỚI (Cập nhật thêm) ---
export const getAllWarehouses = createAsyncThunk(
    "warehouse/get-all",
    async (_, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;
            const res = await request({
                url: "/Warehouse",
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            });
            return res.data as IWarehouse[];
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const getWarehouseById = createAsyncThunk(
    "warehouse/get-by-id",
    async (id: number, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;
            const res = await request({
                url: `/Warehouse/${id}`,
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            });
            return res.data as IWarehouse;
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const createWarehouse = createAsyncThunk(
    "warehouse/create",
    async (data: ICreateWarehouse, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;
            const res = await request({
                url: "/Warehouse",
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

export const updateWarehouse = createAsyncThunk(
    "warehouse/update",
    async ({ id, data }: { id: number; data: IUpdateWarehouse }, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;
            const res = await request({
                url: `/Warehouse/${id}`,
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

export const activateWarehouse = createAsyncThunk(
    "warehouse/activate",
    async (id: number, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;
            const res = await request({
                url: `/Warehouse/${id}/activate`,
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` },
            });
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const deleteWarehouse = createAsyncThunk(
    "warehouse/delete",
    async (id: number, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;
            const res = await request({
                url: `/Warehouse/${id}`,
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            return res.data;
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

const warehouseSlice = createSlice({
    name: "warehouse",
    initialState,
    reducers: {
        clearCurrentWarehouse: (state) => {
            state.currentWarehouse = undefined;
        }
    },
    extraReducers: (builder) => {
        builder
            // Get Active (Cũ)
            .addCase(getActiveWarehouses.pending, (state) => {
                state.loading = true;
                state.error = undefined;
            })
            .addCase(getActiveWarehouses.fulfilled, (state, action) => {
                state.warehouses = action.payload;
                state.loading = false;
            })
            .addCase(getActiveWarehouses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Get All (Mới)
            .addCase(getAllWarehouses.pending, (state) => {
                state.loading = true;
                state.error = undefined;
            })
            .addCase(getAllWarehouses.fulfilled, (state, action) => {
                state.warehouses = action.payload;
                state.loading = false;
            })
            .addCase(getAllWarehouses.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Get By Id
            .addCase(getWarehouseById.fulfilled, (state, action) => {
                state.currentWarehouse = action.payload;
                state.loading = false;
            })
            // Matchers for other loading states
            .addMatcher(
                (action) => action.type.endsWith("/pending") && action.type.startsWith("warehouse/"),
                (state) => {
                    state.loading = true;
                    state.error = undefined;
                }
            )
            .addMatcher(
                (action) => (action.type.endsWith("/fulfilled") || action.type.endsWith("/rejected")) && action.type.startsWith("warehouse/"),
                (state) => {
                    state.loading = false;
                }
            );
    },
});

export const { clearCurrentWarehouse } = warehouseSlice.actions;

export const selectWarehouses = (state: RootState) => state.warehouse.warehouses;
export const selectCurrentWarehouse = (state: RootState) => state.warehouse.currentWarehouse;
export const selectWarehouseLoading = (state: RootState) => state.warehouse.loading;
export const selectWarehouseError = (state: RootState) => state.warehouse.error;

export default warehouseSlice.reducer;