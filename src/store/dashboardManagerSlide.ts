import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { request } from "../utils/request";
import type { RootState } from ".";

export interface DashboardSummaryDto {
    totalProductsInStock: number;
    totalQuantityInWarehouse: number;
    lowStockItems: number;
    pendingRequests: number;
    todayInbound: number;
    todayOutbound: number;
}

export interface InboundOutboundChartPointDto {
    label: string;
    purchases: number;
    sales: number;
}

export interface PendingRequestsDto {
    pendingInboundRequests: number;
    pendingOutboundRequests: number;
    pendingTransferInRequests: number;
    pendingTransferOutRequests: number;
    totalPendingRequests: number;
}

export interface RecentTransactionDto {
    type: string;
    refId: number;
    refNo: string;
    status: string;
    createdAt: string | null;
}

export interface LowStockDto {
    productId: number;
    sku: string;
    productName: string;
    currentQuantity: number;
    status: string;
}

interface DashboardManagerState {
    summary: DashboardSummaryDto | null;
    chartData: InboundOutboundChartPointDto[];
    lowStock: LowStockDto[];
    pendingRequests: PendingRequestsDto | null;
    recentTransactions: RecentTransactionDto[];
    loading: boolean;
    error: string | null;
}

const initialState: DashboardManagerState = {
    summary: null,
    chartData: [],
    lowStock: [],
    pendingRequests: null,
    recentTransactions: [],
    loading: false,
    error: null,
};

export const getDashboardSummary = createAsyncThunk(
    "dashboardManager/get-summary",
    async (lowStockThreshold: number = 10, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const token = state.auth.infoLogin?.accessToken;

            const res = await request({
                url: `/DashboardManager/summary`,
                method: "GET",
                params: { lowStockThreshold },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return res.data as DashboardSummaryDto;
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const getInboundOutboundChart = createAsyncThunk(
    "dashboardManager/get-chart",
    async (period: string = "week", { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const token = state.auth.infoLogin?.accessToken;

            const res = await request({
                url: `/DashboardManager/inbound-outbound-chart`,
                method: "GET",
                params: { period },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return res.data as InboundOutboundChartPointDto[];
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const getLowStock = createAsyncThunk(
    "dashboardManager/get-low-stock",
    async ({ threshold = 10, take = 10 }: { threshold?: number; take?: number } = {}, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const token = state.auth.infoLogin?.accessToken;

            const res = await request({
                url: `/DashboardManager/low-stock`,
                method: "GET",
                params: { threshold, take },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return res.data as LowStockDto[];
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const getPendingRequests = createAsyncThunk(
    "dashboardManager/get-pending-requests",
    async (_, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const token = state.auth.infoLogin?.accessToken;

            const res = await request({
                url: `/DashboardManager/pending-requests`,
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return res.data as PendingRequestsDto;
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const getRecentTransactions = createAsyncThunk(
    "dashboardManager/get-recent-transactions",
    async (take: number = 10, { rejectWithValue, getState }) => {
        try {
            const state = getState() as RootState;
            const token = state.auth.infoLogin?.accessToken;

            const res = await request({
                url: `/DashboardManager/recent-transactions`,
                method: "GET",
                params: { take },
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            return res.data as RecentTransactionDto[];
        } catch (err: any) {
            return rejectWithValue(err.response?.data || err.message);
        }
    }
);

const dashboardManagerSlice = createSlice({
    name: "dashboardManager",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Summary
            .addCase(getDashboardSummary.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getDashboardSummary.fulfilled, (state, action) => {
                state.summary = action.payload;
                state.loading = false;
            })
            .addCase(getDashboardSummary.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Chart Data
            .addCase(getInboundOutboundChart.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getInboundOutboundChart.fulfilled, (state, action) => {
                state.chartData = action.payload;
                state.loading = false;
            })
            .addCase(getInboundOutboundChart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Low Stock
            .addCase(getLowStock.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getLowStock.fulfilled, (state, action) => {
                state.lowStock = action.payload;
                state.loading = false;
            })
            .addCase(getLowStock.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Pending Requests
            .addCase(getPendingRequests.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getPendingRequests.fulfilled, (state, action) => {
                state.pendingRequests = action.payload;
                state.loading = false;
            })
            .addCase(getPendingRequests.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Recent Transactions
            .addCase(getRecentTransactions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getRecentTransactions.fulfilled, (state, action) => {
                state.recentTransactions = action.payload;
                state.loading = false;
            })
            .addCase(getRecentTransactions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const selectDashboardSummary = (state: RootState) => state.dashboardManager.summary;
export const selectDashboardChartData = (state: RootState) => state.dashboardManager.chartData;
export const selectDashboardLowStock = (state: RootState) => state.dashboardManager.lowStock;
export const selectDashboardPendingRequests = (state: RootState) => state.dashboardManager.pendingRequests;
export const selectDashboardRecentTransactions = (state: RootState) => state.dashboardManager.recentTransactions;
export const selectDashboardLoading = (state: RootState) => state.dashboardManager.loading;
export const selectDashboardError = (state: RootState) => state.dashboardManager.error;

export default dashboardManagerSlice.reducer;
