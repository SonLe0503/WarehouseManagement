import { Modal, Form, Input, Select, TreeSelect, message } from "antd";
import { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../../store";
import { getAllProducts, updateProduct, getProductById, selectCurrentProduct, type IProduct } from "../../../store/productSlice";
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
    const currentProductFromApi = useAppSelector(selectCurrentProduct);
    const [loading, setLoading] = useState(false);

    // Dữ liệu hiển thị ưu tiên lấy từ API (sau khi gọi chi tiết), nếu chưa có thì dùng từ prop
    const activeData = currentProductFromApi || productData;

    useEffect(() => {
        if (open && productData?.id) {
            dispatch(getProductById(productData.id));
            dispatch(getAllCategories());
            dispatch(getAllUnits());
        }
    }, [open, productData?.id, dispatch]);

    useEffect(() => {
        if (activeData && open) {
            // Logic phục hồi ID nếu API trả về thiếu (như trường hợp bạn gặp phải)
            let recoveredCategoryId = activeData.categoryId;
            let recoveredBaseUnitId = activeData.baseUnitId;

            // 1. Phục hồi Category ID bằng cách tìm theo tên (categoryName)
            if (!recoveredCategoryId && activeData.categoryName && categories.length > 0) {
                const findInTree = (items: any[]): any => {
                    for (const item of items) {
                        if (item.name === activeData.categoryName) return item.id;
                        if (item.children?.length) {
                             const found = findInTree(item.children);
                             if (found) return found;
                        }
                    }
                    return null;
                };
                recoveredCategoryId = findInTree(categories);
            }

            // 2. Phục hồi Unit ID bằng cách tìm theo Code hoặc Tên
            if (!recoveredBaseUnitId && activeData.baseUnitCode && units.length > 0) {
                const matchedUnit = units.find(u => u.code === activeData.baseUnitCode || u.name === activeData.baseUnitCode);
                if (matchedUnit) recoveredBaseUnitId = matchedUnit.id;
            }

            form.setFieldsValue({
                name: activeData.name,
                categoryId: recoveredCategoryId,
                baseUnitId: recoveredBaseUnitId,
                status: activeData.status,
            });
        }
    }, [activeData, open, form, categories, units]);

    // Chuẩn bị dữ liệu cho Select/TreeSelect để luôn hiển thị Nhãn thay vì ID
    const { treeData, unitOptions } = useMemo(() => {
        const flatten = (items: any[]): any[] => {
            let res: any[] = [];
            items.forEach(cat => {
                res.push({ id: cat.id, pId: cat.parentId, value: cat.id, title: cat.name });
                if (cat.children?.length) res = [...res, ...flatten(cat.children)];
            });
            return res;
        };

        let flattenedCats = flatten(categories);
        let currentUnits = [...units];

        // "Mồi" dữ liệu hiện tại vào danh sách để đảm bảo khi chưa load xong API vẫn hiện được Tên
        if (activeData?.categoryId && !flattenedCats.find(c => c.id === activeData.categoryId)) {
            flattenedCats.push({
                id: activeData.categoryId,
                pId: null,
                value: activeData.categoryId,
                title: activeData.categoryName || `Danh mục #${activeData.categoryId}`,
            });
        }
        if (activeData?.baseUnitId && !currentUnits.find(u => u.id === activeData.baseUnitId)) {
            currentUnits.push({
                id: activeData.baseUnitId,
                name: activeData.baseUnitCode || 'Đơn vị hiện tại',
                code: activeData.baseUnitCode || '',
            } as any);
        }

        return { treeData: flattenedCats, unitOptions: currentUnits };
    }, [categories, units, activeData]);

    const handleSubmit = async () => {
        if (!activeData) return;
        try {
            const values = await form.validateFields();
            setLoading(true);
            await dispatch(updateProduct({ id: activeData.id, data: values })).unwrap();
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
            destroyOnClose
        >
            <Form form={form} layout="vertical">
                <Form.Item label="Mã SKU (Không thể sửa)">
                    <Input value={activeData?.sku} disabled className="bg-gray-50" />
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
                        treeData={treeData}
                    />
                </Form.Item>

                <Form.Item
                    name="baseUnitId"
                    label="Đơn vị tính cơ bản"
                    rules={[{ required: true, message: "Vui lòng chọn đơn vị tính!" }]}
                >
                    <Select placeholder="Chọn đơn vị tính cơ bản">
                        {unitOptions.map((unit: any) => (
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
