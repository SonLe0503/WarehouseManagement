import { Layout, Menu, Button } from "antd";
import {
    AppstoreOutlined,
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    UserOutlined,
    FileTextOutlined,
    InboxOutlined,
} from "@ant-design/icons";
import { useAppSelector } from "../../../store";
import { useNavigate, useLocation } from "react-router-dom";
import { selectInfoLogin } from "../../../store/authSlide";
import URL from "../../../constants/url";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const { Sider } = Layout;

const Sidebar = () => {
    const infoLogin = useAppSelector(selectInfoLogin);
    const role = infoLogin?.role;
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);

    const menuByRole: any = {
        ADMIN: [
            { key: URL.DashboardAdmin, icon: <AppstoreOutlined />, label: "Tổng quan" },
            { key: URL.ManageUser, icon: <UserOutlined />, label: "Quản lý người dùng" },
            {
                key: "sub-catalog",
                icon: <InboxOutlined />,
                label: "Danh mục & Sản phẩm",
                children: [
                    { key: URL.ManageCategory, label: "Danh mục" },
                    { key: URL.ManageProduct, label: "Sản phẩm" },
                    { key: URL.ManageUnit, label: "Đơn vị tính" },
                ],
            },
        ],
        MANAGER: [
            { key: URL.DashboardManage, icon: <AppstoreOutlined />, label: "Tổng quan" },
            { key: URL.ManageOrder, icon: <FileTextOutlined />, label: "Quản lý nhập kho" }
        ],
        STAFF: [
            { key: URL.DashboardStaff, icon: <AppstoreOutlined />, label: "Tổng quan" },
            { key: URL.ManageOrder, icon: <FileTextOutlined />, label: "Quản lý nhập kho" }
        ],
        PURCHASE: [{ key: URL.DashboardPurchase, icon: <AppstoreOutlined />, label: "Tổng quan" }],
        SALE: [{ key: URL.DashboardSale, icon: <AppstoreOutlined />, label: "Tổng quan" }],
    };

    const currentMenu = role ? menuByRole[role] : [];

    return (
        <Sider
            theme="light"
            width={240}
            collapsedWidth={80}
            collapsed={collapsed}
            className="h-screen bg-white border-r border-gray-100 shadow-sm z-50 overflow-hidden"
            trigger={null}
        >
            <div className="h-full flex flex-col">
                {/* Logo area */}
                <div className="h-16 px-4 flex items-center justify-start overflow-hidden border-b border-gray-50 bg-white">
                    <div className="min-w-[48px] h-10 flex items-center justify-center bg-blue-600 rounded-lg shadow-lg shadow-blue-200/50">
                        <span className="text-white font-black text-xl">W</span>
                    </div>
                    <AnimatePresence mode="wait">
                        {!collapsed && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2 }}
                                className="ml-3 flex flex-col whitespace-nowrap overflow-hidden"
                            >
                                <span className="font-bold text-gray-800 text-lg leading-tight tracking-tight">
                                    WMS System
                                </span>
                                <span className="text-[10px] text-blue-500 font-medium uppercase tracking-[0.1em]">
                                    Warehouse Management
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Navigation Menu */}
                <div className="flex-1 py-4 overflow-y-auto no-scrollbar active-menu-blue">
                    <Menu
                        mode="inline"
                        selectedKeys={[location.pathname]}
                        className="active-menu-blue border-none px-3"
                        items={currentMenu}
                        onClick={({ key }) => {
                            if (key.startsWith("/")) {
                                navigate(key);
                            }
                        }}
                    />
                </div>

                {/* Sidebar Footer with Collapse Toggle */}
                <div className="p-4 border-t border-gray-100 flex justify-center">
                    <Button
                        type="text"
                        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={() => setCollapsed(!collapsed)}
                        className="!w-10 !h-10 !flex !items-center !justify-center !rounded-xl bg-gray-50 text-gray-400 hover:!text-blue-600 transition-all duration-300 shadow-sm"
                    />
                </div>
            </div>
        </Sider>
    );
};

export default Sidebar;
