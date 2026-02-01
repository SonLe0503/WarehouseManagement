import { Layout, Dropdown, Avatar } from "antd";
import { UserOutlined, LogoutOutlined } from "@ant-design/icons";
import { useAppDispatch } from "../../../store";
import { logout } from "../../../store/authSlide";
import { useNavigate } from "react-router-dom";

const { Header } = Layout;

const HeaderBar = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        dispatch(logout());
        navigate("/login");
    };

    const items = [
        {
            key: "logout",
            icon: <LogoutOutlined />,
            label: "Đăng xuất",
            onClick: handleLogout,
        },
    ];

    return (
        <Header style={{ background: "#fff" }} className="shadow flex justify-between items-center px-6">
            <div className="font-semibold text-lg">
                Dashboard
            </div>

            <Dropdown menu={{ items }}>
                <div className="flex items-center gap-2 cursor-pointer">
                    <Avatar icon={<UserOutlined />} />
                </div>
            </Dropdown>
        </Header>
    );
};

export default HeaderBar;
