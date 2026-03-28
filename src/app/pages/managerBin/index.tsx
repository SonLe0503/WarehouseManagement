import { Button, Tag, Modal, message, Tooltip } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store";
import {
    getAllBins, deleteBin, selectBins, getBinById,
    type IBin
} from "../../../store/binSlice";
import { useNavigate } from "react-router-dom";
import { getActiveWarehouses, selectWarehouses } from "../../../store/warehouseslide";
import dayjs from "dayjs";
import Condition from "./Condition";
import { EditOutlined, DeleteOutlined, PlusOutlined, EyeOutlined } from "@ant-design/icons";
import AddBinModal from "../../components/modal/AddBinModal";
import EditBinModal from "../../components/modal/EditBinModal";

const ManageBin = () => {
    const dispatch = useAppDispatch();
    const bins = useAppSelector(selectBins);
    const warehouses = useAppSelector(selectWarehouses);
    const navigate = useNavigate();
    const [searchCode, setSearchCode] = useState("");
    const [searchWarehouse, setSearchWarehouse] = useState("");
    const [searchStatus, setSearchStatus] = useState("");

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedBin, setSelectedBin] = useState<IBin | undefined>(undefined);

    useEffect(() => {
        dispatch(getAllBins(undefined));
        dispatch(getActiveWarehouses());
    }, [dispatch]);

    const filteredBins = useMemo(() => {
        return bins.filter((b) => {
            const codeMatch = b.code.toLowerCase().includes(searchCode.toLowerCase());
            const warehouseMatch = (b.warehouseName || "").toLowerCase().includes(searchWarehouse.toLowerCase());
            const statusMatch = searchStatus === "" || b.status === searchStatus;
            return codeMatch && warehouseMatch && statusMatch;
        });
    }, [bins, searchCode, searchWarehouse, searchStatus]);

    const handleEdit = (bin: IBin) => {
        setSelectedBin(bin);
        setIsEditModalOpen(true);
    };

    const handleView = async (id: number) => {
        navigate(`/manager-bin/view?id=${id}`);
    };

    const handleDelete = (bin: IBin) => {
        Modal.confirm({
            title: "Xác nhận xóa bin",
            content: `Bạn có chắc muốn xóa bin "${bin.code}" không?`,
            okText: "Xóa",
            okType: "danger",
            cancelText: "Hủy",
            onOk: async () => {
                try {
                    await dispatch(deleteBin(bin.id)).unwrap();
                    message.success("Xóa bin thành công");
                    dispatch(getAllBins(undefined));
                } catch (error: any) {
                    message.error(typeof error === "string" ? error : "Không thể xóa bin đang chứa hàng");
                }
            },
        });
    };

    return (
        <div className="p-2">
            <Condition
                searchCode={searchCode}
                setSearchCode={setSearchCode}
                searchWarehouse={searchWarehouse}
                setSearchWarehouse={setSearchWarehouse}
                searchStatus={searchStatus}
                setSearchStatus={setSearchStatus}
            />

            <h2 className="text-xl font-bold mb-4">Quản lý vị trí bin</h2>

            <div className="mb-4 flex justify-end">
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsAddModalOpen(true)}
                >
                    Thêm bin
                </Button>
            </div>

            <AddBinModal
                open={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={() => dispatch(getAllBins(undefined))}
                warehouses={warehouses}
            />

            <EditBinModal
                open={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedBin(undefined);
                }}
                onSuccess={() => dispatch(getAllBins(undefined))}
                binData={selectedBin}
            />

            <div className="border-[0.05px] border-gray-300">
                <div className="grid grid-cols-6 bg-gray-100 font-semibold text-sm text-center">
                    <div className="px-3 py-2">Mã bin</div>
                    <div className="px-3 py-2">Tên bin</div>
                    <div className="px-3 py-2">Kho</div>
                    <div className="px-3 py-2">Trạng thái</div>
                    <div className="px-3 py-2">Ngày tạo</div>
                    <div className="px-3 py-2">Hành động</div>
                </div>

                {filteredBins.length > 0 ? (
                    filteredBins.map((b) => (
                        <div
                            key={b.id}
                            className="grid grid-cols-6 text-center text-sm border-b-[0.05px] border-gray-300 hover:bg-gray-50 transition-colors items-center"
                        >
                            <div className="px-3 py-2 font-mono font-bold text-blue-600">{b.code}</div>
                            <div className="px-3 py-2">{b.name || "—"}</div>
                            <div className="px-3 py-2">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                                    {b.warehouseName || `#${b.warehouseId}`}
                                </span>
                            </div>
                            <div className="px-3 py-2 flex justify-center">
                                <Tag color={b.status === "Available" ? "green" : "red"}>
                                    {b.status === "Available" ? "Khả dụng" : "Không dùng"}
                                </Tag>
                            </div>
                            <div className="px-3 py-2 text-gray-500">
                                {b.createdAt ? dayjs(b.createdAt).format("DD/MM/YYYY") : "—"}
                            </div>
                            <div className="px-3 py-2 flex gap-2 justify-center">
                                <Tooltip title="Xem chi tiết">
                                    <Button
                                        type="primary"
                                        icon={<EyeOutlined />}
                                        onClick={() => handleView(b.id)}
                                        className="!flex !items-center !justify-center !bg-green-500 hover:!bg-green-400"
                                    />
                                </Tooltip>
                                <Tooltip title="Sửa">
                                    <Button
                                        type="primary"
                                        icon={<EditOutlined />}
                                        onClick={() => handleEdit(b)}
                                        className="!flex !items-center !justify-center"
                                    />
                                </Tooltip>
                                <Tooltip title="Xóa">
                                    <Button
                                        danger
                                        type="primary"
                                        icon={<DeleteOutlined />}
                                        onClick={() => handleDelete(b)}
                                        className="!flex !items-center !justify-center"
                                    />
                                </Tooltip>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-8 text-center text-gray-400">Không tìm thấy bin nào</div>
                )}
            </div>
        </div>
    );
};

export default ManageBin;