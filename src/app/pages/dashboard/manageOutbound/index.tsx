import { Button, Tag, Table, Modal, message, Tooltip } from "antd";
import { EyeOutlined, CheckOutlined, CloseOutlined, SendOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../store";
import dayjs from "dayjs";
import Condition from "./Condition";
import ShipGoodsModal from "./ShipGoodsModal";
import ShipDetailModal from "./ShipDetailModal";
import {
    getAllOutboundRequests,
    approveRejectOutbound,
    selectOutboundRequests,
    selectOutboundLoading,
    type IOutboundRequest,
} from "../../../../store/outboundSlice";
import { getAllWarehouses, selectWarehouses } from "../../../../store/warehouseslide";
import { getAllUsers, selectUsers } from "../../../../store/userSlide";

const ManageOutbound = () => {
    const dispatch = useAppDispatch();
    const requests = useAppSelector(selectOutboundRequests);
    const loading = useAppSelector(selectOutboundLoading);
    const warehouses = useAppSelector(selectWarehouses);
    const users = useAppSelector(selectUsers);

    const [searchRequestNo, setSearchRequestNo] = useState("");
    const [searchStatus, setSearchStatus] = useState("");

    const [selectedRequest, setSelectedRequest] = useState<IOutboundRequest | undefined>(undefined);
    const [isShipModalOpen, setIsShipModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    useEffect(() => {
        dispatch(getAllOutboundRequests());
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

    const handleShipGoods = (record: IOutboundRequest) => {
        setSelectedRequest(record);
        setIsShipModalOpen(true);
    };

    const handleViewDetail = (record: IOutboundRequest) => {
        setSelectedRequest(record);
        setIsDetailModalOpen(true);
    };

    const handleApproveReject = (id: number, action: "Approve" | "Reject") => {
        Modal.confirm({
            title: `Xác nhận ${action === "Approve" ? "Duyệt" : "Từ chối"}`,
            content: `Bạn có chắc muốn ${action === "Approve" ? "duyệt" : "từ chối"} đơn xuất này không?`,
            okText: "Đồng ý",
            cancelText: "Hủy",
            onOk: async () => {
                try {
                    await dispatch(approveRejectOutbound({ id, action })).unwrap();
                    message.success(`${action === "Approve" ? "Duyệt" : "Từ chối"} đơn xuất thành công!`);
                } catch (error: any) {
                    message.error(error || "Có lỗi xảy ra");
                }
            },
        });
    };

    const columns: ColumnsType<IOutboundRequest> = [
        {
            title: "Mã yêu cầu",
            dataIndex: "requestNo",
            key: "requestNo",
            render: (text) => <span className="font-semibold text-blue-600">{text}</span>,
        },
        {
            title: "Khách hàng",
            dataIndex: "customerName",
            key: "customerName",
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
                if (status === "Completed") { color = "purple"; text = "Đã xuất"; }
                return <Tag color={color}>{text}</Tag>;
            },
        },
        {
            title: "Kho xuất",
            dataIndex: "warehouseId",
            key: "warehouseId",
            render: (id) => warehouses.find((w) => w.id === id)?.name || id || "—",
        },
        {
            title: "Người tạo",
            dataIndex: "createdBy",
            key: "createdBy",
            render: (id) => users.find((u) => u.id === id)?.username || id || "—",
        },
        {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (date) => dayjs(date).format("DD/MM/YYYY HH:mm"),
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
                    {record.status === "Approved" && (
                        <Tooltip title="Xuất hàng thực tế">
                            <Button
                                type="primary"
                                icon={<SendOutlined />}
                                onClick={() => handleShipGoods(record)}
                                className="!flex !items-center !justify-center !bg-purple-600 hover:!bg-purple-500"
                            />
                        </Tooltip>
                    )}
                </div>
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

            <h2 className="text-xl font-bold mb-4">Quản lý đơn xuất kho</h2>

            <Table
                dataSource={filteredRequests}
                columns={columns}
                rowKey="id"
                loading={loading}
                bordered
            />

            <ShipGoodsModal
                open={isShipModalOpen}
                onClose={() => {
                    setIsShipModalOpen(false);
                    setSelectedRequest(undefined);
                }}
                request={selectedRequest}
                onSuccess={() => dispatch(getAllOutboundRequests())}
            />

            <ShipDetailModal
                open={isDetailModalOpen}
                onClose={() => {
                    setIsDetailModalOpen(false);
                    setSelectedRequest(undefined);
                }}
                request={selectedRequest}
            />
        </div>
    );
};

export default ManageOutbound;
