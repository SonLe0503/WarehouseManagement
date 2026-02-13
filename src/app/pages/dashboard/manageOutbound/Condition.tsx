import { Input, Select } from "antd";

interface ConditionProps {
    searchRequestNo: string;
    setSearchRequestNo: (value: string) => void;
    searchStatus: string;
    setSearchStatus: (value: string) => void;
}

const Condition = ({ searchRequestNo, setSearchRequestNo, searchStatus, setSearchStatus }: ConditionProps) => {
    return (
        <div className="flex gap-4 mb-4 items-center bg-white p-3 rounded-md shadow-sm">
            <Input
                placeholder="Search by Request No..."
                value={searchRequestNo}
                onChange={(e) => setSearchRequestNo(e.target.value)}
                className="w-64"
                allowClear
            />

            <Select
                placeholder="Select Status"
                value={searchStatus || undefined}
                onChange={(value) => setSearchStatus(value)}
                className="w-40"
                allowClear
                options={[
                    { value: "Pending", label: "Pending" },
                    { value: "Approved", label: "Approved" },
                    { value: "Rejected", label: "Rejected" },
                ]}
            />
        </div>
    );
};

export default Condition;
