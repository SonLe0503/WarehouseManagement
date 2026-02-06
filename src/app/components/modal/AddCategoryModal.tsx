import { Modal, Form, Input, TreeSelect, message } from "antd";
import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store";
import { createCategory, getAllCategories, selectCategories } from "../../../store/categorySlide";

interface AddCategoryModalProps {
    open: boolean;
    onClose: () => void;
}

const AddCategoryModal = (props: AddCategoryModalProps) => {
    const { open, onClose } = props;
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const categories = useAppSelector(selectCategories);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            await dispatch(createCategory(values)).unwrap();
            message.success("Thêm danh mục thành công");
            dispatch(getAllCategories());
            form.resetFields();
            onClose();
        } catch (error: any) {
            message.error(error || "Có lỗi xảy ra khi thêm danh mục");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onClose();
    };

    // Helper to map categories for TreeSelect
    const treeData = categories.map(cat => ({
        id: cat.id,
        pId: cat.parentId,
        value: cat.id,
        title: cat.name,
    }));

    return (
        <Modal
            title="Thêm danh mục mới"
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
            >
                <Form.Item
                    name="name"
                    label="Tên danh mục"
                    rules={[
                        { required: true, message: "Vui lòng nhập tên danh mục!" },
                    ]}
                >
                    <Input placeholder="Nhập tên danh mục" />
                </Form.Item>

                <Form.Item
                    name="parentId"
                    label="Danh mục cha"
                >
                    <TreeSelect
                        style={{ width: '100%' }}
                        dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                        placeholder="Chọn danh mục cha (không chọn nếu là danh mục gốc)"
                        allowClear
                        treeDataSimpleMode
                        showSearch
                        treeData={treeData}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AddCategoryModal;