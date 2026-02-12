import { Modal, Form, Input, Select, TreeSelect, message } from "antd";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store";
import { getAllProducts, updateProduct, type IProduct } from "../../../store/productSlice";
import { getAllCategories, selectCategories } from "../../../store/categorySlide";
import { getAllUnits, selectUnits } from "../../../store/unitSlide";

interface EditProductModalProps {
    open: boolean;
    onClose: () => void;
    productData?: IProduct;
}

const EditProductModal = (props: EditProductModalProps) => {
    const { open, onClose, productData } = props;
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

    useEffect(() => {
        if (productData && open) {
            form.setFieldsValue({
                name: productData.name,
                categoryId: productData.categoryId,
                baseUnitId: productData.baseUnitId,
                status: productData.status,
            });
        }
    }, [productData, open, form]);

    const handleSubmit = async () => {
        if (!productData) return;
        try {
            const values = await form.validateFields();
            setLoading(true);
            await dispatch(updateProduct({ id: productData.id, data: values })).unwrap();
            message.success("Cập nhật sản phẩm thành công");
            dispatch(getAllProducts());
            onClose();
        } catch (error: any) {
            message.error(error || "Có lỗi xảy ra khi cập nhật sản phẩm");
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
            title="Sửa sản phẩm"
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
                    label="Mã SKU (Không thể sửa)"
                >
                    <Input value={productData?.sku} disabled />
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
                        styles={{ popup: { root: { maxHeight: 400, overflow: 'auto' } } }}
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

                <Form.Item
                    name="status"
                    label="Trạng thái"
                    rules={[{ required: true }]}
                >
                    <Select>
                        <Select.Option value="ACTIVE">Hoạt động</Select.Option>
                        <Select.Option value="INACTIVE">Ngừng kinh doanh</Select.Option>
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default EditProductModal;
