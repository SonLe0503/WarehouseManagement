import { Modal, Tag, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import type { InboundRequest, InboundRequestItem } from "../../../../store/inboundRequestSlide";

interface RequestDetailModalProps {
    open: boolean;
    onClose: () => void;
    request?: InboundRequest;
}

const RequestDetailModal = ({ open, onClose, request }: RequestDetailModalProps) => {
    if (!request) return null;

    const columns: ColumnsType<InboundRequestItem> = [
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
            title: "Received",
            dataIndex: "receivedQuantity",
            key: "receivedQuantity",
        },
        {
            title: "Storage Position",
            dataIndex: "storagePosition",
            key: "storagePosition",
        },
        {
            title: "Note",
            dataIndex: "lineNote",
            key: "lineNote",
        },
    ];

    return (
        <Modal
            title={`Chi tiết phiếu nhập: ${request.requestNo}`}
            open={open}
            onCancel={onClose}
            footer={null}
            width={800}
        >
            <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                    <p><strong>Supplier:</strong> {request.supplierName}</p>
                    <p><strong>Status:</strong> <Tag color={request.status === "Approved" ? "green" : "blue"}>{request.status}</Tag></p>
                    <p><strong>Warehouse ID:</strong> {request.warehouseId}</p>
                </div>
                <div>
                    <p><strong>Created By:</strong> {request.createdBy}</p>
                    <p><strong>Approved By:</strong> {request.approvedBy}</p>
                    <p><strong>Approved At:</strong> {dayjs(request.approvedAt).format("DD/MM/YYYY HH:mm")}</p>
                </div>
                <div className="col-span-2">
                    <p><strong>Note:</strong> {request.note}</p>
                </div>
            </div>

            <h3 className="font-bold mb-2">Danh sách vật tư</h3>
            <Table
                dataSource={request.inboundItems}
                columns={columns}
                rowKey="id"
                pagination={false}
                size="small"
                bordered
            />
        </Modal>
    );
};

export default RequestDetailModal;
