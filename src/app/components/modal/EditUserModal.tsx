import { Modal, Form, Input, Select, message } from "antd";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store";
import { updateUser } from "../../../store/userSlide";
import { getAllRoles, selectRoles } from "../../../store/roleSlide";
import type { IUser } from "../../../store/userSlide";

interface EditUserModalProps {
    open: boolean;
    onClose: () => void;
    userData?: IUser;
}

const EditUserModal = (props: EditUserModalProps) => {
    const { open, onClose, userData } = props;
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const roles = useAppSelector(selectRoles);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            dispatch(getAllRoles());
        }
    }, [dispatch, open]);

    useEffect(() => {
        if (userData && open) {
            // Map role names to role IDs
            const userRoleIds = userData.roles.map(roleName => {
                const role = roles.find(r => r.name === roleName);
                return role ? role.id : undefined;
            }).filter((id): id is number => id !== undefined);

            form.setFieldsValue({
                username: userData.username,
                email: userData.email,
                status: userData.status,
                roleIds: userRoleIds.length > 0 ? userRoleIds[0] : undefined, // Assuming single role selection for now as per AddUserModal context
            });
        } else {
            form.resetFields();
        }
    }, [userData, open, roles, form]);

    const handleSubmit = async () => {
        if (!userData) return;

        try {
            const values = await form.validateFields();
            setLoading(true);
            const payload = {
                id: userData.id,
                data: {
                    ...values,
                    roleIds: values.roleIds ? [values.roleIds] : [],
                }
            };

            await dispatch(updateUser(payload)).unwrap();
            message.success("Cập nhật tài khoản thành công");
            onClose();
        } catch (error: any) {
            message.error(error || "Có lỗi xảy ra khi cập nhật tài khoản");
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
            title="Sửa thông tin tài khoản"
            open={open}
            onCancel={handleCancel}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText="Cập nhật"
            cancelText="Hủy"
        >
            <Form
                form={form}
                layout="vertical"
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
                        disabled={userData?.roles.some((role) => role.toUpperCase() === "ADMIN")}
                    >
                        {roles.map((role) => (
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

export default EditUserModal;