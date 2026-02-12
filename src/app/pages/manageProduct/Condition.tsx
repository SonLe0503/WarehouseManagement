import { Input } from "antd";

interface ConditionProps {
    searchSku: string;
    setSearchSku: (value: string) => void;
    searchName: string;
    setSearchName: (value: string) => void;
}

const Condition = (props: ConditionProps) => {
    const { searchSku, setSearchSku, searchName, setSearchName } = props;

    return (
        <div className="flex gap-2 mb-4">
            <Input
                placeholder="Tìm theo SKU"
                value={searchSku}
                onChange={(e) => setSearchSku(e.target.value)}
                className="w-48"
            />
            <Input
                placeholder="Tìm theo tên sản phẩm"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="w-64"
            />
        </div>
    );
};

export default Condition;
