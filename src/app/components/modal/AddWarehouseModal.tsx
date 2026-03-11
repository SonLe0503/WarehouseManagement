import { Modal, Form, Input, App } from "antd";
import { useState } from "react";
import { useAppDispatch } from "../../../store";
import { createWarehouse, getAllWarehouses } from "../../../store/warehouseslide";

interface AddWarehouseModalProps {
    open: boolean;
    onClose: () => void;
}

const AddWarehouseModal = (props: AddWarehouseModalProps) => {
    const { message } = App.useApp();
    const { open, onClose } = props;
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            await dispatch(createWarehouse(values)).unwrap();
            message.success("Thêm kho hàng thành công");
            dispatch(getAllWarehouses());
            form.resetFields();
            onClose();
        } catch (error: any) {
            const errorMsg = typeof error === "string" ? error : (error?.message || "Có lỗi xảy ra khi thêm kho hàng");
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
            title="Thêm kho hàng mới"
            open={open}
            onCancel={handleCancel}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText="Thêm mới"
            cancelText="Hủy"
            destroyOnClose
        >
            <Form
                form={form}
                layout="vertical"
            >
                <Form.Item
                    name="code"
                    label="Mã kho"
                    rules={[
                        { required: true, message: "Vui lòng nhập mã kho!" },
                        { min: 2, message: "Mã kho phải có ít nhất 2 ký tự" }
                    ]}
                >
                    <Input placeholder="Nhập mã kho (VD: WH01)" />
                </Form.Item>

                <Form.Item
                    name="name"
                    label="Tên kho"
                    rules={[
                        { required: true, message: "Vui lòng nhập tên kho!" }
                    ]}
                >
                    <Input placeholder="Nhập tên kho hàng" />
                </Form.Item>

                <Form.Item
                    name="address"
                    label="Địa chỉ"
                >
                    <Input.TextArea placeholder="Nhập địa chỉ kho hàng" rows={3} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AddWarehouseModal;
