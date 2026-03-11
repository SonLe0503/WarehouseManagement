// components/modal/AddTransferModal.tsx
import { Modal, Form, Input, Select, Button, InputNumber, Divider, App } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store";
import { createStockTransfer } from "../../../store/stockTransfer2StepSlice";
import { getAllProducts, selectProducts } from "../../../store/productSlice";
import { getActiveWarehouses, selectWarehouses } from "../../../store/warehouseslide";

interface AddTransferModalProps {
    open: boolean;
    onClose: () => void;
}

const AddTransferModal = (props: AddTransferModalProps) => {
    const { open, onClose } = props;
    const { message } = App.useApp();
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();

    const products = useAppSelector(selectProducts);
    const warehouses = useAppSelector(selectWarehouses);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            dispatch(getAllProducts());
            dispatch(getActiveWarehouses());
        }
    }, [dispatch, open]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setLoading(true);

            if (values.fromWarehouseId === values.toWarehouseId) {
                message.error("Kho nguồn và kho đích phải khác nhau!");
                setLoading(false);
                return;
            }

            await dispatch(createStockTransfer(values)).unwrap();

            message.success("Tạo yêu cầu chuyển kho thành công");
            form.resetFields();
            onClose();
        } catch (error: any) {
            message.error(error || "Có lỗi xảy ra khi tạo phiếu");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Tạo yêu cầu chuyển kho"
            open={open}
            onCancel={() => {
                form.resetFields();
                onClose();
            }}
            onOk={handleSubmit}
            confirmLoading={loading}
            width={900}
            okText="Gửi yêu cầu"
            cancelText="Hủy"
            style={{ top: 20 }}
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{ items: [{}] }}
            >
                <div className="grid grid-cols-2 gap-4">
                    <Form.Item
                        name="fromWarehouseId"
                        label="Kho nguồn (xuất)"
                        rules={[{ required: true, message: "Vui lòng chọn kho nguồn!" }]}
                    >
                        <Select placeholder="Chọn kho nguồn">
                            {warehouses.map((w) => (
                                <Select.Option key={w.id} value={w.id}>
                                    {w.name} ({w.code})
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="toWarehouseId"
                        label="Kho đích (nhập)"
                        rules={[{ required: true, message: "Vui lòng chọn kho đích!" }]}
                    >
                        <Select placeholder="Chọn kho đích">
                            {warehouses.map((w) => (
                                <Select.Option key={w.id} value={w.id}>
                                    {w.name} ({w.code})
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </div>

                <Form.Item name="note" label="Ghi chú">
                    <Input.TextArea placeholder="Ghi chú cho phiếu chuyển kho" rows={2} />
                </Form.Item>

                <Divider>Danh sách sản phẩm chuyển</Divider>

                <Form.List
                    name="items"
                    rules={[
                        {
                            validator: async (_, names) => {
                                if (!names || names.length < 1) {
                                    return Promise.reject(new Error("Phải có ít nhất 1 sản phẩm"));
                                }
                            },
                        },
                    ]}
                >
                    {(fields, { add, remove }) => (
                        <>
                            {fields.map(({ key, name, ...restField }) => (
                                <div key={key} className="flex gap-3 items-start mb-2 bg-gray-50 p-3 rounded">
                                    <Form.Item
                                        {...restField}
                                        name={[name, 'productId']}
                                        label="Sản phẩm"
                                        rules={[{ required: true, message: 'Chọn SP' }]}
                                        className="flex-[2] mb-0"
                                    >
                                        <Select
                                            placeholder="Chọn sản phẩm"
                                            showSearch
                                            filterOption={(input, option) =>
                                                (option?.children as any).toLowerCase().includes(input.toLowerCase())
                                            }
                                        >
                                            {products.map((p) => (
                                                <Select.Option key={p.id} value={p.id}>
                                                    {p.name} - {p.sku}
                                                </Select.Option>
                                            ))}
                                        </Select>
                                    </Form.Item>

                                    <Form.Item
                                        {...restField}
                                        name={[name, 'quantity']}
                                        label="Số lượng"
                                        rules={[{ required: true, message: 'Nhập SL' }]}
                                        className="w-32 mb-0"
                                    >
                                        <InputNumber min={0.1} className="w-full" placeholder="Số lượng" />
                                    </Form.Item>

                                    <Form.Item
                                        {...restField}
                                        name={[name, 'lineNote']}
                                        label="Ghi chú dòng"
                                        className="flex-[1.5] mb-0"
                                    >
                                        <Input placeholder="Ghi chú cho SP này" />
                                    </Form.Item>

                                    <Button
                                        type="text"
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={() => remove(name)}
                                        className="mt-8"
                                        disabled={fields.length === 1}
                                    />
                                </div>
                            ))}
                            <Form.Item className="mt-4">
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
