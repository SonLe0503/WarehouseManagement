import { Input, Select } from "antd";

interface ConditionProps {
    searchNo: string;
    setSearchNo: (value: string) => void;
    searchStatus: string;
    setSearchStatus: (value: string) => void;
}

const Condition = (props: ConditionProps) => {
    const { searchNo, searchStatus, setSearchNo, setSearchStatus } = props;

    return (
        <div className="flex gap-2 mb-4">
            <Input
                type="text"
                placeholder="Tìm theo mã phiếu (Request No)"
                value={searchNo}
                onChange={(e) => setSearchNo(e.target.value)}
                className="w-full"
            />
            <Select
                className="w-full"
                placeholder="Tất cả trạng thái"
                value={searchStatus}
                onChange={(value) => setSearchStatus(value)}
                options={[
                    { value: "", label: "Tất cả trạng thái" },
                    { value: "Pending", label: "Pending" },
                    { value: "Approved", label: "Approved" },
                    { value: "Rejected", label: "Rejected" },
                ]}
            />
        </div>
    );
};

export default Condition;