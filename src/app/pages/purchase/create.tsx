import { Button, Form, Input, InputNumber, Select, Space, message, Card, Spin } from "antd";
import { MinusCircleOutlined, PlusOutlined, LeftOutlined } from "@ant-design/icons";
import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../../store";
import { selectInfoLogin } from "../../../store/authSlide";

const { Option } = Select;

const CreatePurchaseRequest = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [products, setProducts] = useState<any[]>([]);
    const [warehouses, setWarehouses] = useState<any[]>([]); // Thêm danh sách kho
    const navigate = useNavigate();
    const infoLogin = useAppSelector(selectInfoLogin);

    useEffect(() => {
        const fetchData = async () => {
            const token = infoLogin?.accessToken;
            if (!token) return;

            try {
                setFetching(true);
                // Lấy song song danh sách sản phẩm và kho
                const [prodRes, whRes] = await Promise.all([
                    axios.get("https://localhost:7069/api/Product", {
                        headers: { Authorization: `Bearer ${token}` }
                    }),
                    axios.get("https://localhost:7069/api/Warehouse", { // Giả sử bạn có endpoint này
                        headers: { Authorization: `Bearer ${token}` }
                    })
                ]);

                setProducts(prodRes.data);
                setWarehouses(whRes.data || []);
            } catch (error) {
                message.error("Lỗi khi tải dữ liệu khởi tạo");
                console.error(error);
            } finally {
                setFetching(false);
            }
        };
        fetchData();
    }, [infoLogin]);

    const onFinish = async (values: any) => {
        const token = infoLogin?.accessToken;
        setLoading(true);
        try {
            const payload = {
                supplierName: values.supplierName,
                warehouseId: values.warehouseId, // Thêm theo yêu cầu thiết kế 4.3
                note: values.note,
                items: values.items.map((item: any) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    storagePosition: item.storagePosition, // Thêm theo yêu cầu 4.6
                    lineNote: item.lineNote
                }))
            };

            await axios.post(
                "https://localhost:7069/api/PurchaseStaff/create",
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            message.success("Tạo phiếu nhập hàng thành công!");
            navigate("/purchase-management");
        } catch (error: any) {
            message.error(error.response?.data?.Message || "Không thể tạo phiếu");
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="p-10 text-center"><Spin size="large" /></div>;

    return (
        <div className="p-6">
            <Button icon={<LeftOutlined />} onClick={() => navigate(-1)} className="mb-4">
                Quay lại
            </Button>

            <Card title="TẠO PHIẾU YÊU CẦU NHẬP HÀNG (PURCHASE STAFF)">
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{ items: [{}] }}
                >
                    {/* 1. Inbound Header */}
                    <div className="grid grid-cols-3 gap-4">
                        <Form.Item
                            label="Nhà cung cấp"
                            name="supplierName"
                            rules={[{ required: true, message: "Vui lòng nhập tên nhà cung cấp" }]}
                        >
                            <Input placeholder="Tên công ty ABC..." />
                        </Form.Item>

                        <Form.Item
                            label="Kho nhập"
                            name="warehouseId"
                            rules={[{ required: true, message: "Vui lòng chọn kho" }]}
                        >
                            <Select placeholder="Chọn kho nhận hàng">
                                {warehouses.map(wh => (
                                    <Option key={wh.id} value={wh.id}>{wh.name} ({wh.code})</Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item label="Ghi chú chung" name="note">
                            <Input placeholder="Ghi chú cho cả phiếu nhập" />
                        </Form.Item>
                    </div>

                    <h3 className="text-lg font-medium mb-4 border-b pb-2">Danh sách sản phẩm</h3>

                    {/* 2. Inbound Line Items */}
                    <Form.List name="items">
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }) => (
                                    <div key={key} className="flex flex-wrap gap-4 items-end bg-gray-50 p-4 mb-4 rounded border border-dashed">
                                        <Form.Item
                                            {...restField}
                                            label="Sản phẩm"
                                            name={[name, "productId"]}
                                            rules={[{ required: true, message: "Chọn sản phẩm" }]}
                                            style={{ width: 350, marginBottom: 0 }}
                                        >
                                            <Select
                                                showSearch
                                                placeholder="Tìm theo mã SKU hoặc tên"
                                                optionFilterProp="children"
                                            >
                                                {products.map(p => (
                                                    <Option key={p.id} value={p.id}>
                                                        <span className="font-bold text-blue-600">[{p.sku}]</span> {p.name}
                                                    </Option>
                                                ))}
                                            </Select>
                                        </Form.Item>

                                        <Form.Item
                                            {...restField}
                                            label="Số lượng"
                                            name={[name, "quantity"]}
                                            rules={[{ required: true, message: "Nhập số lượng" }]}
                                            style={{ marginBottom: 0 }}
                                        >
                                            <InputNumber min={1} placeholder="SL" />
                                        </Form.Item>

                                        <Form.Item
                                            {...restField}
                                            label="Vị trí (Gợi ý)"
                                            name={[name, "storagePosition"]}
                                            style={{ marginBottom: 0 }}
                                        >
                                            <Input placeholder="Ví dụ: A1-01" />
                                        </Form.Item>

                                        <Form.Item
                                            {...restField}
                                            label="Ghi chú dòng"
                                            name={[name, "lineNote"]}
                                            style={{ marginBottom: 0, flex: 1 }}
                                        >
                                            <Input placeholder="Hàng dễ vỡ, giao gấp..." />
                                        </Form.Item>

                                        {fields.length > 1 && (
                                            <Button
                                                type="text"
                                                danger
                                                icon={<MinusCircleOutlined />}
                                                onClick={() => remove(name)}
                                                className="mb-1"
                                            />
                                        )}
                                    </div>
                                ))}
                                <Form.Item>
                                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                        Thêm dòng sản phẩm mới
                                    </Button>
                                </Form.Item>
                            </>
                        )}
                    </Form.List>

                    <Form.Item className="mt-8">
                        <Button type="primary" htmlType="submit" loading={loading} size="large" block style={{ height: '50px', fontSize: '18px' }}>
                            TẠO & GỬI PHIẾU CHỜ DUYỆT
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default CreatePurchaseRequest;