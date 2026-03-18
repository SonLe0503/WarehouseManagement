import { Button, Tag, Table, Modal, message, Tooltip, Badge, Divider } from "antd";
import { EyeOutlined, CheckOutlined, CloseOutlined, InboxOutlined, WarningOutlined, SwapOutlined } from "@ant-design/icons";

import type { ColumnsType } from "antd/es/table";
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import Condition from "./Condition";
import RequestDetailModal from "./RequestDetailModal";
import ReceiveGoodsModal from "./ReceiveGoodsModal";
import ReceiveTransferModal from "../../../components/modal/ReceiveTransferModal";

import {
    getInboundRequests,
    approveRejectRequest,
    selectInboundRequests,
    selectInboundRequestLoading,
    type InboundRequest,
} from "../../../../store/inboundRequestSlide";
import { getAllWarehouses, selectWarehouses } from "../../../../store/warehouseslide";
import { getAllUsers, selectUsers } from "../../../../store/userSlide";
import {
    getMyStockTransfers,
    selectStockTransfers,
} from "../../../../store/stockTransfer2StepSlice";

const hasQuantityDiff = (req: InboundRequest) =>
    req.status === "Completed" &&
    req.inboundItems?.some(
        (item) =>
            item.receivedQuantity !== null &&
            item.receivedQuantity !== undefined &&
            item.receivedQuantity !== item.quantity
    );

