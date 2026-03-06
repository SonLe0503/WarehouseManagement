import { Modal, Form, Input, Select, App } from "antd";
import { useState } from "react";
import { useAppDispatch } from "../../../store";
import { createBin } from "../../../store/binSlice";
import type { IWarehouse } from "../../../store/warehouseslide";

interface AddBinModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    warehouses: IWarehouse[];
}

const AddBinModal = ({ open, onClose, onSuccess, warehouses }: AddBinModalProps) => {
    const { message } = App.useApp();
    const dispatch = useAppDispatch();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            await dispatch(createBin(values)).unwrap();
            message.success("Thêm bin thành công");
            form.resetFields();
            onSuccess();
            onClose();
        } catch (error: any) {
            if (error?.errorFields) return;
            message.error(typeof error === "string" ? error : "Có lỗi xảy ra");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Thêm bin mới"
            open={open}
            onCancel={() => { form.resetFields(); onClose(); }}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText="Thêm"
            cancelText="Hủy"
        >
            <Form form={form} layout="vertical">
                <Form.Item
                    name="warehouseId"
                    label="Kho"
                    rules={[{ required: true, message: "Vui lòng chọn kho!" }]}
                >
                    <Select placeholder="Chọn kho">
                        {warehouses.map((w) => (
                            <Select.Option key={w.id} value={w.id}>
                                {w.name} ({w.code})
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
                <Form.Item
                    name="code"
                    label="Mã bin"
                    rules={[{ required: true, message: "Nhập mã bin!" }]}
                >
                    <Input placeholder="VD: A1-01, B2-03..." />
                </Form.Item>
                <Form.Item name="name" label="Tên bin">
                    <Input placeholder="VD: Kệ A1 tầng 1..." />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AddBinModal;