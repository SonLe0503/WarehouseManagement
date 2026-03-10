import { Modal, Form, Input, Select, App } from "antd";
import { useEffect, useState } from "react";
import { useAppDispatch } from "../../../store";
import { updateBin, type IBin } from "../../../store/binSlice";

interface EditBinModalProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
    binData?: IBin;
}

const EditBinModal = ({ open, onClose, onSuccess, binData }: EditBinModalProps) => {
    const { message } = App.useApp();
    const dispatch = useAppDispatch();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && binData) {
            form.setFieldsValue({
                code: binData.code,
                name: binData.name,
                status: binData.status,
            });
        }
    }, [open, binData, form]);

    const handleSubmit = async () => {
        if (!binData) return;
        try {
            const values = await form.validateFields();
            setLoading(true);
            await dispatch(updateBin({ id: binData.id, data: values })).unwrap();
            message.success("Cập nhật bin thành công");
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
            title="Chỉnh sửa bin"
            open={open}
            onCancel={onClose}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText="Lưu"
            cancelText="Hủy"
        >
            <Form form={form} layout="vertical">
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
                <Form.Item
                    name="status"
                    label="Trạng thái"
                    rules={[{ required: true, message: "Chọn trạng thái!" }]}
                >
                    <Select>
                        <Select.Option value="Available">Khả dụng</Select.Option>
                        <Select.Option value="Inactive">Không dùng</Select.Option>
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default EditBinModal;