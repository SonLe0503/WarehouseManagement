import { Form, Input, Select, Button, InputNumber, Divider, Spin, App, Tooltip } from "antd";
import { PlusOutlined, DeleteOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../store";
import { getStockTransferById, updateStockTransfer, selectCurrentTransfer, selectStockTransferLoading } from "../../../store/stockTransfer2StepSlice";
import { getAllProducts, selectProducts } from "../../../store/productSlice";
import { getActiveWarehouses, selectWarehouses } from "../../../store/warehouseslide";
import URL from "../../../constants/url";

const EditTransferRequest = () => {
    const { message } = App.useApp();
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const id = Number(searchParams.get("id"));

    const request = useAppSelector(selectCurrentTransfer);
    const loading = useAppSelector(selectStockTransferLoading);
    const products = useAppSelector(selectProducts);
    const warehouses = useAppSelector(selectWarehouses);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        dispatch(getAllProducts());
        dispatch(getActiveWarehouses());
        if (id) {
            dispatch(getStockTransferById(id));
        }
    }, [dispatch, id]);

    useEffect(() => {
        if (request && request.id === id) {
            form.setFieldsValue({
                fromWarehouseId: request.fromWarehouseId,
                toWarehouseId: request.toWarehouseId,
                note: request.note,
                items: (request.items || []).map((item) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    lineNote: item.lineNote,
                })),
            });
        }
    }, [request, id, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            setSubmitting(true);

            if (values.fromWarehouseId === values.toWarehouseId) {
                message.error("Kho nguồn và kho đích phải khác nhau!");
                setSubmitting(false);
                return;
            }

            await dispatch(updateStockTransfer({ id, data: values })).unwrap();
            message.success("Cập nhật phiếu chuyển kho thành công");
            navigate(URL.TransferRequest);
        } catch (error: any) {
            message.error(error || "Có lỗi xảy ra khi cập nhật phiếu");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading && !request) return <div className="p-10 text-center"><Spin size="large" /></div>;

    return (
        <div className="p-4">
            <div className="mb-4">
                <Tooltip title="Quay lại">
                    <Button
                        icon={<ArrowLeftOutlined />}
                        onClick={() => navigate(URL.TransferRequest)}
                        className="!flex !items-center !justify-center"
                    >
                        Quay lại
                    </Button>
                </Tooltip>
            </div>

            <h2 className="text-xl font-bold mb-4">Chỉnh sửa phiếu chuyển kho</h2>

            <Form form={form} layout="vertical">
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

                <div className="flex justify-end gap-3 mt-6">
                    <Button onClick={() => navigate(URL.TransferRequest)}>
                        Hủy
                    </Button>
                    <Button type="primary" onClick={handleSubmit} loading={submitting}>
                        Cập nhật phiếu
                    </Button>
                </div>
            </Form>
        </div>
    );
};

export default EditTransferRequest;
