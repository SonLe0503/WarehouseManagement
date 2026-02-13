import { Button, Tag, Table, Modal, message } from "antd";
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

const ManageOrder = () => {
    const dispatch = useAppDispatch();
    const requests = useSelector(selectInboundRequests);
    const loading = useSelector(selectInboundRequestLoading);

    const [searchRequestNo, setSearchRequestNo] = useState("");
    const [searchStatus, setSearchStatus] = useState("");

    const [selectedRequest, setSelectedRequest] = useState<InboundRequest | undefined>(undefined);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    useEffect(() => {
        dispatch(getInboundRequests());
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
            title: "Request No",
            dataIndex: "requestNo",
            key: "requestNo",
            render: (text) => <span className="font-semibold text-blue-600">{text}</span>
        },
        {
            title: "Supplier",
            dataIndex: "supplierName",
            key: "supplierName",
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status) => {
                let color = "blue";
                if (status === "Approved") color = "green";
                if (status === "Rejected") color = "red";
                if (status === "Pending") color = "orange";
                return <Tag color={color}>{status}</Tag>;
            }
        },
        {
            title: "Warehouse ID",
            dataIndex: "warehouseId",
            key: "warehouseId",
        },
        {
            title: "Approved By",
            dataIndex: "approvedBy",
            key: "approvedBy",
            render: (text) => text || "—"
        },
        {
            title: "Approved At",
            dataIndex: "approvedAt",
            key: "approvedAt",
            render: (date) => date ? dayjs(date).format("DD/MM/YYYY") : "—"
        },
        {
            title: "Created At",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (date) => dayjs(date).format("DD/MM/YYYY")
        },
        {
            title: "Action",
            key: "action",
            render: (_, record) => (
                <div className="flex gap-2">
                    <Button size="small" type="default" onClick={() => handleViewDetail(record)}>
                        Detail
                    </Button>
                    {record.status === "Pending" && (
                        <>
                            <Button
                                size="small"
                                className="!bg-green-500 !text-white hover:!bg-green-600"
                                onClick={() => handleApproveReject(record.id, "Approve")}
                            >
                                Approve
                            </Button>
                            <Button
                                size="small"
                                className="!bg-red-500 !text-white hover:!bg-red-600"
                                onClick={() => handleApproveReject(record.id, "Reject")}
                            >
                                Reject
                            </Button>
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

            <h2 className="text-xl font-bold mb-4">Quản lý nhập kho (Inbound Requests)</h2>

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
