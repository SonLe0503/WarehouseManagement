import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { EUserRole, type DynamicKeyObject } from "../interface/app";
import { request } from "../utils/request";
import { jwtDecode } from "jwt-decode";
import type { RootState } from "./index";

interface IInfoLogin {
  accessToken: string;
  role: EUserRole;
  userId: string;
  expiresTime: number;
}

type IInitialState = {
  infoLogin: IInfoLogin | null;
  isLogin: boolean;
}

const initialState: IInitialState = {
  infoLogin: {
    accessToken: "",
    role: EUserRole.STAFF,
    userId: "",
    expiresTime: 0,
  },
  isLogin: false,
}

export const actionLogin = createAsyncThunk(
  "auth/actionLogin",
  async (data: DynamicKeyObject, { rejectWithValue }) => {
    const { ...payload } = data;
    try {
      return await request({
        url: `/Auth/login`,
        method: "POST",
        data: payload,
      })
    } catch (error) {
      return rejectWithValue(error);
    }
  }
)

export const slice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.infoLogin = initialState.infoLogin;
      state.isLogin = false;
    },
  },
   extraReducers: (builder) => {
    builder.addCase(actionLogin.fulfilled, (state, action) => {
      const token = action.payload?.data?.token ?? "";
      if (token) {
        const decodedToken: any = jwtDecode(token);
        state.infoLogin = {
          ...state.infoLogin,
          accessToken: token,
          role: decodedToken["role"],  
          userId: decodedToken["nameid"],
          expiresTime: decodedToken["exp"],
        };
        state.isLogin = true;
      }
    })
      .addCase(actionLogin.rejected, (state) => {
        state.infoLogin = initialState.infoLogin;
        state.isLogin = false;
      });
  }
})

export const { logout } = slice.actions;
export const selectIsLogin = (state: RootState) => state.auth.isLogin;
export const selectInfoLogin = (state: RootState) => state.auth.infoLogin;
export default slice.reducer;