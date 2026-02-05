import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { request } from "../utils/request";
import type { RootState } from ".";


export interface IRole {
  id: number;
  name: string;
}

type RoleState = {
  roles: IRole[];
  loading: boolean;
  error?: string;
};

const initialState: RoleState = {
  roles: [],
  loading: false,
};

export const getAllRoles = createAsyncThunk(
  "role/get-all-roles",
  async (_, { rejectWithValue }) => {
    try {
      const res = await request({
        url: "/role",
        method: "GET",
      });
      return res.data as IRole[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

const roleSlice = createSlice({
  name: "role",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllRoles.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllRoles.fulfilled, (state, action) => {
        state.roles = action.payload;
        state.loading = false;
      })
      .addCase(getAllRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const selectRoles = (state: RootState) => state.role.roles;
export const selectRoleLoading = (state: RootState) => state.role.loading;

export default roleSlice.reducer;