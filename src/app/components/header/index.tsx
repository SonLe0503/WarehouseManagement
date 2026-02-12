import { Layout, Dropdown, Avatar, Tag, Space, Button } from "antd";
import { UserOutlined, LogoutOutlined, ClockCircleOutlined, BellOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../store";
import { logout, selectInfoLogin } from "../../../store/authSlide";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import URL from "../../../constants/url";

dayjs.extend(utc);

const { Header } = Layout;

const HeaderBar = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const infoLogin = useAppSelector(selectInfoLogin);
    const [timeLeft, setTimeLeft] = useState<number>(0);

    const pageTitle = useMemo(() => {
        const path = location.pathname;
        if (path.includes("manage-user")) return "Quản lý người dùng";
        if (path.includes("manage-category")) return "Quản lý danh mục";
        if (path.includes("manage-product")) return "Quản lý sản phẩm";
        if (path.includes("manage-unit")) return "Đơn vị tính";
        return "Dashboard";
    }, [location.pathname]);

    useEffect(() => {
        if (!infoLogin?.expiresTime) return;

        const timer = setInterval(() => {
            const now = Math.floor(Date.now() / 1000);
            const remaining = infoLogin.expiresTime - now;

            if (remaining <= 0) {
                clearInterval(timer);
                handleLogout();
            } else {
                setTimeLeft(remaining);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [infoLogin?.expiresTime]);

    const handleLogout = () => {
        dispatch(logout());
        navigate(URL.Login);
    };

    const menuItems = [
        {
            key: "profile",
            icon: <UserOutlined />,
            label: "Thông tin cá nhân",
        },
        {
            type: "divider" as const,
        },
        {
            key: "logout",
            icon: <LogoutOutlined />,
            label: "Đăng xuất",
            danger: true,
            onClick: handleLogout,
        },
    ];

    return (
        <Header className="!bg-white/80 !backdrop-blur-md border-b border-gray-100 flex justify-between items-center px-8 h-16 sticky top-0 z-40 shadow-sm">
            {/* Cột trái: Tiêu đề */}
            <div className="flex-1 flex justify-start items-center">
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-0">
                    {pageTitle}
                </h1>
            </div>

            {/* Cột giữa: Bộ đếm thời gian */}
            <div className="flex-1 flex justify-center items-center">
                {timeLeft > 0 && (
                    <Tag
                        icon={<ClockCircleOutlined className={timeLeft < 60 ? "animate-pulse" : ""} />}
                        color={timeLeft < 60 ? "error" : "processing"}
                        className="px-4 py-1 rounded-full font-medium border-none shadow-sm flex items-center gap-2 bg-gray-50/50"
                    >
                        <span className="text-[10px] uppercase tracking-wider opacity-60 font-bold font-sans">Hết hạn sau:</span>
                        <span className="text-sm font-mono font-bold tracking-wider">
                            {dayjs.utc(timeLeft * 1000).format("mm:ss")}
                        </span>
                    </Tag>
                )}
            </div>

            {/* Cột phải: Profile & Actions */}
            <div className="flex-1 flex justify-end items-center gap-4">
                <Space size={16}>
                    <Button
                        type="text"
                        icon={<BellOutlined className="text-lg text-gray-400" />}
                        className="flex items-center justify-center hover:bg-gray-100 rounded-full"
                    />

                    <Dropdown menu={{ items: menuItems }} placement="bottomRight" arrow={{ pointAtCenter: true }}>
                        <Avatar
                            style={{ backgroundColor: "#2563eb", cursor: "pointer" }}
                            icon={<UserOutlined />}
                            className="shadow-inner border-2 border-white hover:scale-110 rotate-0 transition-transform"
                        />
                    </Dropdown>
                </Space>
            </div>
        </Header>
    );
};

export default HeaderBar;
