import { Modal, Form, Input, Switch, message } from "antd";
import { useState } from "react";
import { useAppDispatch } from "../../../store";
import { createUnit, getAllUnits } from "../../../store/unitSlide";

interface AddUnitModalProps {
    open: boolean;
    onClose: () => void;
}

const AddUnitModal = (props: AddUnitModalProps) => {
    const { open, onClose } = props;
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            await dispatch(createUnit(values)).unwrap();
            message.success("Thêm đơn vị tính thành công");
            dispatch(getAllUnits());
            form.resetFields();
            onClose();
        } catch (error: any) {
            message.error(error || "Có lỗi xảy ra khi thêm đơn vị tính");
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
            title="Thêm đơn vị tính mới"
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
                    isBaseUnit: false,
                }}
            >
                <Form.Item
                    name="code"
                    label="Mã đơn vị"
                    rules={[{ required: true, message: "Vui lòng nhập mã đơn vị!" }]}
                >
                    <Input placeholder="Nhập mã đơn vị (VD: PCS, KG...)" />
                </Form.Item>

                <Form.Item
                    name="name"
                    label="Tên đơn vị"
                    rules={[{ required: true, message: "Vui lòng nhập tên đơn vị!" }]}
                >
                    <Input placeholder="Nhập tên đơn vị" />
                </Form.Item>

                <Form.Item
                    name="description"
                    label="Mô tả"
                >
                    <Input.TextArea placeholder="Nhập mô tả" />
                </Form.Item>

                <Form.Item
                    name="isBaseUnit"
                    label="Đơn vị cơ bản"
                    valuePropName="checked"
                >
                    <Switch />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AddUnitModal;
