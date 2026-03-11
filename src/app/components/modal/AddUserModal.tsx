import { Modal, Form, Input, Select, App } from "antd";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store";
import { createUser, getAllUsers } from "../../../store/userSlide";
import { getAllRoles, selectRoles } from "../../../store/roleSlide";
import { getActiveWarehouses, selectWarehouses } from "../../../store/warehouseslide";

interface AddUserModalProps {
    open: boolean;
    onClose: () => void;
}

const AddUserModal = (props: AddUserModalProps) => {
    const { message } = App.useApp();
    const { open, onClose } = props;
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const roles = useAppSelector(selectRoles);
    const warehouses = useAppSelector(selectWarehouses);
    const [loading, setLoading] = useState(false);

    const roleIds = Form.useWatch("roleIds", form);
    const isAdmin = roleIds?.includes(1);

    useEffect(() => {
        if (open) {
            dispatch(getAllRoles());
            dispatch(getActiveWarehouses());
        }
    }, [dispatch, open]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            // Per backend logic: if Admin, WarehouseId is null
            const payload = {
                ...values,
                warehouseId: isAdmin ? null : values.warehouseId
            };

            await dispatch(createUser(payload)).unwrap();
            message.success("Thêm tài khoản thành công");
            dispatch(getAllUsers());
            form.resetFields();
            onClose();
        } catch (error: any) {
            let errorMsg = "Có lỗi xảy ra khi thêm tài khoản";
            if (typeof error === "string") {
                errorMsg = error;
            } else if (error?.errors) {
                errorMsg = Object.values(error.errors).flat().join(", ");
            } else if (error?.message || error?.title) {
                errorMsg = error.message || error.title;
            }
            message.error(errorMsg);
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
                    status: "Active",
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
                        <Select.Option value="Active">Active</Select.Option>
                        <Select.Option value="Inactive">Inactive</Select.Option>
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
                        mode="multiple"
                    >
                        {roles
                            .map((role) => (
                                <Select.Option key={role.id} value={role.id}>
                                    {role.name}
                                </Select.Option>
                            ))}
                    </Select>
                </Form.Item>

                {!isAdmin && (
                    <Form.Item
                        name="warehouseId"
                        label="Kho quản lý"
                        rules={[{ required: true, message: "Vui lòng chọn kho!" }]}
                    >
                        <Select
                            placeholder="Chọn kho quản lý"
                            allowClear
                        >
                            {warehouses.map((w) => (
                                <Select.Option key={w.id} value={w.id}>
                                    {w.name}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                )}
            </Form>
        </Modal>
    );
};

export default AddUserModal;
