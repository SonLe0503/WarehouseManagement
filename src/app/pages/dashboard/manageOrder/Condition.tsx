import { Input, Select } from "antd";

interface ConditionProps {
    searchRequestNo: string;
    setSearchRequestNo: (value: string) => void;
    searchStatus: string;
    setSearchStatus: (value: string) => void;
}

const Condition = (props: ConditionProps) => {
    const { searchRequestNo, searchStatus, setSearchRequestNo, setSearchStatus } = props;

    return (
        <div className="flex gap-2 mb-4">
            <Input
                type="text"
                placeholder="Tìm theo mã đơn (Request No)"
                value={searchRequestNo}
                onChange={(e) => setSearchRequestNo(e.target.value)}
                className="w-full"
            />
            <Select
                className="w-full"
                defaultValue=""
                value={searchStatus}
                onChange={(value) => setSearchStatus(value)}
                options={[
                    { value: "", label: "Tất cả trạng thái" },
                    { value: "Approved", label: "Approved" },
                    { value: "Pending", label: "Pending" },
                    { value: "Rejected", label: "Rejected" },
                ]}
            />
        </div>
    );
};

export default Condition;
