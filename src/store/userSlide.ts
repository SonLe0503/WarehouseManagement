import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { request } from "../utils/request";
import type { RootState } from "./index";


export interface IUser {
  id: number;
  username: string;
  email: string;
  status: string;
  roles: string[];
  createdAt: string;
}

export interface CreateUserDTO {
  username: string;
  password: string;
  email?: string;
  status?: string;
  roleIds?: number[];
}

export interface UpdateUserDTO {
  username?: string;
  email?: string;
  status?: string;
  roleIds?: number[];
}

type UserState = {
  users: IUser[];
  loading: boolean;
  error?: string;
};

const initialState: UserState = {
  users: [],
  loading: false,
};

export const getAllUsers = createAsyncThunk(
  "user/get-all-users",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state: any = getState();
      const token = state.auth.infoLogin?.token;
      const res = await request({
        url: `/user`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      return res.data as IUser[];
    } catch (err) {
      return rejectWithValue(err);
    }
  }
);

export const createUser = createAsyncThunk(
  "user/create-user",
  async (data: CreateUserDTO, { rejectWithValue, getState }) => {
    try {
      const state: any = getState();
      const token = state.auth.infoLogin?.token;
      const res = await request({
        url: "/user",
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

export const updateUser = createAsyncThunk(
  "user/update-user",
  async (
    { id, data }: { id: number; data: UpdateUserDTO },
    { rejectWithValue, getState }
  ) => {
    try {
      const state: any = getState();
      const token = state.auth.infoLogin?.token;
      await request({
        url: `/user/${id}`,
        method: "PUT",
        data,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return { id, data };
    } catch (err: any) {
      return rejectWithValue(err.response?.data || err.message);
    }
  }
);

export const deleteUser = createAsyncThunk(
  "user/delete-user",
  async (id: number, { rejectWithValue, getState }) => {
    try {
      const state: any = getState();
      const token = state.auth.infoLogin?.token;
      await request({
        url: `/user/${id}`,
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

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.users = action.payload;
        state.loading = false;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(createUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(createUser.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })


      .addCase(updateUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.users.findIndex(
          (u) => u.id === action.payload.id
        );
        if (index !== -1) {
          state.users[index] = {
            ...state.users[index],
            ...action.payload.data,
          };
        }
        state.loading = false;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })


      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        const user = state.users.find((u) => u.id === action.payload);
        if (user) {
          user.status = "Deleted";
        }
        state.loading = false;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const selectUsers = (state: RootState) => state.user.users;
export const selectUserLoading = (state: RootState) => state.user.loading;

export default userSlice.reducer;