const ManageOrder = () => {
    const dispatch = useAppDispatch();
    const requests = useSelector(selectInboundRequests);
    const loading = useSelector(selectInboundRequestLoading);
    const warehouses = useSelector(selectWarehouses);
    const users = useSelector(selectUsers);
    const allTransfers = useAppSelector(selectStockTransfers);

    const [searchRequestNo, setSearchRequestNo] = useState("");
    const [searchStatus, setSearchStatus] = useState("");

    const [selectedRequest, setSelectedRequest] = useState<InboundRequest | undefined>(undefined);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);

    // State cho modal nhận hàng chuyển kho
    const [receiveTransferId, setReceiveTransferId] = useState<number | null>(null);
    const [isReceiveTransferOpen, setIsReceiveTransferOpen] = useState(false);

    useEffect(() => {
        dispatch(getInboundRequests());
        dispatch(getAllWarehouses());
        dispatch(getAllUsers());
        dispatch(getMyStockTransfers());
    }, [dispatch]);

    // Lọc phiếu chuyển kho đang InTransit (chờ nhận hàng)
    const inTransitTransfers = useMemo(() =>
        (allTransfers || []).filter(t => t.status === "InTransit"),
        [allTransfers]
    );

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
            },
        });
    };

    const columns: ColumnsType<InboundRequest> = [
        {
            title: "Mã yêu cầu",
            dataIndex: "requestNo",
            key: "requestNo",
            render: (text, record) => (
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-blue-600">{text}</span>
                    {hasQuantityDiff(record) && (
                        <Tooltip title="Có chênh lệch số lượng so với đơn đặt">
                            <WarningOutlined className="text-orange-500 text-base" />
                        </Tooltip>
                    )}
                </div>
            ),
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
            render: (status, record) => {
                let color = "blue";
                let text = status;
                if (status === "Approved") { color = "green"; text = "Đã duyệt"; }
                if (status === "Rejected") { color = "red"; text = "Từ chối"; }
                if (status === "Pending") { color = "orange"; text = "Đang chờ"; }
                if (status === "Completed") { color = "blue"; text = "Đã nhập"; }
                return (
                    <div className="flex items-center gap-1">
                        <Tag color={color}>{text}</Tag>
                        {hasQuantityDiff(record) && (
                            <Badge count="Chênh lệch" style={{ backgroundColor: "#f97316", fontSize: 10, padding: "0 4px" }} />
                        )}
                    </div>
                );
            },
        },
        {
            title: "Tên kho",
            dataIndex: "warehouseId",
            key: "warehouseId",
            render: (id) => warehouses.find((w) => w.id === id)?.name || id,
        },
        {
            title: "Người duyệt",
            dataIndex: "approvedBy",
            key: "approvedBy",
            render: (id) => users.find((u) => u.id === id)?.username || id || "—",
        },
        {
            title: "Ngày duyệt",
            dataIndex: "approvedAt",
            key: "approvedAt",
            render: (date) => (date ? dayjs(date).format("DD/MM/YYYY") : "—"),
        },
        {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (date) => dayjs(date).format("DD/MM/YYYY"),
        },
        {
            title: "Hành động",
            key: "action",
            render: (_, record) => (
                <div className="flex gap-2">
                    <Tooltip title="Xem chi tiết">
                        <Button type="default" icon={<EyeOutlined />}
                            onClick={() => handleViewDetail(record)}
                            className="!flex !items-center !justify-center" />
                    </Tooltip>
                    {record.status === "Pending" && (
                        <>
                            <Tooltip title="Duyệt">
                                <Button type="primary" icon={<CheckOutlined />}
                                    onClick={() => handleApproveReject(record.id, "Approve")}
                                    className="!flex !items-center !justify-center !bg-green-500 hover:!bg-green-400" />
                            </Tooltip>
                            <Tooltip title="Từ chối">
                                <Button danger type="primary" icon={<CloseOutlined />}
                                    onClick={() => handleApproveReject(record.id, "Reject")}
                                    className="!flex !items-center !justify-center" />
                            </Tooltip>
                        </>
                    )}
                    {record.status === "Approved" && (
                        <Tooltip title="Nhận hàng thực tế">
                            <Button type="primary" icon={<InboxOutlined />}
                                onClick={() => handleReceiveGoods(record)}
                                className="!flex !items-center !justify-center !bg-purple-600 hover:!bg-purple-500" />
                        </Tooltip>
                    )}
                </div>
            ),
        },
    ];

    // Cột bảng phiếu chuyển kho InTransit
    const transferColumns: ColumnsType<any> = [
        {
            title: "Mã phiếu",
            dataIndex: "transferNo",
            key: "transferNo",
            render: (text) => <span className="font-semibold text-blue-600">{text}</span>,
        },
        {
            title: "Kho nguồn",
            dataIndex: "fromWarehouseName",
            key: "fromWarehouseName",
            render: (v, r) => v || `Kho #${r.fromWarehouseId}`,
        },
        {
            title: "Kho đích (nhận)",
            dataIndex: "toWarehouseName",
            key: "toWarehouseName",
            render: (v, r) => <strong>{v || `Kho #${r.toWarehouseId}`}</strong>,
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: () => <Tag color="geekblue">Đang vận chuyển</Tag>,
        },
        {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (date) => dayjs(date).format("DD/MM/YYYY HH:mm"),
        },
        {
            title: "Ghi chú",
            dataIndex: "note",
            key: "note",
            render: (v) => v || "—",
        },
        {
            title: "Hành động",
            key: "action",
            render: (_, record) => (
                <Tooltip title="Nhận hàng chuyển kho">
                    <Button type="primary" icon={<InboxOutlined />}
                        onClick={() => {
                            setReceiveTransferId(record.id);
                            setIsReceiveTransferOpen(true);
                        }}
                        className="!flex !items-center !justify-center !bg-purple-600 hover:!bg-purple-500">
                        Nhận hàng
                    </Button>
                </Tooltip>
            ),
        },
    ];

    return (
        <div className="p-2">
            <Condition
                searchRequestNo={searchRequestNo}
                setSearchRequestNo={setSearchRequestNo}
                searchStatus={searchStatus}
                setSearchStatus={setSearchStatus}
            />

            {/* ── Section 1: Phiếu chuyển kho đang vận chuyển ── */}
            {inTransitTransfers.length > 0 && (
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <SwapOutlined className="text-geekblue-500 text-lg" />
                        <h2 className="text-lg font-bold text-blue-700 m-0">
                            Phiếu chuyển kho chờ nhận hàng
                        </h2>
                        <Badge count={inTransitTransfers.length} color="geekblue" />
                    </div>
                    <Table
                        dataSource={inTransitTransfers}
                        columns={transferColumns}
                        rowKey="id"
                        pagination={false}
                        bordered
                        size="small"
                        className="border border-blue-100 rounded"
                        rowClassName="bg-blue-50 hover:bg-blue-100"
                    />
                    <Divider />
                </div>
            )}

            {/* ── Section 2: Phiếu nhập hàng từ NCC ── */}
            <h2 className="text-xl font-bold mb-4">Quản lý đơn mua</h2>

            <Table
                dataSource={filteredRequests}
                columns={columns}
                rowKey="id"
                loading={loading}
                bordered
                rowClassName={(record) =>
                    hasQuantityDiff(record) ? "!bg-orange-50 hover:!bg-orange-100" : ""
                }
            />

            <RequestDetailModal
                open={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                request={selectedRequest}
            />
            <ReceiveGoodsModal
                open={isReceiveModalOpen}
                onClose={() => { setIsReceiveModalOpen(false); setSelectedRequest(undefined); }}
                request={selectedRequest}
                onSuccess={() => dispatch(getInboundRequests())}
            />
            <ReceiveTransferModal
                open={isReceiveTransferOpen}
                transferId={receiveTransferId}
                onClose={() => { setIsReceiveTransferOpen(false); setReceiveTransferId(null); }}
                onSuccess={() => {
                    dispatch(getMyStockTransfers());
                    dispatch(getInboundRequests());
                }}
            />
        </div>
    );
};

export default ManageOrder;