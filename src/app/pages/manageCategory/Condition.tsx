import { Input } from "antd";

interface ConditionProps {
    searchName: string;
    setSearchName: (value: string) => void;
}

const Condition = (props: ConditionProps) => {
    const { searchName, setSearchName } = props;

    return (
        <div className="flex gap-2 mb-4">
            <Input
                placeholder="Tìm theo tên danh mục"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="w-64"
            />
        </div>
    );
};

export default Condition;