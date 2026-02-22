import { Button, Descriptions, Avatar, Tag } from "antd";
import { UserOutlined, MailOutlined, SafetyCertificateOutlined, KeyOutlined } from "@ant-design/icons";
import { useAppSelector } from "../../../store";
import { selectInfoLogin } from "../../../store/authSlide";
import { useNavigate } from "react-router-dom";
import URL from "../../../constants/url";

const ProfilePage = () => {
    const navigate = useNavigate();
    const infoLogin = useAppSelector(selectInfoLogin);

    return (
        <div className="p-4">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Thông tin cá nhân</h2>
                <p className="text-gray-500">Quản lý thông tin tài khoản của bạn</p>
            </div>

            <div className="py-6 px-4">
                <div className="flex flex-col items-center mb-8">
                    <Avatar size={100} icon={<UserOutlined />} className="bg-blue-600 shadow-lg border-4 border-white" />
                    <h3 className="text-xl font-bold mt-4 text-gray-800">{infoLogin?.userId ? `User ID: ${infoLogin.userId}` : "Người dùng"}</h3>
                    <Tag color="blue" className="mt-2 rounded-full px-4">{infoLogin?.role || "STAFF"}</Tag>
                </div>

                <div className="max-w-2xl mx-auto">
                    <Descriptions bordered column={1} className="bg-gray-50/50 rounded-xl overflow-hidden mb-6">
                        <Descriptions.Item label={<span className="font-semibold"><UserOutlined className="mr-2" />Vai trò</span>}>
                            {infoLogin?.role || "Không xác định"}
                        </Descriptions.Item>
                        <Descriptions.Item label={<span className="font-semibold"><MailOutlined className="mr-2" />ID Đăng nhập</span>}>
                            {infoLogin?.userId || "—"}
                        </Descriptions.Item>
                        <Descriptions.Item label={<span className="font-semibold"><SafetyCertificateOutlined className="mr-2" />Trạng thái</span>}>
                            <Tag color="green">Đang hoạt động</Tag>
                        </Descriptions.Item>
                    </Descriptions>

                    <div className="flex justify-center mt-8">
                        <Button
                            type="primary"
                            icon={<KeyOutlined />}
                            size="large"
                            className="bg-blue-600 h-12 px-8 rounded-xl font-bold shadow-lg shadow-blue-100"
                            onClick={() => navigate(URL.ChangePassword)}
                        >
                            ĐỔI MẬT KHẨU
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
