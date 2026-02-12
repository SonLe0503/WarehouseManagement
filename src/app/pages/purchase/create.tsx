import { Button, Form, Input, InputNumber, Select, message, Card, Spin, Divider } from "antd";
import { PlusOutlined, DeleteOutlined, LeftOutlined } from "@ant-design/icons";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../store";
import { createInboundRequest } from "../../../store/inboundSlice";
import { getAllProducts, selectProducts } from "../../../store/productSlice";
import { getActiveWarehouses, selectWarehouses } from "../../../store/warehouseslide";
import type { DividerProps } from 'antd';

const CreatePurchaseRequest = () => {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const products = useAppSelector(selectProducts);
    const warehouses = useAppSelector(selectWarehouses);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        dispatch(getAllProducts());
        dispatch(getActiveWarehouses());
    }, [dispatch]);

    const onFinish = async (values: any) => {
        setLoading(true);
        try {
            await dispatch(createInboundRequest(values)).unwrap();
            message.success("Tạo phiếu nhập hàng thành công!");
            navigate("/purchase-management");
        } catch (error: any) {
            message.error(error || "Không thể tạo phiếu");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <Button icon={<LeftOutlined />} onClick={() => navigate(-1)} className="mb-4">Quay lại</Button>

            <Card title={<span className="text-blue-700">TẠO PHIẾU YÊU CẦU NHẬP HÀNG</span>}>
                <Form form={form} layout="vertical" onFinish={onFinish} initialValues={{ items: [{}] }}>
                    <div className="grid grid-cols-3 gap-4">
                        <Form.Item label="Nhà cung cấp" name="supplierName" rules={[{ required: true }]}>
                            <Input placeholder="Tên công ty..." />
                        </Form.Item>

                        <Form.Item label="Kho nhập" name="warehouseId" rules={[{ required: true }]}>
                            <Select placeholder="Chọn kho">
                                {warehouses.map(wh => (
                                    <Select.Option key={wh.id} value={wh.id}>{wh.name}</Select.Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item label="Ghi chú chung" name="note">
                            <Input placeholder="Ghi chú chung..." />
                        </Form.Item>
                    </div>

                    <Divider plain>Danh sách sản phẩm</Divider>

                    <Form.List name="items">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }) => (
                                    <div key={key} className="flex gap-4 items-end bg-gray-50 p-4 mb-4 rounded border border-dashed">
                                        <Form.Item {...restField} label="Sản phẩm" name={[name, "productId"]} rules={[{ required: true }]} className="flex-1">
                                            <Select showSearch optionFilterProp="label">
                                                {products.map(p => (
                                                    <Select.Option key={p.id} value={p.id} label={`${p.sku} ${p.name}`}>
                                                        <span className="font-bold">[{p.sku}]</span> {p.name}
                                                    </Select.Option>
                                                ))}
                                            </Select>
                                        </Form.Item>

                                        <Form.Item {...restField} label="Số lượng" name={[name, "quantity"]} rules={[{ required: true }]}>
                                            <InputNumber min={1} className="w-full" />
                                        </Form.Item>

                                        <Form.Item {...restField} label="Ghi chú dòng" name={[name, "lineNote"]} className="flex-1">
                                            <Input placeholder="Ghi chú..." />
                                        </Form.Item>

                                        {fields.length > 1 && <Button type="text" danger icon={<DeleteOutlined />} onClick={() => remove(name)} className="mb-1" />}
                                    </div>
                                ))}
                                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>Thêm sản phẩm</Button>
                            </>
                        )}
                    </Form.List>

                    <Button type="primary" htmlType="submit" loading={loading} block size="large" className="mt-6 h-12 text-lg">
                        GỬI PHIẾU CHỜ DUYỆT
                    </Button>
                </Form>
            </Card>
        </div>
    );
};

export default CreatePurchaseRequest;