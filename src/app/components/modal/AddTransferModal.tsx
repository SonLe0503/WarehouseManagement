// components/modal/AddTransferModal.tsx
import { Modal, Form, Input, Select, Button, InputNumber, Divider, App } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store";
import { createStockTransfer } from "../../../store/stockTransfer2StepSlice";
import { getAllProducts, selectProducts } from "../../../store/productSlice";
import { getActiveWarehouses, selectWarehouses } from "../../../store/warehouseslide";
import { getUnitConversionsByProduct, selectUnitConversions, clearUnitConversions } from "../../../store/unitConversionSlice";

interface AddTransferModalProps {
    open: boolean;
    onClose: () => void;
}

const AddTransferModal = ({ open, onClose }: AddTransferModalProps) => {
    const { message } = App.useApp();
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();

    const products = useAppSelector(selectProducts);
    const warehouses = useAppSelector(selectWarehouses);
    const conversions = useAppSelector(selectUnitConversions);
    const [loading, setLoading] = useState(false);
    const [loadedProducts, setLoadedProducts] = useState<Set<number>>(new Set());

    useEffect(() => {
        if (open) {
            dispatch(getAllProducts());
            dispatch(getActiveWarehouses());
        } else {
            dispatch(clearUnitConversions());
            setLoadedProducts(new Set());
        }
    }, [open, dispatch]);

    const handleProductChange = (productId: number, fieldName: number) => {
        const product = products.find(p => p.id === productId);
        // Reset unitId về base unit khi đổi sản phẩm
        const items = form.getFieldValue("items");
        items[fieldName] = {
            ...items[fieldName],
            productId,
            unitId: product?.baseUnitId,
            quantity: undefined,
        };
        form.setFieldsValue({ items });

        if (!loadedProducts.has(productId)) {
            dispatch(getUnitConversionsByProduct(productId));
            setLoadedProducts(prev => new Set(prev).add(productId));
        }
    };

    const getUnitsForProduct = (productId: number) => {
        const product = products.find(p => p.id === productId);
        if (!product) return [];
        const base = [{ value: product.baseUnitId, label: `${product.baseUnitCode} (gốc)` }];
        const convs = conversions
            .filter(c => c.productId === productId)
            .map(c => ({ value: c.fromUnitId, label: `×${c.rate} ${product.baseUnitCode}` }));
        return [...base, ...convs];
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            if (values.fromWarehouseId === values.toWarehouseId) {
                message.error("Kho nguồn và kho đích phải khác nhau!");
                setLoading(false);
                return;
            }

            const payload = {
                ...values,
                items: values.items.map((item: any) => ({
                    productId: Number(item.productId),
                    unitId: Number(item.unitId),
                    quantity: Number(item.quantity),
                    lineNote: item.lineNote,
                })),
            };

            await dispatch(createStockTransfer(payload)).unwrap();
            message.success("Tạo yêu cầu chuyển kho thành công");
            form.resetFields();
            onClose();
        } catch (error: any) {
            message.error(typeof error === "string" ? error : "Có lỗi xảy ra khi tạo phiếu");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Tạo yêu cầu chuyển kho"
            open={open}
            onCancel={() => { form.resetFields(); onClose(); }}
            onOk={handleSubmit}
            confirmLoading={loading}
            width={960}
            okText="Gửi yêu cầu"
            cancelText="Hủy"
            style={{ top: 20 }}
        >
            <Form form={form} layout="vertical" initialValues={{ items: [{}] }}>
                <div className="grid grid-cols-2 gap-4">
                    <Form.Item name="fromWarehouseId" label="Kho nguồn (xuất)"
                        rules={[{ required: true, message: "Vui lòng chọn kho nguồn!" }]}>
                        <Select placeholder="Chọn kho nguồn">
                            {warehouses.map(w => (
                                <Select.Option key={w.id} value={w.id}>{w.name} ({w.code})</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item name="toWarehouseId" label="Kho đích (nhập)"
                        rules={[{ required: true, message: "Vui lòng chọn kho đích!" }]}>
                        <Select placeholder="Chọn kho đích">
                            {warehouses.map(w => (
                                <Select.Option key={w.id} value={w.id}>{w.name} ({w.code})</Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </div>

                <Form.Item name="note" label="Ghi chú">
                    <Input.TextArea placeholder="Ghi chú cho phiếu chuyển kho" rows={2} />
                </Form.Item>

                <Divider>Danh sách sản phẩm chuyển</Divider>

                <Form.List name="items" rules={[{
                    validator: async (_, names) => {
                        if (!names || names.length < 1) return Promise.reject(new Error("Phải có ít nhất 1 sản phẩm"));
                    },
                }]}>
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => {
                                const productId = form.getFieldValue(["items", name, "productId"]);
                                const unitOptions = productId ? getUnitsForProduct(productId) : [];

                                return (
                                    <div key={key} className="flex gap-2 items-start mb-2 bg-gray-50 p-3 rounded">
                                        {/* Sản phẩm */}
                                        <Form.Item {...restField} name={[name, "productId"]} label="Sản phẩm"
                                            rules={[{ required: true, message: "Chọn SP" }]} className="flex-[2] mb-0">
                                            <Select placeholder="Chọn sản phẩm" showSearch
                                                filterOption={(input, option) =>
                                                    (option?.children as any)?.toLowerCase().includes(input.toLowerCase())
                                                }
                                                onChange={(v) => handleProductChange(v, name)}>
                                                {products.map(p => (
                                                    <Select.Option key={p.id} value={p.id}>{p.name} - {p.sku}</Select.Option>
                                                ))}
                                            </Select>
                                        </Form.Item>

                                        {/* Đơn vị */}
                                        <Form.Item {...restField} name={[name, "unitId"]} label="Đơn vị"
                                            rules={[{ required: true, message: "Chọn ĐV" }]} className="w-36 mb-0">
                                            <Select placeholder="Đơn vị" disabled={!productId} options={unitOptions} />
                                        </Form.Item>

                                        {/* Số lượng */}
                                        <Form.Item {...restField} name={[name, "quantity"]} label="Số lượng"
                                            rules={[{ required: true, message: "Nhập SL" }]} className="w-32 mb-0">
                                            <InputNumber min={0.01} className="w-full" placeholder="SL" />
                                        </Form.Item>

                                        {/* Ghi chú dòng */}
                                        <Form.Item {...restField} name={[name, "lineNote"]} label="Ghi chú"
                                            className="flex-1 mb-0">
                                            <Input placeholder="Ghi chú" />
                                        </Form.Item>

                                        <Button type="text" danger icon={<DeleteOutlined />}
                                            onClick={() => remove(name)} className="mt-8"
                                            disabled={fields.length === 1} />
                                    </div>
                                );
                            })}
                            <Form.Item className="mt-3">
                                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                    Thêm sản phẩm
                                </Button>
                            </Form.Item>
                        </>
                    )}
                </Form.List>
            </Form>
        </Modal>
    );
};

export default AddTransferModal;