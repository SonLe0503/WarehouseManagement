import { Layout, Menu } from "antd";
import {
    AppstoreOutlined,
    MenuUnfoldOutlined,
    MenuFoldOutlined,
    UserOutlined,
    InboxOutlined,
} from "@ant-design/icons";
import { useAppSelector } from "../../../store";
import { useNavigate, useLocation } from "react-router-dom";
import { selectInfoLogin } from "../../../store/authSlide";
import URL from "../../../constants/url";
import { useState } from "react";
import { motion } from "framer-motion";

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
                key: "sub-catalog", icon: <InboxOutlined />,
                label: "Danh mục & Sản phẩm",
                children: [
                    {
                        key: URL.ManageCategory,
                        label: "Danh mục",
                    },
                    {
                        key: URL.ManageProduct,
                        label: "Sản phẩm",
                    },
                    {
                        key: URL.ManageUnit,
                        label: "Đơn vị tính",
                    },
                ],
            },
        ],
        MANAGER: [{ key: URL.DashboardManage, icon: <AppstoreOutlined />, label: "Tổng quan" }],
        STAFF: [{ key: URL.DashboardStaff, icon: <AppstoreOutlined />, label: "Tổng quan" }],
        PURCHASE: [{ key: URL.DashboardPurchase, icon: <AppstoreOutlined />, label: "Tổng quan" }],
        SALE: [{ key: URL.DashboardSale, icon: <AppstoreOutlined />, label: "Tổng quan" }],
    };

    return (
        <Sider
            theme="light"
            width={collapsed ? 80 : 240}
            collapsedWidth={80}
            trigger={null}
            className="bg-white"
        >
            <motion.div
                animate={{ width: collapsed ? 80 : 240 }}
                transition={{ duration: 0.3 }}
                className="h-full flex flex-col justify-between"
            >
                <div className="h-16 flex items-center justify-center font-bold text-blue-600 text-xl">
                    {collapsed ? "W" : "WMS"}
                </div>
                <Menu
                    mode="inline"
                    selectedKeys={[location.pathname]}
                    className="border-r-0 flex-1"
                    items={
                        role
                            ? menuByRole[role].map((item: any) => ({
                                ...item,
                                label: collapsed ? null : item.label,
                            }))
                            : []
                    }
                    onClick={({ key }) => {
                        if (key.startsWith("/")) {
                            navigate(key);
                        }
                    }}
                />
                <div className="flex justify-center items-center p-3 border-t border-gray-300">
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="p-2 rounded-full hover:bg-gray-100 transition"
                    >
                        {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    </button>
                </div>
            </motion.div>
        </Sider>
    );
};

export default Sidebar;
