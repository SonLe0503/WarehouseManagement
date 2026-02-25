import { Button, Tag, Modal, Tooltip, App } from "antd";
import { ReloadOutlined, PlusOutlined, EyeOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import Condition from "./Condition";
import { useAppDispatch, useAppSelector } from "../../../store";
import { getMyOutboundRequests, selectOutboundRequests, deleteOutboundRequest } from "../../../store/outboundSlice";
import AddOutboundModal from "../../components/modal/AddOutboundModal";
import URL from "../../../constants/url";

const ManageSaleRequest = () => {
    const { message: messageApi } = App.useApp();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const requests = useAppSelector(selectOutboundRequests);
    const loading = useAppSelector((state) => state.outbound?.loading || false);

    const [searchNo, setSearchNo] = useState("");
    const [searchStatus, setSearchStatus] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    useEffect(() => {
        dispatch(getMyOutboundRequests());
    }, [dispatch]);

    const filteredRequests = useMemo(() => {
        return (requests || []).filter((req) => {
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
            content: "Bạn có chắc chắn muốn xóa phiếu xuất này?",
            okText: "Xóa",
            cancelText: "Hủy",
            okType: "danger",
            onOk: async () => {
                try {
                    await dispatch(deleteOutboundRequest(id)).unwrap();
                    messageApi.success("Xóa phiếu thành công");
                    dispatch(getMyOutboundRequests());
                } catch (error: any) {
                    messageApi.error(error || "Không thể xóa phiếu");
                }
            },
        });
    };

    const handleView = (id: number) => {
        navigate(`${URL.ViewOutboundRequest}?id=${id}`);
    };

    const handleEdit = (id: number) => {
        navigate(`${URL.EditOutboundRequest}?id=${id}`);
    };

    return (
        <div className="p-2">
            <Condition
                searchNo={searchNo}
                setSearchNo={setSearchNo}
                searchStatus={searchStatus}
                setSearchStatus={setSearchStatus}
            />

            <h2 className="text-xl font-bold mb-4">Quản lý phiếu xuất hàng</h2>

            <div className="mb-4 flex justify-end gap-2 items-center">
                <Tooltip title="Làm mới">
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={() => dispatch(getMyOutboundRequests())}
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

            <AddOutboundModal
                open={isAddModalOpen}
                onClose={() => {
                    setIsAddModalOpen(false);
                    dispatch(getMyOutboundRequests());
                }}
            />

            <div className="border-[0.05px] border-gray-300">
                <div className="grid grid-cols-6 bg-gray-100 font-semibold text-sm text-center">
                    <div className="px-3 py-2">Mã phiếu</div>
                    <div className="px-3 py-2">Khách hàng</div>
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
                            <div className="px-3 py-2 truncate">{req.customerName}</div>
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
                                        disabled={req.status !== "Pending"}
                                        onClick={() => handleEdit(req.id)}
                                        className="!flex !items-center !justify-center"
                                    />
                                </Tooltip>
                                <Tooltip title="Xóa">
                                    <Button
                                        danger
                                        type="primary"
                                        icon={<DeleteOutlined />}
                                        disabled={req.status === "Approved" || req.status === "Completed"}
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

export default ManageSaleRequest;
