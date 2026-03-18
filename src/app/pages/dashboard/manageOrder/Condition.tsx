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
                placeholder="Tìm theo mã yêu cầu"
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
                    { value: "Approved", label: "Đã duyệt" },
                    { value: "Pending", label: "Đang chờ" },
                    { value: "Rejected", label: "Từ chối" },
                    { value: "Completed", label: "Đã nhập " },

                ]}
            />
        </div>
    );
};

export default Condition;
