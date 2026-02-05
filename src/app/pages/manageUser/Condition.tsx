import { Input, Select } from "antd"

interface ConditionProps {
    searchEmail: string;
    setSearchEmail: (value: string) => void;
    searchStatus: string;
    setSearchStatus: (value: string) => void;
}

const Condition = (props: ConditionProps) => {
    const { searchEmail, searchStatus, setSearchEmail, setSearchStatus } = props;
    const handleChange = (e: string) => {
        setSearchStatus(e);
    };
    return (
        <div className="flex gap-2 mb-4">
            <Input
                type="text"
                placeholder="Tìm theo email"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                className="w-full"
            />
            <Select
                className="w-full"
                defaultValue="Tất cả trạng thái"
                value={searchStatus}
                onChange={handleChange}
                options={[
                    { value: "", label: "Tất cả trạng thái" },
                    { value: "ACTIVE", label: "Active" },
                    { value: "BLOCKED", label: "Blocked" },
                ]}
            />
        </div>
    )
}
export default Condition