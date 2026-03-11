import { Button, Tag, Modal, Tooltip, App } from "antd";
import { ReloadOutlined, PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import Condition from "./Condition";
import { useAppDispatch, useAppSelector } from "../../../store";
import { getMyStockTransfers, selectStockTransfers, deleteStockTransfer } from "../../../store/stockTransfer2StepSlice";
import AddTransferModal from "../../components/modal/AddTransferModal";
import URL from "../../../constants/url";

const ManageTransferRequest = () => {
    const { message: messageApi } = App.useApp();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const requests = useAppSelector(selectStockTransfers);
    const loading = useAppSelector((state) => state.stockTransfer?.loading || false);

    const [searchNo, setSearchNo] = useState("");
    const [searchStatus, setSearchStatus] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    useEffect(() => {
        dispatch(getMyStockTransfers());
    }, [dispatch]);

    const filteredRequests = useMemo(() => {
        return (requests || []).filter((req) => {
            const noMatch = req.transferNo?.toLowerCase().includes(searchNo.toLowerCase());
            const statusMatch = searchStatus === "" || req.status === searchStatus;
            return noMatch && statusMatch;
        });
    }, [requests, searchNo, searchStatus]);

    const getStatusTag = (status: string) => {
        const statusMap: Record<string, { color: string; label: string }> = {
            Pending: { color: "gold", label: "Chờ duyệt" },
            Approved: { color: "green", label: "Đã duyệt" },
            InTransit: { color: "geekblue", label: "Đang vận chuyển" },
            Completed: { color: "blue", label: "Hoàn thành" },
            Rejected: { color: "red", label: "Từ chối" },
        };
        const mapped = statusMap[status];
        return <Tag color={mapped?.color || "default"}>{mapped?.label || status}</Tag>;
    };

    const handleDelete = (id: number) => {
        Modal.confirm({
            title: "Xác nhận xóa",
            content: "Bạn có chắc chắn muốn xóa phiếu chuyển kho này?",
            okText: "Xóa",
            cancelText: "Hủy",
            okType: "danger",
            onOk: async () => {
                try {
                    await dispatch(deleteStockTransfer(id)).unwrap();
                    messageApi.success("Xóa phiếu thành công");
                    dispatch(getMyStockTransfers());
                } catch (error: any) {
                    messageApi.error(error || "Không thể xóa phiếu");
                }
            },
        });
    };

    const handleView = (id: number) => {
        navigate(`${URL.ViewTransferRequest}?id=${id}`);
    };

    const handleEdit = (id: number) => {
        navigate(`${URL.EditTransferRequest}?id=${id}`);
    };

    return (
        <div className="p-2">
            <Condition
                searchNo={searchNo}
                setSearchNo={setSearchNo}
                searchStatus={searchStatus}
                setSearchStatus={setSearchStatus}
            />

            <h2 className="text-xl font-bold mb-4">Quản lý phiếu chuyển kho</h2>

            <div className="mb-4 flex justify-end gap-2 items-center">
                <Tooltip title="Làm mới">
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={() => dispatch(getMyStockTransfers())}
                        className="!flex !items-center !justify-center"
                    />
                </Tooltip>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsAddModalOpen(true)}
                    className="!flex !items-center !justify-center h-10 px-6 font-semibold shadow-md"
                >
                    Tạo phiếu mới
                </Button>
            </div>

            <AddTransferModal
                open={isAddModalOpen}
                onClose={() => {
                    setIsAddModalOpen(false);
                    dispatch(getMyStockTransfers());
                }}
            />

            <div className="border-[0.05px] border-gray-300">
                <div className="grid grid-cols-7 bg-gray-100 font-semibold text-sm text-center">
                    <div className="px-3 py-2">Mã phiếu</div>
                    <div className="px-3 py-2">Kho nguồn</div>
                    <div className="px-3 py-2">Kho đích</div>
                    <div className="px-3 py-2">Trạng thái</div>
                    <div className="px-3 py-2">Ngày tạo</div>
                    <div className="px-3 py-2">Ghi chú</div>
                    <div className="px-3 py-2">Thao tác</div>
                </div>

                {loading ? (
                    <div className="p-10 text-center">Đang tải dữ liệu...</div>
                ) : filteredRequests.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">Không có dữ liệu</div>
                ) : (
                    filteredRequests.map((req) => (
                        <div key={req.id} className="grid grid-cols-7 text-center text-sm border-b-[0.05px] border-gray-300 items-center hover:bg-gray-50 transition-all">
                            <div className="px-3 py-2 font-medium text-blue-600">{req.transferNo}</div>
                            <div className="px-3 py-2 truncate">{req.fromWarehouseName || `Kho #${req.fromWarehouseId}`}</div>
                            <div className="px-3 py-2 truncate">{req.toWarehouseName || `Kho #${req.toWarehouseId}`}</div>
                            <div className="px-3 py-2">{getStatusTag(req.status)}</div>
                            <div className="px-3 py-2">{dayjs(req.createdAt).format("DD/MM/YYYY HH:mm")}</div>
                            <div className="px-3 py-2 truncate text-gray-500">{req.note || "—"}</div>
                            <div className="px-3 py-2 flex gap-2 justify-center">
                                <Tooltip title="Xem chi tiết">
                                    <Button
                                        type="primary"
                                        icon={<EyeOutlined />}
                                        onClick={() => handleView(req.id)}
                                        className="!flex !items-center !justify-center !bg-green-500 hover:!bg-green-400"
                                    />
                                </Tooltip>
                                <Tooltip title="Chỉnh sửa">
                                    <Button
                                        type="primary"
                                        icon={<EditOutlined />}
                                        disabled={req.status !== "Pending" && req.status !== "Rejected"}
                                        onClick={() => handleEdit(req.id)}
                                        className="!flex !items-center !justify-center"
                                    />
                                </Tooltip>
                                <Tooltip title="Xóa">
                                    <Button
                                        danger
                                        type="primary"
                                        icon={<DeleteOutlined />}
                                        disabled={req.status === "Approved" || req.status === "InTransit" || req.status === "Completed"}
                                        onClick={() => handleDelete(req.id)}
                                        className="!flex !items-center !justify-center"
                                    />
                                </Tooltip>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ManageTransferRequest;
