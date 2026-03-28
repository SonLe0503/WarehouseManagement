import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { request } from "../utils/request";
import type { RootState } from ".";

export interface IBin {
    id: number;
    code: string;
    name?: string;
    warehouseId: number;
    warehouseName?: string;
    status: string;
    createdAt?: string;
}

export interface BinCreateDto {
    code: string;
    name?: string;
    warehouseId: number;
}

export interface BinUpdateDto {
    code: string;
    name?: string;
    status: string;
}

type BinState = {
    bins: IBin[];
    availableBins: IBin[];
    loading: boolean;
    error?: string;
};

const initialState: BinState = {
    bins: [],
    availableBins: [],
    loading: false,
};

export const getAllBins = createAsyncThunk(
    "bin/get-all",
    async (warehouseId: number | undefined, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;
            const url = warehouseId ? `/Bins?warehouseId=${warehouseId}` : `/Bins`;
            const res = await request({
                url,
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            });
            return res.data as IBin[];
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const getAvailableBins = createAsyncThunk(
    "bin/get-available",
    async (warehouseId: number, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;
            const res = await request({
                url: `/Bins/available?warehouseId=${warehouseId}`,
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            });
            return res.data as IBin[];
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const createBin = createAsyncThunk(
    "bin/create",
    async (data: BinCreateDto, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;
            const res = await request({
                url: `/Bins`,
                method: "POST",
                data,
                headers: { Authorization: `Bearer ${token}` },
            });
            return res.data as IBin;
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const updateBin = createAsyncThunk(
    "bin/update",
    async ({ id, data }: { id: number; data: BinUpdateDto }, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;
            const res = await request({
                url: `/Bins/${id}`,
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            });
            return res.data as IBin;
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const deleteBin = createAsyncThunk(
    "bin/delete",
    async (id: number, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;
            await request({
                url: `/Bins/${id}`,
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            return id;
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const getBinById = createAsyncThunk(
    "bin/get-by-id",
    async (id: number, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;
            const res = await request({
                url: `/Bins/${id}`,
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            });
            return res.data as IBin;
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

const binSlice = createSlice({
    name: "bin",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getAllBins.pending, (state) => { state.loading = true; state.error = undefined; })
            .addCase(getAllBins.fulfilled, (state, action) => { state.bins = action.payload; state.loading = false; })
            .addCase(getAllBins.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

            .addCase(getAvailableBins.pending, (state) => { state.loading = true; })
            .addCase(getAvailableBins.fulfilled, (state, action) => { state.availableBins = action.payload; state.loading = false; })
            .addCase(getAvailableBins.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

            .addCase(createBin.pending, (state) => { state.loading = true; })
            .addCase(createBin.fulfilled, (state, action) => { state.bins.push(action.payload); state.loading = false; })
            .addCase(createBin.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

            .addCase(updateBin.pending, (state) => { state.loading = true; })
            .addCase(updateBin.fulfilled, (state, action) => {
                const idx = state.bins.findIndex(b => b.id === action.payload.id);
                if (idx !== -1) state.bins[idx] = action.payload;
                state.loading = false;
            })
            .addCase(updateBin.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; })

            .addCase(deleteBin.pending, (state) => { state.loading = true; })
            .addCase(deleteBin.fulfilled, (state, action) => {
                state.bins = state.bins.filter(b => b.id !== action.payload);
                state.loading = false;
            })
            .addCase(deleteBin.rejected, (state, action) => { state.loading = false; state.error = action.payload as string; });
    },
});

export const selectBins = (state: RootState) => state.bin.bins;
export const selectAvailableBins = (state: RootState) => state.bin.availableBins;
export const selectBinLoading = (state: RootState) => state.bin.loading;

export default binSlice.reducer;