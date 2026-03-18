import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { request } from "../utils/request";
import type { RootState } from ".";

export interface IProduct {
    id: number;
    sku: string;
    name: string;
    status: string;
    categoryId: number;
    categoryName: string;
    baseUnitId: number;
    baseUnitCode: string;
    createdAt: string;
}

export interface CreateProductDTO {
    sku: string;
    name: string;
    categoryId: number;
    baseUnitId: number;
}

export interface UpdateProduct {
    name: string;
    categoryId: number;
    baseUnitId: number;
    status: string;
}

type ProductState = {
    products: IProduct[];
    currentProduct: IProduct | null;
    loading: boolean;
    error?: string;
};

const initialState: ProductState = {
    products: [],
    currentProduct: null,
    loading: false,
};

export const getAllProducts = createAsyncThunk(
    "product/get-all",
    async (_, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;

            const res = await request({
                url: "/product",
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return res.data as IProduct[];
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const getProductById = createAsyncThunk(
    "product/get-by-id",
    async (id: number, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;

            const res = await request({
                url: `/product/${id}`,
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.data.Data) return res.data.Data as IProduct;
            if (res.data.data) return res.data.data as IProduct;
            return res.data as IProduct;
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const createProduct = createAsyncThunk(
    "product/create",
    async (data: CreateProductDTO, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;

            const res = await request({
                url: "/product",
                method: "POST",
                data,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return res.data as IProduct;
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const updateProduct = createAsyncThunk(
    "product/update",
    async (
        { id, data }: { id: number; data: UpdateProduct },
        { rejectWithValue, getState }
    ) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;

            const res = await request({
                url: `/product/${id}`,
                method: "PUT",
                data,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return res.data as IProduct;
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const deleteProduct = createAsyncThunk(
    "product/delete",
    async (id: number, { rejectWithValue, getState }) => {
        try {
            const state: any = getState();
            const token = state.auth.infoLogin?.accessToken;
            await request({
                url: `/product/${id}`,
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

const productSlice = createSlice({
    name: "product",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder

            .addCase(getAllProducts.pending, (state) => {
                state.loading = true;
            })
            .addCase(getAllProducts.fulfilled, (state, action) => {
                state.products = action.payload;
                state.loading = false;
            })
            .addCase(getAllProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            /* ===== GET BY ID ===== */
            .addCase(getProductById.pending, (state) => {
                state.loading = true;
                state.currentProduct = null;
            })
            .addCase(getProductById.fulfilled, (state, action) => {
                state.currentProduct = action.payload;
                state.loading = false;
            })
            .addCase(getProductById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })


            .addCase(createProduct.pending, (state) => {
                state.loading = true;
            })
            .addCase(createProduct.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(createProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })


            .addCase(updateProduct.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateProduct.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(updateProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            .addCase(deleteProduct.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteProduct.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(deleteProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const selectProducts = (state: RootState) => state.product.products;
export const selectCurrentProduct = (state: RootState) => state.product.currentProduct;
export const selectProductLoading = (state: RootState) => state.product.loading;

export default productSlice.reducer;
