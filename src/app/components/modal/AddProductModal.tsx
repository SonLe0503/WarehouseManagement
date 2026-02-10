import { Modal, Form, Input, Select, TreeSelect, message } from "antd";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store";
import { createProduct, getAllProducts } from "../../../store/productSlice";
import { getAllCategories, selectCategories } from "../../../store/categorySlide";
import { getAllUnits, selectUnits } from "../../../store/unitSlide";

interface AddProductModalProps {
    open: boolean;
    onClose: () => void;
}

const AddProductModal = (props: AddProductModalProps) => {
    const { open, onClose } = props;
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const categories = useAppSelector(selectCategories);
    const units = useAppSelector(selectUnits);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            dispatch(getAllCategories());
            dispatch(getAllUnits());
        }
    }, [open, dispatch]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);
            await dispatch(createProduct(values)).unwrap();
            message.success("Thêm sản phẩm thành công");
            dispatch(getAllProducts());
            form.resetFields();
            onClose();
        } catch (error: any) {
            message.error(error || "Có lỗi xảy ra khi thêm sản phẩm");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onClose();
    };

    // Map categories for TreeSelect
    const getTreeData = (items: any[]): any[] => {
        return items.map(cat => ({
            id: cat.id,
            pId: cat.parentId,
            value: cat.id,
            title: cat.name,
            children: cat.children ? getTreeData(cat.children) : []
        }));
    };

    return (
        <Modal
            title="Thêm sản phẩm mới"
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
                    name="sku"
                    label="Mã SKU"
                    rules={[{ required: true, message: "Vui lòng nhập mã SKU!" }]}
                >
                    <Input placeholder="Nhập mã SKU" />
                </Form.Item>

                <Form.Item
                    name="name"
                    label="Tên sản phẩm"
                    rules={[{ required: true, message: "Vui lòng nhập tên sản phẩm!" }]}
                >
                    <Input placeholder="Nhập tên sản phẩm" />
                </Form.Item>

                <Form.Item
                    name="categoryId"
                    label="Danh mục"
                    rules={[{ required: true, message: "Vui lòng chọn danh mục!" }]}
                >
                    <TreeSelect
                        style={{ width: '100%' }}
                        dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                        placeholder="Chọn danh mục"
                        allowClear
                        treeDataSimpleMode
                        showSearch
                        treeData={categories.map(cat => ({
                            id: cat.id,
                            pId: cat.parentId,
                            value: cat.id,
                            title: cat.name,
                        }))}
                    />
                </Form.Item>

                <Form.Item
                    name="baseUnitId"
                    label="Đơn vị tính cơ bản"
                    rules={[{ required: true, message: "Vui lòng chọn đơn vị tính!" }]}
                >
                    <Select placeholder="Chọn đơn vị tính cơ bản">
                        {units.map((unit) => (
                            <Select.Option key={unit.id} value={unit.id}>
                                {unit.name} ({unit.code})
                            </Select.Option>
                        ))}
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default AddProductModal;
