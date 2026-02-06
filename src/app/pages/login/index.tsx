import { Button, Form, Input, Card, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import imgkho from "../../../assets/images/login.jpg";
import { useAppDispatch } from "../../../store";
import { actionLogin } from "../../../store/authSlide";
import URL from "../../../constants/url";
import { EUserRole } from "../../../interface/app";
import { useAppSelector } from "../../../store";
import { selectInfoLogin } from "../../../store/authSlide";
import { useEffect } from "react";

const LoginPage = () => {
    const dispathch = useAppDispatch();
    const navigate = useNavigate();
    const infoLogin = useAppSelector(selectInfoLogin);

    useEffect(() => {
        if (infoLogin?.accessToken) {
            const role = infoLogin.role;
            switch (role) {
                case EUserRole.ADMIN:
                    navigate(URL.DashboardAdmin);
                    break;
                case EUserRole.STAFF:
                    navigate(URL.DashboardStaff);
                    break;
                case EUserRole.MANAGE:
                    navigate(URL.DashboardManage);
                    break;
                case EUserRole.PURCHASE:
                    navigate(URL.DashboardPurchase);
                    break;
                case EUserRole.SALE:
                    navigate(URL.DashboardSale);
                    break;
            }
        }
    }, [infoLogin, navigate]);

    const onFinish = async (values: any) => {
        try {
            const res: any = await dispathch(actionLogin(values));
            if (actionLogin.fulfilled.match(res)) {
                message.success("Đăng nhập thành công!");
            } else {
                message.error("Đăng nhập thất bại! Vui lòng kiểm tra lại thông tin.");
            }
        } catch (error: any) {
            message.error("Đăng nhập thất bại! Vui lòng kiểm tra lại thông tin.");
        }
    }

    return (
        <>
            <div className="min-h-screen flex bg-gray-100">
                <div className="w-full lg:w-1/2 flex items-center justify-center relative overflow-hidden">
                    <img src={imgkho} className="w-full h-full rounded-tr-[250px] rounded-bl-[250px]" />
                    <div className="bg-black/40 w-full flex items-center justify-center absolute">
                        <div className="text-white text-center px-10">
                            <h1 className="text-4xl font-bold mb-4">
                                Warehouse Management System
                            </h1>
                            <p className="text-lg opacity-90">
                                Quản lý kho hàng thông minh – chính xác – hiệu quả
                            </p>
                        </div>
                    </div>
                </div>
                <div className="w-full lg:w-1/2 flex items-center justify-center">
                    <Card className="w-full max-w-lg shadow-xl">
                        <div className="text-center mb-6">
                            <div className="text-blue-500 font-bold text-[50px]">LOGIN</div>
                        </div>

                        <Form
                            name="login"
                            layout="vertical"
                            autoComplete="off"
                            onFinish={onFinish}
                        >
                            <Form.Item
                                label="Username"
                                name="username"
                                rules={[
                                    { required: true, message: "Vui lòng nhập username!" },
                                ]}
                            >
                                <Input
                                    size="large"
                                    prefix={<UserOutlined />}
                                    placeholder="Nhập username"
                                />
                            </Form.Item>

                            <Form.Item
                                label="Password"
                                name="password"
                                rules={[
                                    { required: true, message: "Vui lòng nhập password!" },
                                ]}
                            >
                                <Input.Password
                                    size="large"
                                    prefix={<LockOutlined />}
                                    placeholder="Nhập password"
                                />
                            </Form.Item>

                            <Form.Item className="mt-6">
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    size="large"
                                    className="w-full"
                                >
                                    Login
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </div>
            </div>
        </>
    )
}
export default LoginPage;