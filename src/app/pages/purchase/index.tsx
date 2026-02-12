// pages/purchase/index.tsx
import { Button, Tag, Modal, message } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import Condition from "./Condition";
import { useAppDispatch, useAppSelector } from "../../../store";
import { getMyInboundRequests, selectInboundRequests, deleteInboundRequest } from "../../../store/inboundSlice";
import AddInboundModal from "../../components/modal/AddInboundModal";
import URL from "../../../constants/url";

const ManagePurchaseRequest = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const requests = useAppSelector(selectInboundRequests);
    const loading = useAppSelector((state) => state.inbound?.loading || false);

    const [searchNo, setSearchNo] = useState("");
    const [searchStatus, setSearchStatus] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    useEffect(() => {
        dispatch(getMyInboundRequests());
    }, [dispatch]);

    const filteredRequests = useMemo(() => {
        return requests.filter((req) => {
            const noMatch = req.requestNo?.toLowerCase().includes(searchNo.toLowerCase());
            const statusMatch = searchStatus === "" || req.status === searchStatus;
            return noMatch && statusMatch;
        });
    }, [requests, searchNo, searchStatus]);

    const getStatusTag = (status: string) => {
        const statusMap: Record<string, { color: string }> = {
            Pending: { color: "gold" },
            Approved: { color: "green" },
            Rejected: { color: "red" },
            Completed: { color: "blue" },
        };
        return <Tag color={statusMap[status]?.color || "default"}>{status}</Tag>;
    };

    const handleDelete = (id: number) => {
        Modal.confirm({
            title: "Xác nhận xóa",
            content: "Bạn có chắc chắn muốn xóa phiếu này?",
            okText: "Xóa",
            cancelText: "Hủy",
            okType: "danger",
            onOk: async () => {
                try {
                    await dispatch(deleteInboundRequest(id)).unwrap();
                    message.success("Xóa phiếu thành công");
                    dispatch(getMyInboundRequests());
                } catch (error: any) {
                    message.error(error || "Không thể xóa phiếu");
                }
            },
        });
    };

    const handleView = (id: number) => {
        navigate(`${URL.ViewInboundRequest}?id=${id}`);
    };

    const handleEdit = (id: number) => {
        navigate(`${URL.EditInboundRequest}?id=${id}`);
    };

    return (
        <div className="p-2">
            <Condition
                searchNo={searchNo}
                setSearchNo={setSearchNo}
                searchStatus={searchStatus}
                setSearchStatus={setSearchStatus}
            />

            <h2 className="text-xl font-bold mb-4">Quản lý phiếu nhập hàng</h2>

            <div className="mb-4 flex justify-end gap-2">
                <Button size="small" type="primary" onClick={() => dispatch(getMyInboundRequests())}>
                    Làm mới
                </Button>
                <Button size="small" type="primary" onClick={() => setIsAddModalOpen(true)}>
                    + Tạo phiếu mới
                </Button>
            </div>

            <AddInboundModal
                open={isAddModalOpen}
                onClose={() => {
                    setIsAddModalOpen(false);
                    dispatch(getMyInboundRequests());
                }}
            />

            <div className="border-[0.05px] border-gray-300">
                <div className="grid grid-cols-6 bg-gray-100 font-semibold text-sm text-center">
                    <div className="px-3 py-2">Mã phiếu</div>
                    <div className="px-3 py-2">Nhà cung cấp</div>
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
                        <div key={req.id} className="grid grid-cols-6 text-center text-sm border-b-[0.05px] border-gray-300 items-center hover:bg-gray-50 transition-all">
                            <div className="px-3 py-2 font-medium text-blue-600">{req.requestNo}</div>
                            <div className="px-3 py-2 truncate text-left">{req.supplierName}</div>
                            <div className="px-3 py-2">{getStatusTag(req.status)}</div>
                            <div className="px-3 py-2">{dayjs(req.createdAt).format("DD/MM/YYYY HH:mm")}</div>
                            <div className="px-3 py-2 truncate italic text-gray-500">{req.note || "—"}</div>
                            <div className="px-3 py-2 flex gap-2 justify-center">
                                <Button
                                    size="small"
                                    className="!bg-green-500 !text-white"
                                    onClick={() => handleView(req.id)}
                                >
                                    View
                                </Button>
                                <Button
                                    size="small"
                                    className="!bg-blue-500 !text-white"
                                    disabled={req.status !== "Pending"}
                                    onClick={() => handleEdit(req.id)}
                                >
                                    Edit
                                </Button>
                                <Button
                                    size="small"
                                    danger
                                    disabled={req.status === "Approved" || req.status === "Completed"}
                                    onClick={() => handleDelete(req.id)}
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ManagePurchaseRequest;