import { Button, Form, Input, App } from "antd";
import { LockOutlined, KeyOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { useAppDispatch } from "../../../../store";
import { changePassword } from "../../../../store/authSlide";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const ChangePassword = () => {
    const { message } = App.useApp();
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            await dispatch(changePassword({
                CurrentPassword: values.currentPassword,
                NewPassword: values.newPassword
            })).unwrap();

            message.success("Đổi mật khẩu thành công!");
            form.resetFields();
            // Optional: navigate to dashboard after success
            setTimeout(() => {
                navigate(-1); // Quay lại trang trước đó
            }, 1000);
        } catch (error: any) {
            message.error(error || "Không thể đổi mật khẩu. Vui lòng kiểm tra lại.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col justify-center items-center min-h-[calc(100vh-120px)] p-4 page-fade-in">
            <div className="flex flex-col items-center py-4">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-3">
                    <LockOutlined className="text-2xl text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 m-0 text-center">Đổi Mật Khẩu</h2>
                <p className="text-gray-400 text-sm mt-1 font-normal">Cập nhật mật khẩu để bảo mật tài khoản</p>
            </div>
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                requiredMark={false}
                className="mt-2"
            >
                <Form.Item
                    label={<span className="text-gray-600 font-medium">Mật khẩu hiện tại</span>}
                    name="currentPassword"
                    rules={[{ required: true, message: "Vui lòng nhập mật khẩu hiện tại" }]}
                >
                    <Input.Password
                        prefix={<KeyOutlined className="text-gray-400 mr-2" />}
                        placeholder="Nhập mật khẩu cũ"
                        className="h-11 rounded-xl border-gray-200 hover:border-blue-400 focus:border-blue-500"
                    />
                </Form.Item>

                <Form.Item
                    label={<span className="text-gray-600 font-medium">Mật khẩu mới</span>}
                    name="newPassword"
                    rules={[
                        { required: true, message: "Vui lòng nhập mật khẩu mới" },
                        { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" }
                    ]}
                >
                    <Input.Password
                        prefix={<LockOutlined className="text-gray-400 mr-2" />}
                        placeholder="Nhập mật khẩu mới"
                        className="h-11 rounded-xl border-gray-200 hover:border-blue-400 focus:border-blue-500"
                    />
                </Form.Item>

                <Form.Item
                    label={<span className="text-gray-600 font-medium">Xác nhận mật khẩu mới</span>}
                    name="confirmPassword"
                    dependencies={['newPassword']}
                    rules={[
                        { required: true, message: "Vui lòng xác nhận mật khẩu mới" },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('newPassword') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error("Mật khẩu xác nhận không khớp!"));
                            },
                        }),
                    ]}
                >
                    <Input.Password
                        prefix={<CheckCircleOutlined className="text-gray-400 mr-2" />}
                        placeholder="Nhập lại mật khẩu mới"
                        className="h-11 rounded-xl border-gray-200 hover:border-blue-400 focus:border-blue-500"
                    />
                </Form.Item>

                <Form.Item className="mb-0 mt-8">
                    <Button
                        type="primary"
                        htmlType="submit"
                        loading={loading}
                        block
                        className="h-12 rounded-xl text-base font-bold bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200"
                    >
                        CẬP NHẬT MẬT KHẨU
                    </Button>
                    <Button
                        type="link"
                        block
                        onClick={() => navigate(-1)}
                        className="mt-2 text-gray-400 hover:text-gray-600"
                    >
                        Hủy bỏ và quay lại
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
};

export default ChangePassword;
