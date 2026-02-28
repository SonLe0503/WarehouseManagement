import { Button, Tag, Table, Modal, message, Tooltip } from "antd";
import { EyeOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch } from "../../../../store"; // Adjust path if needed
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import Condition from "./Condition";
import RequestDetailModal from "./RequestDetailModal";
import {
    getInboundRequests,
    approveRejectRequest,
    selectInboundRequests,
    selectInboundRequestLoading,
    type InboundRequest
} from "../../../../store/inboundRequestSlide";
import { getAllWarehouses, selectWarehouses } from "../../../../store/warehouseslide";
import { getAllUsers, selectUsers } from "../../../../store/userSlide";

const ManageOrder = () => {
    const dispatch = useAppDispatch();
    const requests = useSelector(selectInboundRequests);
    const loading = useSelector(selectInboundRequestLoading);
    const warehouses = useSelector(selectWarehouses);
    const users = useSelector(selectUsers);

    const [searchRequestNo, setSearchRequestNo] = useState("");
    const [searchStatus, setSearchStatus] = useState("");

    const [selectedRequest, setSelectedRequest] = useState<InboundRequest | undefined>(undefined);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    useEffect(() => {
        dispatch(getInboundRequests());
        dispatch(getAllWarehouses());
        dispatch(getAllUsers());
    }, [dispatch]);

    const filteredRequests = useMemo(() => {
        return requests.filter((req) => {
            const noMatch = req.requestNo.toLowerCase().includes(searchRequestNo.toLowerCase());
            const statusMatch = searchStatus === "" || req.status === searchStatus;
            return noMatch && statusMatch;
        });
    }, [requests, searchRequestNo, searchStatus]);

    const handleViewDetail = (record: InboundRequest) => {
        setSelectedRequest(record);
        setIsDetailModalOpen(true);
    };

    const handleApproveReject = (id: number, action: "Approve" | "Reject") => {
        Modal.confirm({
            title: `Xác nhận ${action === "Approve" ? "Duyệt" : "Từ chối"}`,
            content: `Bạn có chắc muốn ${action === "Approve" ? "duyệt" : "từ chối"} phiếu này không?`,
            okText: "Đồng ý",
            cancelText: "Hủy",
            onOk: async () => {
                try {
                    await dispatch(approveRejectRequest({ id, action })).unwrap();
                    message.success(`${action === "Approve" ? "Duyệt" : "Từ chối"} phiếu thành công!`);
                } catch (error: any) {
                    message.error(error || "Có lỗi xảy ra");
                }
            }
        });
    };

    const columns: ColumnsType<InboundRequest> = [
        {
            title: "Mã yêu cầu",
            dataIndex: "requestNo",
            key: "requestNo",
            render: (text) => <span className="font-semibold text-blue-600">{text}</span>
        },
        {
            title: "Nhà cung cấp",
            dataIndex: "supplierName",
            key: "supplierName",
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status) => {
                let color = "blue";
                let text = status;
                if (status === "Approved") { color = "green"; text = "Đã duyệt"; }
                if (status === "Rejected") { color = "red"; text = "Từ chối"; }
                if (status === "Pending") { color = "orange"; text = "Đang chờ"; }
                return <Tag color={color}>{text}</Tag>;
            }
        },
        {
            title: "Tên kho",
            dataIndex: "warehouseId",
            key: "warehouseId",
            render: (id) => warehouses.find(w => w.id === id)?.name || id
        },
        {
            title: "Người duyệt",
            dataIndex: "approvedBy",
            key: "approvedBy",
            render: (id) => users.find(u => u.id === id)?.username || id || "—"
        },
        {
            title: "Ngày duyệt",
            dataIndex: "approvedAt",
            key: "approvedAt",
            render: (date) => date ? dayjs(date).format("DD/MM/YYYY") : "—"
        },
        {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (date) => dayjs(date).format("DD/MM/YYYY")
        },
        {
            title: "Hành động",
            key: "action",
            render: (_, record) => (
                <div className="flex gap-2">
                    <Tooltip title="Xem chi tiết">
                        <Button
                            type="default"
                            icon={<EyeOutlined />}
                            onClick={() => handleViewDetail(record)}
                            className="!flex !items-center !justify-center"
                        />
                    </Tooltip>
                    {record.status === "Pending" && (
                        <>
                            <Tooltip title="Duyệt">
                                <Button
                                    type="primary"
                                    icon={<CheckOutlined />}
                                    onClick={() => handleApproveReject(record.id, "Approve")}
                                    className="!flex !items-center !justify-center !bg-green-500 hover:!bg-green-400"
                                />
                            </Tooltip>
                            <Tooltip title="Từ chối">
                                <Button
                                    danger
                                    type="primary"
                                    icon={<CloseOutlined />}
                                    onClick={() => handleApproveReject(record.id, "Reject")}
                                    className="!flex !items-center !justify-center"
                                />
                            </Tooltip>
                        </>
                    )}
                </div>
            )
        }
    ];

    return (
        <div className="p-2">
            <Condition
                searchRequestNo={searchRequestNo}
                setSearchRequestNo={setSearchRequestNo}
                searchStatus={searchStatus}
                setSearchStatus={setSearchStatus}
            />

            <h2 className="text-xl font-bold mb-4">Quản lý đơn mua</h2>

            <Table
                dataSource={filteredRequests}
                columns={columns}
                rowKey="id"
                loading={loading}
                bordered
            />

            <RequestDetailModal
                open={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                request={selectedRequest}
            />
        </div>
    );
}

export default ManageOrder;
