import { Modal, Tag, Table, Descriptions } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../../store";
import type { InboundRequest, InboundRequestItem } from "../../../../store/inboundRequestSlide";
import { getAllProducts, selectProducts } from "../../../../store/productSlice";
import { getAllWarehouses, selectWarehouses } from "../../../../store/warehouseslide";
import { getAllUsers, selectUsers } from "../../../../store/userSlide";
import { getAllUnits, selectUnits } from "../../../../store/unitSlide";

interface RequestDetailModalProps {
    open: boolean;
    onClose: () => void;
    request?: InboundRequest;
}

const statusConfig: Record<string, { color: string; label: string }> = {
    Pending: { color: "orange", label: "Đang chờ" },
    Approved: { color: "green", label: "Đã duyệt" },
    Rejected: { color: "red", label: "Từ chối" },
    Completed: { color: "blue", label: "Đã nhập" },
};

const RequestDetailModal = ({ open, onClose, request }: RequestDetailModalProps) => {
    const dispatch = useAppDispatch();
    const products = useAppSelector(selectProducts);
    const warehouses = useAppSelector(selectWarehouses);
    const users = useAppSelector(selectUsers);
    const units = useAppSelector(selectUnits);

    useEffect(() => {
        if (open) {
            dispatch(getAllProducts());
            dispatch(getAllWarehouses());
            dispatch(getAllUsers());
            dispatch(getAllUnits());
        }
    }, [open, dispatch]);

    if (!request) return null;

    const warehouse = warehouses.find((w) => w.id === request.warehouseId);
    const createdByUser = users.find((u) => u.id === request.createdBy);
    const approvedByUser = users.find((u) => u.id === request.approvedBy);
    const status = statusConfig[request.status] ?? { color: "default", label: request.status };

    const getUnitName = (item: InboundRequestItem) => {
        const unit = units.find((u) => u.id === item.unitId);
        if (unit) return unit.name;
        const product = products.find((p) => p.id === item.productId);
        return product?.baseUnitCode || "";
    };

    const columns: ColumnsType<InboundRequestItem> = [
        {
            title: "Sản phẩm",
            key: "product",
            render: (_, record) => {
                const product = products.find((p) => p.id === record.productId);
                return product ? (
                    <div>
                        <div className="font-medium text-gray-800">{product.name}</div>
                        <div className="text-xs text-gray-400 font-mono">{product.sku}</div>
                    </div>
                ) : (
                    <span className="text-gray-400">#{record.productId}</span>
                );
            },
        },
        {
            title: "Đơn vị",
            key: "unit",
            width: 90,
            align: "center",
            render: (_, record) => (
                <Tag className="font-mono">{getUnitName(record)}</Tag>
            ),
        },
        {
            title: "SL yêu cầu",
            dataIndex: "quantity",
            key: "quantity",
            width: 110,
            align: "center",
            render: (val, record: InboundRequestItem) => (
                <div className="text-center">
                    <span className="font-semibold text-gray-700">{val}</span>
                    <span className="ml-1 text-xs text-gray-400">{getUnitName(record)}</span>
                </div>
            ),
        },
        {
            title: "SL đã nhập",
            dataIndex: "receivedQuantity",
            key: "receivedQuantity",
            width: 110,
            align: "center",
            render: (val, record: InboundRequestItem) => {
                if (val === undefined || val === null) {
                    return <span className="text-gray-300">—</span>;
                }
                const diff = val - record.quantity;
                const color = diff === 0 ? "green" : diff > 0 ? "cyan" : "orange";
                return (
                    <div className="text-center">
                        <div>
                            <Tag color={color} className="font-semibold mr-1">{val}</Tag>
                            <span className="text-xs text-gray-400">{getUnitName(record)}</span>
                        </div>
                        {diff !== 0 && (
                            <div className="text-[10px] text-orange-400 mt-0.5">
                                {diff > 0 ? "+" : ""}{diff.toFixed(2)}
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            title: "Vị trí",
            dataIndex: "storagePosition",
            key: "storagePosition",
            width: 100,
            align: "center",
            render: (val) => val ? <Tag color="blue" className="font-mono uppercase m-0">{val}</Tag> : "—",
        },
        {
            title: "Ghi chú",
            dataIndex: "lineNote",
            key: "lineNote",
            render: (val) => val
                ? <span className="text-gray-500 italic text-xs">{val}</span>
                : <span className="text-gray-300">—</span>,
        },
    ];

    return (
        <Modal
            title={
                <div className="flex items-center gap-3">
                    <span className="text-blue-700 font-bold text-lg">Chi tiết phiếu nhập hàng</span>
                    <Tag color="blue" className="font-mono">{request.requestNo}</Tag>
                    <Tag color={status.color}>{status.label}</Tag>
                </div>
            }
            open={open}
            onCancel={onClose}
            footer={null}
            width={900}
            style={{ top: 20 }}
        >

            <Descriptions
                bordered
                size="small"
                column={2}
                className="mb-5"
            >
                <Descriptions.Item label="Nhà cung cấp">
                    <strong>{request.supplierName}</strong>
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                    <Tag color={status.color}>{status.label}</Tag>
                </Descriptions.Item>

                <Descriptions.Item label="Kho nhập">
                    {warehouse ? `${warehouse.name} (${warehouse.code})` : request.warehouseId || "—"}
                </Descriptions.Item>
                <Descriptions.Item label="Người tạo">
                    {createdByUser?.username || request.createdBy || "—"}
                </Descriptions.Item>

                <Descriptions.Item label="Ngày tạo">
                    {dayjs(request.createdAt).format("DD/MM/YYYY HH:mm")}
                </Descriptions.Item>
                <Descriptions.Item label="Người duyệt">
                    {approvedByUser?.username || request.approvedBy || "—"}
                </Descriptions.Item>

                {request.approvedAt && (
                    <Descriptions.Item label="Ngày duyệt">
                        {dayjs(request.approvedAt).format("DD/MM/YYYY HH:mm")}
                    </Descriptions.Item>
                )}

                {request.note && (
                    <Descriptions.Item label="Ghi chú" span={2}>
                        {request.note}
                    </Descriptions.Item>
                )}
            </Descriptions>

            {/* Danh sách sản phẩm */}
            <h3 className="font-bold mb-2 text-gray-700">Danh sách vật tư nhập</h3>
            <Table
                dataSource={request.inboundItems || []}
                columns={columns}
                rowKey="id"
                pagination={false}
                size="small"
                bordered
                locale={{ emptyText: "Không có sản phẩm nào" }}
                rowClassName={(record) => {
                    if (record.receivedQuantity === undefined || record.receivedQuantity === null) return "";
                    if (record.receivedQuantity !== record.quantity) return "bg-orange-50";
                    return "bg-green-50";
                }}
            />


            {request.status === "Completed" && request.inboundItems && request.inboundItems.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800 flex gap-6">
                    <span>
                        <strong>Tổng SP:</strong> {request.inboundItems.length}
                    </span>
                    <span>
                        <strong>Tổng SL yêu cầu:</strong>{" "}
                        {request.inboundItems.reduce((s: number, i: InboundRequestItem) => s + i.quantity, 0)}
                    </span>
                    <span>
                        <strong>Tổng SL đã nhập:</strong>{" "}
                        {request.inboundItems.reduce((s: number, i: InboundRequestItem) => s + (i.receivedQuantity ?? 0), 0)}
                    </span>
                </div>
            )}
        </Modal>
    );
};

export default RequestDetailModal;
