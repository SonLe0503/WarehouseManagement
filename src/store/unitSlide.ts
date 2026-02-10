import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { request } from "../utils/request";
import type { RootState } from ".";

export interface IUnit {
    id: number;
    code: string;
    name: string;
    description?: string;
    isBaseUnit: boolean;
    createdAt: string;
    updatedAt?: string;
}

export interface Unit {
    code: string;
    name: string;
    description?: string;
    isBaseUnit: boolean;
}

type UnitState = {
    units: IUnit[];
    loading: boolean;
    error?: string;
};

const initialState: UnitState = {
    units: [],
    loading: false,
};

export const getAllUnits = createAsyncThunk(
    "unit/get-all",
    async (_, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;

            const res = await request({
                url: "/unit",
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return res.data as IUnit[];
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const createUnit = createAsyncThunk(
    "unit/create",
    async (data: Unit, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;

            const res = await request({
                url: "/unit",
                method: "POST",
                data,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return res.data as IUnit;
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const updateUnit = createAsyncThunk(
    "unit/update",
    async (
        { id, data }: { id: number; data: Unit },
        { rejectWithValue, getState }
    ) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;

            const res = await request({
                url: `/unit/${id}`,
                method: "PUT",
                data,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return res.data as IUnit;
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const deleteUnit = createAsyncThunk(
    "unit/delete",
    async (id: number, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;
            await request({
                url: `/unit/${id}`,
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

const unitSlice = createSlice({
    name: "unit",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            /* ===== GET ALL ===== */
            .addCase(getAllUnits.pending, (state) => {
                state.loading = true;
            })
            .addCase(getAllUnits.fulfilled, (state, action) => {
                state.units = action.payload;
                state.loading = false;
            })
            .addCase(getAllUnits.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            /* ===== CREATE ===== */
            .addCase(createUnit.pending, (state) => {
                state.loading = true;
            })
            .addCase(createUnit.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(createUnit.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            /* ===== UPDATE ===== */
            .addCase(updateUnit.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateUnit.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(updateUnit.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            /* ===== DELETE ===== */
            .addCase(deleteUnit.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteUnit.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(deleteUnit.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const selectUnits = (state: RootState) => state.unit.units;
export const selectUnitLoading = (state: RootState) => state.unit.loading;

export default unitSlice.reducer;
