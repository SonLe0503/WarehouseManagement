import { Button, Card, Form, InputNumber, Select, Space, Typography, type FormInstance } from "antd";
import { PlusOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { type IProduct } from "../../../store/productSlice";
import { type IUnit } from "../../../store/unitSlide";

const { Text } = Typography;

interface AddConversionProps {
    form: FormInstance;
    onFinish: (values: any) => void;
    selectedProductId?: number;
    selectedProduct?: IProduct;
    availableFromUnits: IUnit[];
    unitMap: Map<number, IUnit>;
    loading: boolean;
}

const AddConversion = ({
    form,
    onFinish,
    selectedProductId,
    selectedProduct,
    availableFromUnits,
    unitMap,
    loading
}: AddConversionProps) => {
    const createConversionFactor = Form.useWatch("conversionFactor", { form });
    const createFromUnitId = Form.useWatch("fromUnitId", { form });

    return (
        <Card
            title={
                <Space>
                    <PlusOutlined />
                    Thêm Quy đổi Mới
                </Space>
            }
            variant="outlined"
            className="h-full border-blue-100"
        >
            <Form
                form={form}
                layout="vertical"
                initialValues={{ productId: selectedProductId, conversionFactor: 1 }}
                onFinish={onFinish}
                style={{ display: selectedProductId ? 'block' : 'none' }}
            >
                <Form.Item name="productId" hidden>
                    <InputNumber />
                </Form.Item>

                <Form.Item
                    label="Từ đơn vị"
                    name="fromUnitId"
                    rules={[
                        { required: true, message: "Vui lòng chọn đơn vị" },
                        {
                            validator: (_, value) => {
                                if (value === selectedProduct?.baseUnitId) {
                                    return Promise.reject(new Error("Không được chọn đơn vị gốc"));
                                }
                                return Promise.resolve();
                            }
                        }
                    ]}
                    help="Đơn vị muốn quy đổi về đơn vị gốc"
                >
                    <Select
                        placeholder="Chọn đơn vị phụ"
                        options={availableFromUnits.map((u) => ({
                            value: u.id,
                            label: `${u.name} (${u.code})`,
                        }))}
                    />
                </Form.Item>

                <Form.Item
                    label="Hệ số quy đổi"
                    name="conversionFactor"
                    rules={[
                        { required: true, message: "Vui lòng nhập hệ số" },
                        { type: 'number', min: 1, message: "Hệ số phải lớn hơn hoặc bằng 1" }
                    ]}
                >
                    <InputNumber
                        className="w-full"
                        placeholder="Ví dụ: 12 (1 Thùng = 12 Cái)"
                    />
                </Form.Item>

                <div className="bg-blue-50 p-3 rounded-md mb-4 border border-blue-100">
                    <Space align="start">
                        <InfoCircleOutlined className="text-blue-500 mt-1" />
                        <div>
                            <Text style={{ fontSize: '12px' }} type="secondary">Ý nghĩa:</Text><br />
                            <Text strong>1</Text> <Text type="secondary">{createFromUnitId ? unitMap.get(createFromUnitId)?.code : "..."}</Text>
                            {" = "}
                            <Text strong className="text-blue-600">{createConversionFactor || "?"}</Text>
                            {" "}
                            <Text strong>{selectedProduct?.baseUnitCode}</Text>
                        </div>
                    </Space>
                </div>

                <Button
                    type="primary"
                    htmlType="submit"
                    block
                    icon={<PlusOutlined />}
                    loading={loading}
                >
                    Thêm Quy đổi
                </Button>
            </Form>

            {!selectedProductId && (
                <div className="py-8 text-center bg-gray-50 rounded-md border border-dashed">
                    <Text type="secondary">Hãy chọn sản phẩm trước khi thêm quy đổi</Text>
                </div>
            )}
        </Card>
    );
};

export default AddConversion;
