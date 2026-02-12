import { Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";

interface ButtonAddProps {
    onClick: () => void;
    label?: string;
    className?: string;
}

const ButtonAdd = ({ onClick, label = "Thêm mới", className = "" }: ButtonAddProps) => {
    return (
        <Button
            size="large"
            type="primary"
            icon={<PlusOutlined />}
            onClick={onClick}
            className={`font-bold shadow-md ${className}`}
        >
            {label}
        </Button>
    );
};

export default ButtonAdd;
