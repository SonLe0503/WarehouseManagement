import { Button, Tag, App, Tooltip } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store";
import {
    getAllWarehouses,
    deleteWarehouse,
    activateWarehouse,
    selectWarehouses,
    selectWarehouseLoading,
    type IWarehouse
} from "../../../store/warehouseslide";
import dayjs from "dayjs";
import Condition from "./Condition";
import AddWarehouseModal from "../../components/modal/AddWarehouseModal";
import EditWarehouseModal from "../../components/modal/EditWarehouseModal";
import { EditOutlined, StopOutlined, CheckCircleOutlined, EnvironmentOutlined } from "@ant-design/icons";
import ButtonAdd from "../../components/common/ButtonAdd";

const ManageWarehouse = () => {
    const { message, modal } = App.useApp();
    const dispatch = useAppDispatch();
    const warehouses = useAppSelector(selectWarehouses);
    const loading = useAppSelector(selectWarehouseLoading);

    const [searchCode, setSearchCode] = useState("");
    const [searchName, setSearchName] = useState("");

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedWarehouse, setSelectedWarehouse] = useState<IWarehouse | undefined>(undefined);

    useEffect(() => {
        dispatch(getAllWarehouses());
    }, [dispatch]);

    const filteredWarehouses = useMemo(() => {
        return warehouses.filter((w) => {
            const codeMatch = w.code?.toLowerCase().includes(searchCode.toLowerCase());
            const nameMatch = w.name?.toLowerCase().includes(searchName.toLowerCase());
            return codeMatch && nameMatch;
        });
    }, [warehouses, searchCode, searchName]);

    const handleEdit = (warehouse: IWarehouse) => {
        setSelectedWarehouse(warehouse);
        setIsEditModalOpen(true);
    };

    const handleToggleStatus = (id: number, currentStatus: string | undefined) => {
        const isActivating = currentStatus !== "Active";
        modal.confirm({
            title: isActivating ? "Kích hoạt kho hàng" : "Vô hiệu hóa kho hàng",
            content: `Bạn có chắc muốn ${isActivating ? "kích hoạt" : "vô hiệu hóa"} kho này không?`,
            okText: "Xác nhận",
            cancelText: "Hủy",
            okType: isActivating ? "primary" : "danger",
            onOk: async () => {
                try {
                    if (isActivating) {
                        await dispatch(activateWarehouse(id)).unwrap();
                        message.success("Kích hoạt kho thành công");
                    } else {
                        await dispatch(deleteWarehouse(id)).unwrap();
                        message.success("Vô hiệu hóa kho thành công");
                    }
                    dispatch(getAllWarehouses());
                } catch (error: any) {
                    message.error(error || "Có lỗi xảy ra");
                }
            },
        });
    };

    return (
        <div className="p-2 page-fade-in">
            <Condition
                searchCode={searchCode}
                setSearchCode={setSearchCode}
                searchName={searchName}
                setSearchName={setSearchName}
            />

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Quản lý kho hàng</h2>
                    <p className="text-gray-500 text-sm mt-1">Danh sách và thông tin các kho bãi trong hệ thống</p>
                </div>
                <ButtonAdd onClick={() => setIsAddModalOpen(true)} />
            </div>

            <AddWarehouseModal
                open={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
            />

            <EditWarehouseModal
                open={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedWarehouse(undefined);
                }}
                warehouseData={selectedWarehouse}
            />

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="grid grid-cols-6 bg-gray-50/80 font-bold text-xs uppercase tracking-wider text-gray-600 border-b border-gray-200">
                    <div className="px-6 py-4">Mã kho</div>
                    <div className="px-6 py-4 col-span-2">Tên & Địa chỉ</div>
                    <div className="px-6 py-4 text-center">Trạng thái</div>
                    <div className="px-6 py-4 text-right">Ngày tạo</div>
                    <div className="px-6 py-4 text-center">Thao tác</div>
                </div>

                {filteredWarehouses.length > 0 ? (
                    filteredWarehouses.map((w) => (
                        <div
                            key={w.id}
                            className="grid grid-cols-6 text-sm border-b border-gray-100 hover:bg-blue-50/30 transition-all duration-200"
                        >
                            <div className="px-6 py-4 font-mono font-bold text-blue-600 self-center">
                                {w.code}
                            </div>
                            <div className="px-6 py-4 col-span-2 self-center">
                                <div className="font-semibold text-gray-800">{w.name}</div>
                                <div className="text-[11px] text-gray-400 mt-1 flex items-center gap-1">
                                    <EnvironmentOutlined size={10} /> {w.address || "Chưa cập nhật địa chỉ"}
                                </div>
                            </div>
                            <div className="px-6 py-4 text-center self-center">
                                <Tag color={w.status === "Active" ? "green" : "red"} className="rounded-md px-3 py-0.5">
                                    {w.status === "Active" ? "Đang hoạt động" : "Ngừng hoạt động"}
                                </Tag>
                            </div>
                            <div className="px-6 py-4 text-right text-gray-500 font-medium self-center">
                                {w.createdAt ? dayjs(w.createdAt).format("DD/MM/YYYY") : "—"}
                            </div>
                            <div className="px-6 py-4 flex gap-2 justify-center self-center">
                                <Tooltip title="Chỉnh sửa">
                                    <Button
                                        type="primary"
                                        ghost
                                        icon={<EditOutlined />}
                                        onClick={() => handleEdit(w)}
                                        className="!flex !items-center !justify-center"
                                    />
                                </Tooltip>
                                <Tooltip title={w.status === "Active" ? "Vô hiệu hóa" : "Kích hoạt"}>
                                    <Button
                                        danger={w.status === "Active"}
                                        type={w.status === "Active" ? "default" : "primary"}
                                        icon={w.status === "Active" ? <StopOutlined /> : <CheckCircleOutlined />}
                                        onClick={() => handleToggleStatus(w.id, w.status)}
                                        className={`!flex !items-center !justify-center ${w.status !== "Active" ? "!bg-green-500 !border-green-500 hover:!bg-green-600" : ""}`}
                                    />
                                </Tooltip>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-20 text-center text-gray-400">
                        {loading ? "Đang tải dữ liệu..." : "Không tìm thấy kho hàng nào"}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageWarehouse;
