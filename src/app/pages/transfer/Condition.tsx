import { Select, Input } from "antd";

interface ConditionProps {
    searchNo: string;
    setSearchNo: (v: string) => void;
    searchStatus: string;
    setSearchStatus: (v: string) => void;
}

const Condition = (props: ConditionProps) => {
    const { searchNo, setSearchNo, searchStatus, setSearchStatus } = props;

    return (
        <div className="flex gap-3 mb-4 items-center">
            <Input
                placeholder="Tìm theo mã phiếu"
                value={searchNo}
                onChange={(e) => setSearchNo(e.target.value)}
                className="w-60"
                allowClear
            />
            <Select
                value={searchStatus}
                onChange={setSearchStatus}
                className="w-40"
                options={[
                    { label: "Tất cả", value: "" },
                    { label: "Pending", value: "Pending" },
                    { label: "Approved", value: "Approved" },
                    { label: "InTransit", value: "InTransit" },
                    { label: "Completed", value: "Completed" },
                    { label: "Rejected", value: "Rejected" },
                ]}
            />
        </div>
    );
};

export default Condition;
