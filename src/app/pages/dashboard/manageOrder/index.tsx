import { Button, Tag, Table, Modal, message, Tooltip } from "antd";
import { EyeOutlined, CheckOutlined, CloseOutlined, InboxOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch } from "../../../../store";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import Condition from "./Condition";
import RequestDetailModal from "./RequestDetailModal";
import ReceiveGoodsModal from "./ReceiveGoodsModal";

import {
    getInboundRequests,
    approveRejectRequest,
    selectInboundRequests,
    selectInboundRequestLoading,

    type InboundRequest

} from "../../../../store/inboundRequestSlide";
import { getActiveWarehouses, selectWarehouses } from "../../../../store/warehouseslide";
import { select } from "framer-motion/client";
import { getAllRoles, selectRoleLoading } from "../../../../store/roleSlide";



const ManageOrder = () => {
    const dispatch = useAppDispatch();
    const requests = useSelector(selectInboundRequests);
    const loading = useSelector(selectInboundRequestLoading);
    const warehouses = useSelector(selectWarehouses);
    const role = useSelector(selectRoleLoading);

    const [searchRequestNo, setSearchRequestNo] = useState("");
    const [searchStatus, setSearchStatus] = useState("");

    const [selectedRequest, setSelectedRequest] = useState<InboundRequest | undefined>(undefined);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);

    useEffect(() => {
        dispatch(getInboundRequests());
        dispatch(getActiveWarehouses());
        dispatch(getAllRoles());
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
    const handleReceiveGoods = (record: InboundRequest) => {
        setSelectedRequest(record);
        setIsReceiveModalOpen(true);
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
            title: "Warehouse Name",
            dataIndex: "warehouseId",
            key: "warehouseId",
            render: (warehouseId: number) => {
                const warehouse = warehouses.find(w => w.id === warehouseId);
                return warehouse ? (
                    <div>
                        <div className="font-medium text-gray-800">{warehouse.name}</div>
                        <div className="text-xs text-gray-400 font-mono">{warehouse.code}</div>
                    </div>
                ) : (<span className="text-red-500">Unknown Warehouse (ID: {warehouseId})</span>);
            }
        },
        {
            title: "Approved By",
            dataIndex: "approvedBy",
            key: "approvedBy",
            render: (RoleId: number) => {
                const role = RoleId === 2 ? "Admin" : "User";
                return <span>{role}</span>;
            }
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
                    {record.status === "Approved" && (
                        <Tooltip title="Nhận hàng thực tế">
                            <Button
                                type="primary"
                                icon={<InboxOutlined />}
                                onClick={() => handleReceiveGoods(record)}
                                className="!flex !items-center !justify-center !bg-purple-600 hover:!bg-purple-500"
                            />
                        </Tooltip>
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
            <ReceiveGoodsModal
                open={isReceiveModalOpen}
                onClose={() => {
                    setIsReceiveModalOpen(false);
                    setSelectedRequest(undefined);
                }}
                request={selectedRequest}
                onSuccess={() => dispatch(getInboundRequests())}
            />
        </div>
    );
}

export default ManageOrder;
