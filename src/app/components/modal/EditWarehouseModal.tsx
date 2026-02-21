import { Modal, Form, Input, App } from "antd";
import { useEffect, useState } from "react";
import { useAppDispatch } from "../../../store";
import { updateWarehouse, getAllWarehouses, type IWarehouse } from "../../../store/warehouseslide";

interface EditWarehouseModalProps {
    open: boolean;
    onClose: () => void;
    warehouseData?: IWarehouse;
}

const EditWarehouseModal = (props: EditWarehouseModalProps) => {
    const { message } = App.useApp();
    const { open, onClose, warehouseData } = props;
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (warehouseData && open) {
            form.setFieldsValue({
                code: warehouseData.code,
                name: warehouseData.name,
                address: warehouseData.address,
            });
        }
    }, [warehouseData, open, form]);

    const handleSubmit = async () => {
        if (!warehouseData) return;
        try {
            const values = await form.validateFields();
            setLoading(true);
            await dispatch(updateWarehouse({ id: warehouseData.id, data: values })).unwrap();
            message.success("Cập nhật kho hàng thành công");
            dispatch(getAllWarehouses());
            onClose();
        } catch (error: any) {
            const errorMsg = typeof error === "string" ? error : (error?.message || "Có lỗi xảy ra khi cập nhật kho hàng");
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
            title="Chỉnh sửa kho hàng"
            open={open}
            onCancel={handleCancel}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText="Cập nhật"
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
                        { required: true, message: "Vui lòng nhập mã kho!" }
                    ]}
                >
                    <Input placeholder="Nhập mã kho" />
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

export default EditWarehouseModal;
