import { Modal, Form, Input, Switch, message } from "antd";
import { useEffect, useState } from "react";
import { useAppDispatch } from "../../../store";
import { getAllUnits, updateUnit, type IUnit } from "../../../store/unitSlide";

interface EditUnitModalProps {
    open: boolean;
    onClose: () => void;
    unitData?: IUnit;
}

const EditUnitModal = (props: EditUnitModalProps) => {
    const { open, onClose, unitData } = props;
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (unitData && open) {
            form.setFieldsValue({
                code: unitData.code,
                name: unitData.name,
                description: unitData.description,
                isBaseUnit: unitData.isBaseUnit,
            });
        }
    }, [unitData, open, form]);

    const handleSubmit = async () => {
        if (!unitData) return;
        try {
            const values = await form.validateFields();
            setLoading(true);
            await dispatch(updateUnit({ id: unitData.id, data: values })).unwrap();
            message.success("Cập nhật đơn vị tính thành công");
            dispatch(getAllUnits());
            onClose();
        } catch (error: any) {
            message.error(error || "Có lỗi xảy ra khi cập nhật đơn vị tính");
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
            title="Sửa đơn vị tính"
            open={open}
            onCancel={handleCancel}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText="Cập nhật"
            cancelText="Hủy"
            destroyOnHidden
        >
            <Form
                form={form}
                layout="vertical"
            >
                <Form.Item
                    name="code"
                    label="Mã đơn vị"
                    rules={[{ required: true, message: "Vui lòng nhập mã đơn vị!" }]}
                >
                    <Input placeholder="Nhập mã đơn vị" />
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

export default EditUnitModal;
