import { Modal, Form, Input, TreeSelect, message } from "antd";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store";
import { getAllCategories, selectCategories, updateCategory, type ICategory } from "../../../store/categorySlide";

interface EditCategoryModalProps {
    open: boolean;
    onClose: () => void;
    categoryData?: ICategory;
}

const EditCategoryModal = (props: EditCategoryModalProps) => {
    const { open, onClose, categoryData } = props;
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const categories = useAppSelector(selectCategories);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (categoryData && open) {
            form.setFieldsValue({
                name: categoryData.name,
                parentId: categoryData.parentId,
            });
        }
    }, [categoryData, open, form]);

    const handleSubmit = async () => {
        if (!categoryData) return;
        try {
            const values = await form.validateFields();
            setLoading(true);
            await dispatch(updateCategory({ id: categoryData.id, data: values })).unwrap();
            message.success("Cập nhật danh mục thành công");
            dispatch(getAllCategories());
            onClose();
        } catch (error: any) {
            message.error(error || "Có lỗi xảy ra khi cập nhật danh mục");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        onClose();
    };

    const getFilteredTreeData = (items: ICategory[]): any[] => {
        const result: any[] = [];

        const isDescendant = (parent: ICategory, targetId: number): boolean => {
            if (parent.id === targetId) return true;
            if (parent.children) {
                return parent.children.some(child => isDescendant(child, targetId));
            }
            return false;
        };

        const mapItem = (item: ICategory) => {
            // Cannot select self or descendants as parent
            const disabled = categoryData ? isDescendant(categoryData, item.id) : false;

            const node: any = {
                id: item.id,
                pId: item.parentId,
                value: item.id,
                title: item.name,
                disabled: disabled
            };
            result.push(node);
            if (item.children) {
                item.children.forEach(mapItem);
            }
        };

        items.forEach(mapItem);
        return result;
    };

    return (
        <Modal
            title="Sửa danh mục"
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
                        treeData={getFilteredTreeData(categories)}
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default EditCategoryModal;