import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { request } from "../utils/request";
import type { RootState } from ".";

export interface AdminDashboardSummary {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    totalWarehouses: number;
    activeWarehouses: number;
    inactiveWarehouses: number;
    warehousesWithoutManager: number;
    totalProducts: number;
    activeProducts: number;
    inactiveProducts: number;
    totalCategories: number;
    rootCategories: number;
    totalUnits: number;
    baseUnits: number;
}

export interface RoleDistributionItem {
    roleName: string;
    userCount: number;
}

export interface RecentAdminUser {
    id: number;
    username: string;
    email: string;
    status: string;
    roles: string[];
    warehouseName?: string | null;
    createdAt?: string | null;
}

export interface RecentAdminProduct {
    id: number;
    sku: string;
    name: string;
    status: string;
    categoryName: string;
    baseUnitCode: string;
    createdAt?: string | null;
}

export interface WarehouseOverviewItem {
    warehouseId: number;
    code: string;
    name: string;
    status: string;
    userCount: number;
    managerCount: number;
}

export interface AdminDashboardOverview {
    summary: AdminDashboardSummary;
    roleDistribution: RoleDistributionItem[];
    recentUsers: RecentAdminUser[];
    recentProducts: RecentAdminProduct[];
    warehouseOverview: WarehouseOverviewItem[];
}

type AdminDashboardState = {
    overview: AdminDashboardOverview | null;
    loading: boolean;
    error: string | null;
};

const initialState: AdminDashboardState = {
    overview: null,
    loading: false,
    error: null,
};

export const getAdminDashboardOverview = createAsyncThunk(
    "dashboardAdmin/get-overview",
    async (_, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const token = state.auth.infoLogin?.accessToken;

            const res = await request({
                url: "/DashboardAdmin/overview",
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return res.data as AdminDashboardOverview;
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

const dashboardAdminSlice = createSlice({
    name: "dashboardAdmin",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getAdminDashboardOverview.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getAdminDashboardOverview.fulfilled, (state, action) => {
                state.overview = action.payload;
                state.loading = false;
            })
            .addCase(getAdminDashboardOverview.rejected, (state, action) => {
                state.loading = false;
                state.error = typeof action.payload === "string"
                    ? action.payload
                    : (action.payload as any)?.message || "Failed to load admin dashboard";
            });
    },
});

export const selectAdminDashboardOverview = (state: RootState) => state.dashboardAdmin.overview;
export const selectAdminDashboardLoading = (state: RootState) => state.dashboardAdmin.loading;
export const selectAdminDashboardError = (state: RootState) => state.dashboardAdmin.error;

export default dashboardAdminSlice.reducer;
