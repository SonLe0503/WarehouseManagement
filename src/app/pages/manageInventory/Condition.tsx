import { Input } from "antd";

interface ConditionProps {
    searchSku: string;
    setSearchSku: (value: string) => void;
    searchProductName: string;
    setSearchProductName: (value: string) => void;
    searchWarehouse: string;
    setSearchWarehouse: (value: string) => void;
}

const Condition = (props: ConditionProps) => {
    const { searchSku, setSearchSku, searchProductName, setSearchProductName, searchWarehouse, setSearchWarehouse } = props;

    return (
        <div className="flex gap-2 mb-4">
            <Input
                placeholder="Tìm kiếm theo SKU..."
                value={searchSku}
                onChange={(e) => setSearchSku(e.target.value)}
                className="rounded-md"
            />
            <Input
                placeholder="Tìm kiếm theo tên sản phẩm..."
                value={searchProductName}
                onChange={(e) => setSearchProductName(e.target.value)}
                className="rounded-md"
            />
            <Input
                placeholder="Tìm kiếm theo tên kho..."
                value={searchWarehouse}
                onChange={(e) => setSearchWarehouse(e.target.value)}
                className="rounded-md"
            />
        </div>
    );
};

export default Condition;
