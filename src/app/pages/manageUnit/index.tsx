import { Button, Tag, Modal, message } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store";
import { deleteUnit, getAllUnits, selectUnits, type IUnit } from "../../../store/unitSlide";
import dayjs from "dayjs";
import Condition from "./Condition";
import AddUnitModal from "../../components/modal/AddUnitModal";
import EditUnitModal from "../../components/modal/EditUnitModal";

const ManageUnit = () => {
    const dispatch = useAppDispatch();
    const units = useAppSelector(selectUnits);
    const [searchCode, setSearchCode] = useState("");
    const [searchName, setSearchName] = useState("");

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState<IUnit | undefined>(undefined);

    const filteredUnits = useMemo(() => {
        return units.filter((unit) => {
            const codeMatch = unit.code?.toLowerCase().includes(searchCode.toLowerCase());
            const nameMatch = unit.name?.toLowerCase().includes(searchName.toLowerCase());
            return codeMatch && nameMatch;
        });
    }, [units, searchCode, searchName]);

    const handleEdit = (id: number) => {
        setSelectedUnit(units.find((u) => u.id === id));
        setIsEditModalOpen(true);
    }

    const handleDelete = (id: number) => {
        Modal.confirm({
            title: "Xác nhận xóa đơn vị tính",
            content: "Bạn có chắc chắn muốn xóa đơn vị tính này không? Hành động này không thể hoàn tác.",
            okText: "Xóa",
            okType: "danger",
            cancelText: "Hủy",
            onOk: async () => {
                try {
                    await dispatch(deleteUnit(id)).unwrap();
                    message.success("Xóa đơn vị tính thành công");
                    dispatch(getAllUnits());
                } catch (error: any) {
                    message.error(error || "Có lỗi xảy ra khi xóa đơn vị tính");
                }
            },
        });
    }

    useEffect(() => {
        dispatch(getAllUnits());
    }, [dispatch]);

    return (
        <div className="p-2">
            <Condition
                searchCode={searchCode}
                setSearchCode={setSearchCode}
                searchName={searchName}
                setSearchName={setSearchName}
            />

            <h2 className="text-xl font-bold mb-4">Quản lý đơn vị tính</h2>
            <div className="mb-4 flex justify-end">
                <Button size="small" type="primary" onClick={() => setIsAddModalOpen(true)}>
                    + Thêm mới
                </Button>
            </div>

            <AddUnitModal
                open={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
            />

            <EditUnitModal
                open={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedUnit(undefined);
                }}
                unitData={selectedUnit}
            />

            <div className="border-[0.05px] border-gray-300">
                <div className="grid grid-cols-6 bg-gray-100 font-semibold text-sm text-center">
                    <div className="px-3 py-2">Mã đơn vị</div>
                    <div className="px-3 py-2">Tên đơn vị</div>
                    <div className="px-3 py-2">Mô tả</div>
                    <div className="px-3 py-2">Cơ bản</div>
                    <div className="px-3 py-2">Ngày tạo</div>
                    <div className="px-3 py-2">Hành động</div>
                </div>

                {filteredUnits.length > 0 ? (
                    filteredUnits.map((u) => (
                        <div
                            key={u.id}
                            className="grid grid-cols-6 text-center text-sm border-b-[0.05px] border-gray-300 hover:bg-gray-50 transition-colors"
                        >
                            <div className="px-3 py-2 font-medium">{u.code}</div>
                            <div className="px-3 py-2">{u.name}</div>
                            <div className="px-3 py-2 truncate text-gray-500 italic">
                                {u.description || "—"}
                            </div>
                            <div className="px-3 py-2 flex justify-center items-center">
                                {u.isBaseUnit ? (
                                    <Tag color="cyan">Cơ bản</Tag>
                                ) : (
                                    <Tag color="default">—</Tag>
                                )}
                            </div>
                            <div className="px-3 py-2 text-gray-500">
                                {dayjs(u.createdAt).format("DD/MM/YYYY")}
                            </div>
                            <div className="px-3 py-2 flex gap-2 justify-center">
                                <Button
                                    className="!bg-blue-500 !text-white px-3 py-1 rounded"
                                    onClick={() => handleEdit(u.id)}
                                    size="small"
                                >
                                    Sửa
                                </Button>
                                <Button
                                    className="!bg-red-500 !text-white px-3 py-1 rounded"
                                    onClick={() => handleDelete(u.id)}
                                    size="small"
                                >
                                    Xóa
                                </Button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-8 text-center text-gray-400">Không tìm thấy đơn vị tính</div>
                )}
            </div>
        </div>
    );
};

export default ManageUnit;