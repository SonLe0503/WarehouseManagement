import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { request } from "../utils/request";
import type { RootState } from ".";

export interface IUnitConversion {
    id: number;
    productId: number;
    fromUnitId: number;
    toUnitId: number;
    rate: number;
}

export interface CreateUnitConversionDTO {
    productId: number;
    fromUnitId: number;
    conversionFactor: number;
}

export interface UpdateUnitConversionDTO {
    conversionFactor: number;
}

type UnitConversionState = {
    conversions: IUnitConversion[];
    loading: boolean;
    error?: string;
};

const initialState: UnitConversionState = {
    conversions: [],
    loading: false,
};

export const getUnitConversionsByProduct = createAsyncThunk(
    "unitConversion/get-by-product",
    async (productId: number, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const token = state.auth.infoLogin?.accessToken;

            const res = await request({
                url: `/UnitConversions/${productId}`,
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return res.data as IUnitConversion[];
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const createUnitConversion = createAsyncThunk(
    "unitConversion/create",
    async (data: CreateUnitConversionDTO, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const token = state.auth.infoLogin?.accessToken;

            const res = await request({
                url: "/UnitConversions",
                method: "POST",
                data,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return res.data as IUnitConversion;
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const updateUnitConversion = createAsyncThunk(
    "unitConversion/update",
    async (
        { id, data }: { id: number; data: UpdateUnitConversionDTO },
        { rejectWithValue, getState }
    ) => {
        try {
            const state = getState() as RootState;
            const token = state.auth.infoLogin?.accessToken;

            const res = await request({
                url: `/UnitConversions/${id}`,
                method: "PUT",
                data,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return res.data as IUnitConversion;
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const deactivateUnitConversion = createAsyncThunk(
    "unitConversion/deactivate",
    async (id: number, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const token = state.auth.infoLogin?.accessToken;

            await request({
                url: `/UnitConversions/${id}`,
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

const unitConversionSlice = createSlice({
    name: "unitConversion",
    initialState,
    reducers: {
        clearUnitConversions: (state) => {
            state.conversions = [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getUnitConversionsByProduct.pending, (state) => {
                state.loading = true;
            })
            .addCase(getUnitConversionsByProduct.fulfilled, (state, action) => {
                state.conversions = action.payload;
                state.loading = false;
            })
            .addCase(getUnitConversionsByProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(createUnitConversion.pending, (state) => {
                state.loading = true;
            })
            .addCase(createUnitConversion.fulfilled, (state, action) => {
                state.conversions.push(action.payload);
                state.loading = false;
            })
            .addCase(createUnitConversion.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(updateUnitConversion.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateUnitConversion.fulfilled, (state, action) => {
                state.conversions = state.conversions.map((item) =>
                    item.id === action.payload.id ? action.payload : item
                );
                state.loading = false;
            })
            .addCase(updateUnitConversion.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(deactivateUnitConversion.pending, (state) => {
                state.loading = true;
            })
            .addCase(deactivateUnitConversion.fulfilled, (state, action) => {
                state.conversions = state.conversions.filter(
                    (item) => item.id !== action.payload
                );
                state.loading = false;
            })
            .addCase(deactivateUnitConversion.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearUnitConversions } = unitConversionSlice.actions;
export const selectUnitConversions = (state: RootState) =>
    state.unitConversion.conversions;
export const selectUnitConversionLoading = (state: RootState) =>
    state.unitConversion.loading;
export default unitConversionSlice.reducer;
