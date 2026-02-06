import { Modal, Form, Input, Select, message } from "antd";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store";
import { createUser } from "../../../store/userSlide";
import { getAllRoles, selectRoles } from "../../../store/roleSlide";

interface AddUserModalProps {
    open: boolean;
    onClose: () => void;
}

const AddUserModal = (props: AddUserModalProps) => {
    const { open, onClose } = props;
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const roles = useAppSelector(selectRoles);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        dispatch(getAllRoles());
    }, [dispatch]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            await dispatch(createUser(values)).unwrap();
            message.success("Thêm tài khoản thành công");
            form.resetFields();
            onClose();
        } catch (error: any) {
            message.error(error || "Có lỗi xảy ra khi thêm tài khoản");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onClose();
    };

    return (
        <Modal
            title="Thêm tài khoản mới"
            open={open}
            onCancel={handleCancel}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText="Thêm mới"
            cancelText="Hủy"
            destroyOnHidden
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{
                    status: "ACTIVE",
                }}
            >
                <Form.Item
                    name="username"
                    label="Tên đăng nhập"
                    rules={[
                        { required: true, message: "Vui lòng nhập tên đăng nhập!" },
                        { min: 4, message: "Tên đăng nhập phải có ít nhất 4 ký tự" }
                    ]}
                >
                    <Input placeholder="Nhập tên đăng nhập" />
                </Form.Item>

                <Form.Item
                    name="password"
                    label="Mật khẩu"
                    rules={[
                        { required: true, message: "Vui lòng nhập mật khẩu!" },
                        { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" }
                    ]}
                >
                    <Input.Password placeholder="Nhập mật khẩu" />
                </Form.Item>

                <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                        { required: true, message: "Vui lòng nhập email!" },
                        { type: "email", message: "Email không hợp lệ!" }
                    ]}
                >
                    <Input placeholder="Nhập địa chỉ email" />
                </Form.Item>

                <Form.Item
                    name="status"
                    label="Trạng thái"
                >
                    <Select>
                        <Select.Option value="ACTIVE">Active</Select.Option>
                        <Select.Option value="BLOCKED">Blocked</Select.Option>
                    </Select>
                </Form.Item>

                <Form.Item
                    name="roleIds"
                    label="Vai trò"
                    rules={[{ required: true, message: "Vui lòng chọn ít nhất một vai trò!" }]}
                >
                    <Select
                        placeholder="Chọn vai trò"
                        allowClear
                    >
                        {roles
                            .filter((role) => role.name.toUpperCase() !== "ADMIN")
                            .map((role) => (
                                <Select.Option key={role.id} value={role.id}>
                                    {role.name}
                                </Select.Option>
                            ))}
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AddUserModal;
