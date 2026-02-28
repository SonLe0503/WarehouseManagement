import { Select, Tag, Typography } from "antd";
import { type IProduct } from "../../../store/productSlice";

const { Text } = Typography;

interface ConditionProps {
    products: IProduct[];
    selectedProductId?: number;
    setSelectedProductId: (id: number) => void;
    selectedProduct?: IProduct;
}

const Condition = ({ products, selectedProductId, setSelectedProductId, selectedProduct }: ConditionProps) => {
    return (
        <div className="bg-blue-50 p-4 rounded-lg flex items-center gap-4 border border-blue-100 mb-6">
            <span className="font-semibold text-blue-800">Chọn Sản phẩm:</span>
            <Select
                showSearch
                style={{ width: 400 }}
                placeholder="Tìm kiếm sản phẩm theo SKU hoặc tên..."
                optionFilterProp="label"
                value={selectedProductId}
                onChange={setSelectedProductId}
                options={products.map((p) => ({
                    value: p.id,
                    label: `[${p.sku}] ${p.name}`,
                }))}
            />
            {selectedProduct && (
                <Tag color="cyan" className="px-3 py-1 text-sm border-cyan-200">
                    Đơn vị gốc: <Text strong className="text-cyan-800">{selectedProduct.baseUnitCode}</Text>
                </Tag>
            )}
        </div>
    );
};

export default Condition;
