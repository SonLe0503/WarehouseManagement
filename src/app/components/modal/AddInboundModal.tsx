import { Modal, Form, Input, Select, Button, InputNumber, Divider, message } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store";
import { createInboundRequest } from "../../../store/inboundSlice";
import { getAllProducts, selectProducts } from "../../../store/productSlice";
import { getActiveWarehouses, selectWarehouses } from "../../../store/warehouseslide";

interface AddInboundModalProps {
    open: boolean;
    onClose: () => void;
}

const AddInboundModal = (props: AddInboundModalProps) => {
    const { open, onClose } = props;
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


            await dispatch(createInboundRequest(values)).unwrap();

            message.success("Tạo phiếu nhập kho thành công");
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
            title="Tạo yêu cầu nhập kho"
            open={open}
            onCancel={() => { form.resetFields(); onClose(); }}
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
                        name="warehouseId"
                        label="Kho nhập"
                        rules={[{ required: true, message: "Vui lòng chọn kho!" }]}
                    >
                        <Select placeholder="Chọn kho nhận hàng">
                            {warehouses.map((w) => (
                                <Select.Option key={w.id} value={w.id}>
                                    {w.name} ({w.code})
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="supplierName"
                        label="Nhà cung cấp"
                        rules={[{ required: true, message: "Nhập tên nhà cung cấp!" }]}
                    >
                        <Input placeholder="Nhập tên nhà cung cấp" />
                    </Form.Item>
                </div>

                <Form.Item name="note" label="Ghi chú phiếu">
                    <Input.TextArea placeholder="Ghi chú chung cho phiếu nhập" rows={2} />
                </Form.Item>

                <Divider>Danh sách sản phẩm</Divider>

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

export default AddInboundModal;