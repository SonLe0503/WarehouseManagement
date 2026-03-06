import { Input, Select } from "antd";

interface ConditionProps {
    searchCode: string;
    setSearchCode: (value: string) => void;
    searchWarehouse: string;
    setSearchWarehouse: (value: string) => void;
    searchStatus: string;
    setSearchStatus: (value: string) => void;
}

const Condition = (props: ConditionProps) => {
    const { searchCode, setSearchCode, searchWarehouse, setSearchWarehouse, searchStatus, setSearchStatus } = props;

    return (
        <div className="flex gap-2 mb-4">
            <Input
                placeholder="Tìm theo mã bin"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                className="w-48"
            />
            <Input
                placeholder="Tìm theo kho"
                value={searchWarehouse}
                onChange={(e) => setSearchWarehouse(e.target.value)}
                className="w-48"
            />
            <Select
                className="w-48"
                value={searchStatus}
                onChange={(value) => setSearchStatus(value)}
                options={[
                    { value: "", label: "Tất cả trạng thái" },
                    { value: "Available", label: "Available" },
                    { value: "Inactive", label: "Inactive" },
                ]}
            />
        </div>
    );
};

export default Condition;