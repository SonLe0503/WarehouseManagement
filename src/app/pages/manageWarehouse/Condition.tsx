import { Input } from "antd";

interface ConditionProps {
    searchCode: string;
    setSearchCode: (value: string) => void;
    searchName: string;
    setSearchName: (value: string) => void;
}

const Condition = (props: ConditionProps) => {
    const { searchCode, setSearchCode, searchName, setSearchName } = props;

    return (
        <div className="flex gap-2 mb-4">
            <Input
                placeholder="Tìm kiếm theo mã kho..."
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                className="rounded-md"
            />
            <Input
                placeholder="Tìm kiếm theo tên kho..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="rounded-md"
            />
        </div>
    );
};

export default Condition;
