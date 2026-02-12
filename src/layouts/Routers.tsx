import { lazy, Suspense } from "react"
import URL from "../constants/url"
import { DASHBOARD_LAYOUT, NONE_LAYOUT } from "../constants/layout"
import { Navigate, Route, Routes } from "react-router-dom"
import DashboardLayout from "../layouts/DashboardLayout"
import PrivateLayout from "../layouts/PrivateLayout"


const Login = lazy(() => import("../app/pages/login"))
const DashboardAdmin = lazy(() => import("../app/pages/dashboard/DashboardAdmin"))
const ManageUser = lazy(() => import("../app/pages/manageUser"))
const DashboardStaff = lazy(() => import("../app/pages/dashboard/DashboardStaff"))
const DashboardManage = lazy(() => import("../app/pages/dashboard/DashboardManage"))
const DashboardPurchase = lazy(() => import("../app/pages/dashboard/DashboardPurchase"))
const DashboardSale = lazy(() => import("../app/pages/dashboard/DashboardSale"))
const ManageCategory = lazy(() => import("../app/pages/manageCategory"))
const ManageProduct = lazy(() => import("../app/pages/manageProduct"))
const ManageUnit = lazy(() => import("../app/pages/manageUnit"))
const ManageOrder = lazy(() => import("../app/pages/dashboard/manageOrder"))

const shareResourceItem = [
    {
        key: URL.Login,
        element: <Login />,
        layout: NONE_LAYOUT,
        private: false,
    }
]
const privateResourceItem = [
    {
        key: URL.DashboardAdmin,
        element: <DashboardAdmin />,
        layout: DASHBOARD_LAYOUT,
        private: true,
    },
    {
        key: URL.ManageUser,
        element: <ManageUser />,
        layout: DASHBOARD_LAYOUT,
        private: true,
    },
    {
        key: URL.DashboardStaff,
        element: <DashboardStaff />,
        layout: DASHBOARD_LAYOUT,
        private: true,
    },
    {
        key: URL.DashboardManage,
        element: <DashboardManage />,
        layout: DASHBOARD_LAYOUT,
        private: true,
    },
    {
        key: URL.DashboardPurchase,
        element: <DashboardPurchase />,
        layout: DASHBOARD_LAYOUT,
        private: true,
    },
    {
        key: URL.DashboardSale,
        element: <DashboardSale />,
        layout: DASHBOARD_LAYOUT,
        private: true,
    },
    {
        key: URL.ManageCategory,
        element: <ManageCategory />,
        layout: DASHBOARD_LAYOUT,
        private: true,
    },
    {
        key: URL.ManageProduct,
        element: <ManageProduct />,
        layout: DASHBOARD_LAYOUT,
        private: true,
    },
    {
        key: URL.ManageUnit,
        element: <ManageUnit />,
        layout: DASHBOARD_LAYOUT,
        private: true,
    },
    {
        key: URL.ManageOrder,
        element: <ManageOrder />,
        layout: DASHBOARD_LAYOUT,
        private: true,
    }
]
const menus = [...shareResourceItem, ...privateResourceItem]

export default function Routers() {
    return (
        <Routes>
            <Route path="/" element={<Navigate to={URL.Login} replace />} />
            {menus.map((menu: any) => {
                let element = menu.element;
                element = <Suspense fallback={null}>{element}</Suspense>;
                if (menu.private) {
                    element = <PrivateLayout>{element}</PrivateLayout>;
                }
                if (menu.layout === DASHBOARD_LAYOUT) {
                    return <Route key={menu.key} path={menu.key} element={<DashboardLayout>{element}</DashboardLayout>} />;
                }

                return <Route key={menu.key} path={menu.key} element={element} />
            })}
        </Routes>
    )
}