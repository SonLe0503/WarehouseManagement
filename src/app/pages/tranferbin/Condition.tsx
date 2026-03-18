import { Input } from "antd";

interface ConditionProps {
    searchNo: string;
    setSearchNo: (value: string) => void;
}

const Condition = ({ searchNo, setSearchNo }: ConditionProps) => {
    return (
        <div className="flex gap-2 mb-4">
            <Input
                type="text"
                placeholder="Tìm theo mã phiếu hoặc người tạo..."
                value={searchNo}
                onChange={(e) => setSearchNo(e.target.value)}
                className="w-full"
                allowClear
            />
        </div>
    );
};

export default Condition;