import { Button, Tag, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch } from "../../../../store"; // Adjust path if needed
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import Condition from "./Condition";
import RequestDetailModal from "./RequestDetailModal";
import { getInboundRequests, selectInboundRequests, selectInboundRequestLoading, type InboundRequest } from "../../../../store/inboundRequestSlide";

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
                <Button size="small" type="default" onClick={() => handleViewDetail(record)}>
                    View Detail
                </Button>
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
