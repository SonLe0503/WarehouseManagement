import { Button, Tag, Table, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch } from "../../../../store";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import Condition from "./Condition";
import RequestDetailModal from "./RequestDetailModal";
import ApproveRejectModal from "./ApproveRejectModal";
import {
    getOutboundRequests,
    approveRejectOutboundRequest,
    selectOutboundRequests,
    selectOutboundRequestLoading,
    type OutboundRequest
} from "../../../../store/outboundRequestSlide";

const ManageOutbound = () => {
    const dispatch = useAppDispatch();
    const requests = useSelector(selectOutboundRequests);
    const loading = useSelector(selectOutboundRequestLoading);

    const [searchRequestNo, setSearchRequestNo] = useState("");
    const [searchStatus, setSearchStatus] = useState("");

    const [selectedRequest, setSelectedRequest] = useState<OutboundRequest | undefined>(undefined);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    // State for Approve/Reject Modal
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [currentAction, setCurrentAction] = useState<"Approve" | "Reject">("Approve");
    const [requestToProcess, setRequestToProcess] = useState<OutboundRequest | undefined>(undefined);

    useEffect(() => {
        dispatch(getOutboundRequests());
    }, [dispatch]);

    const filteredRequests = useMemo(() => {
        return requests.filter((req) => {
            const noMatch = req.requestNo.toLowerCase().includes(searchRequestNo.toLowerCase());
            const statusMatch = searchStatus === "" || req.status === searchStatus;
            return noMatch && statusMatch;
        });
    }, [requests, searchRequestNo, searchStatus]);

    const handleViewDetail = (record: OutboundRequest) => {
        setSelectedRequest(record);
        setIsDetailModalOpen(true);
    };

    const handleApproveReject = (record: OutboundRequest, action: "Approve" | "Reject") => {
        setRequestToProcess(record);
        setCurrentAction(action);
        setIsApproveModalOpen(true);
    };

    const handleProcessRequest = async (data: { action: "Approve" | "Reject"; comment?: string; rejectReason?: string }) => {
        if (!requestToProcess) return;

        try {
            await dispatch(approveRejectOutboundRequest({
                id: requestToProcess.id,
                ...data
            })).unwrap();
            message.success(`${data.action === "Approve" ? "Duyệt" : "Từ chối"} phiếu thành công!`);
            setIsApproveModalOpen(false);
            setRequestToProcess(undefined);
        } catch (error: any) {
            message.error(error || "Có lỗi xảy ra");
        }
    };

    const columns: ColumnsType<OutboundRequest> = [
        {
            title: "Request No",
            dataIndex: "requestNo",
            key: "requestNo",
            render: (text) => <span className="font-semibold text-blue-600">{text}</span>
        },
        {
            title: "Customer", // Changed from Supplier
            dataIndex: "customerName", // Changed from supplierName
            key: "customerName",
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
                                onClick={() => handleApproveReject(record, "Approve")}
                            >
                                Approve
                            </Button>
                            <Button
                                size="small"
                                className="!bg-red-500 !text-white hover:!bg-red-600"
                                onClick={() => handleApproveReject(record, "Reject")}
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

            <h2 className="text-xl font-bold mb-4">Quản lý xuất kho (Outbound Requests)</h2>

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

            <ApproveRejectModal
                open={isApproveModalOpen}
                onClose={() => setIsApproveModalOpen(false)}
                onOk={handleProcessRequest}
                action={currentAction}
                loading={loading}
            />
        </div>
    );
}

export default ManageOutbound;
