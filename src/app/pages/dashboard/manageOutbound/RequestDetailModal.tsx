import { Modal, Table, Descriptions, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { type OutboundRequest, type OutboundRequestItem } from "../../../../store/outboundRequestSlide";

interface RequestDetailModalProps {
    open: boolean;
    onClose: () => void;
    request?: OutboundRequest;
}

const RequestDetailModal = ({ open, onClose, request }: RequestDetailModalProps) => {
    if (!request) return null;

    const columns: ColumnsType<OutboundRequestItem> = [
        {
            title: "Product ID",
            dataIndex: "productId",
            key: "productId",
        },
        {
            title: "Quantity",
            dataIndex: "quantity",
            key: "quantity",
        },
        {
            title: "Picked Quantity", // Changed from Received Quantity
            dataIndex: "pickedQuantity",
            key: "pickedQuantity",
        },
        {
            title: "Storage Position",
            dataIndex: "storagePosition",
            key: "storagePosition",
        },
        {
            title: "Line Note",
            dataIndex: "lineNote",
            key: "lineNote",
        },
    ];

    return (
        <Modal
            title={`Chi tiết phiếu xuất: ${request.requestNo}`}
            open={open}
            onCancel={onClose}
            width={800}
            footer={null}
        >
            <Descriptions bordered column={2} className="mb-4">
                <Descriptions.Item label="Customer">{request.customerName}</Descriptions.Item> {/* Changed from Supplier */}
                <Descriptions.Item label="Status">
                    <Tag color={request.status === "Pending" ? "orange" : request.status === "Approved" ? "green" : "red"}>
                        {request.status}
                    </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Warehouse ID">{request.warehouseId}</Descriptions.Item>
                <Descriptions.Item label="Created At">{dayjs(request.createdAt).format("DD/MM/YYYY HH:mm")}</Descriptions.Item>
                <Descriptions.Item label="Description" span={2}>{request.note}</Descriptions.Item>
                {request.approvedBy && (
                    <>
                        <Descriptions.Item label="Approved By">{request.approvedBy}</Descriptions.Item>
                        <Descriptions.Item label="Approved At">{dayjs(request.approvedAt).format("DD/MM/YYYY HH:mm")}</Descriptions.Item>
                    </>
                )}
            </Descriptions>

            <h3 className="font-semibold mb-2">Danh sách sản phẩm</h3>
            <Table
                dataSource={request.outboundItems}
                columns={columns}
                rowKey="id"
                pagination={false}
                bordered
                size="small"
            />
        </Modal>
    );
};

export default RequestDetailModal;
