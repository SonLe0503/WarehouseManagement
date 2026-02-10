import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { request } from "../utils/request";
import type { RootState } from ".";

export interface ICategory {
    id: number;
    name: string;
    parentId?: number | null;
    children?: ICategory[];
}

export interface CreateCategoryDTO {
    name: string;
    parentId?: number | null;
}

export interface UpdateCategoryDTO {
    name?: string;
    parentId?: number | null;
}

type CategoryState = {
    categories: ICategory[]; // tree
    loading: boolean;
    error?: string;
};

const initialState: CategoryState = {
    categories: [],
    loading: false,
};

export const getAllCategories = createAsyncThunk(
  "category/get-all",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state: any = getState();
      const token = state.auth.infoLogin?.accessToken;

      const res = await request({
        url: "/category",
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return res.data as ICategory[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const createCategory = createAsyncThunk(
  "category/create",
  async (data: CreateCategoryDTO, { rejectWithValue, getState }) => {
    try {
      const state: any = getState();
      const token = state.auth.infoLogin?.accessToken;

      const res = await request({
        url: "/category",
        method: "POST",
        data,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return res.data as ICategory;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const updateCategory = createAsyncThunk(
  "category/update",
  async (
    { id, data }: { id: number; data: UpdateCategoryDTO },
    { rejectWithValue, getState }
  ) => {
    try {
      const state: any = getState();
      const token = state.auth.infoLogin?.accessToken;

      const res = await request({
        url: `/category/${id}`,
        method: "PUT",
        data,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return res.data as ICategory;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const deleteCategory = createAsyncThunk(
  "category/delete",
  async (id: number, { rejectWithValue, getState }) => {
    try {
      const state: any = getState();
      const token = state.auth.infoLogin?.accessToken;
      await request({
        url: `/category/${id}`,
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

const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      /* ===== GET ALL ===== */
      .addCase(getAllCategories.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
        state.loading = false;
      })
      .addCase(getAllCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* ===== CREATE ===== */
      .addCase(createCategory.pending, (state) => {
        state.loading = true;
      })
      .addCase(createCategory.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* ===== UPDATE ===== */
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCategory.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      /* ===== DELETE ===== */  
      .addCase(deleteCategory.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteCategory.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const selectCategories = (state: RootState) => state.category.categories;
export const selectCategoryLoading = (state: RootState) => state.category.loading;

export default categorySlice.reducer;

