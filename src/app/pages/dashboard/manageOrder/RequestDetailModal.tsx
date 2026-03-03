import { Modal, Tag, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import type { InboundRequest, InboundRequestItem } from "../../../../store/inboundRequestSlide";
import { getAllProducts, selectProducts } from "../../../../store/productSlice";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { selectWarehouses } from "../../../../store/warehouseslide";
import { useEffect } from "react";

interface RequestDetailModalProps {
    open: boolean;
    onClose: () => void;
    request?: InboundRequest;
}


const RequestDetailModal = ({ open, onClose, request }: RequestDetailModalProps) => {
    const products = useAppSelector(selectProducts);
    const warehouses = useAppSelector(selectWarehouses);

    const dispatch = useAppDispatch();

    const getProduct = (productId: number) => products.find((p) => p.id === productId);


    useEffect(() => {
        if (open && products.length === 0) {
            dispatch(getAllProducts());
        }
    }, [open, dispatch, products.length]);

    if (!request) return null;
    const columns: ColumnsType<InboundRequestItem> = [
        {
            title: "Product Name",
            dataIndex: "productId",
            key: "productId",
            render: (productId: number) => {
                const product = getProduct(productId);
                return product ? (
                    <div>
                        <div className="font-medium text-gray-800">{product.name}</div>
                        <div className="text-xs text-gray-400 font-mono">{product.sku}</div>
                    </div>
                ) : (<span className="text-red-500">Unknown Product (ID: {productId})</span>);
            }
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
            title={`Xem thông tin đơn mua: ${request.requestNo}`}
            open={open}
            onCancel={onClose}
            footer={null}
            width={800}
        >
            <div className="mb-4 grid grid-cols-2 gap-4">
                <div>
                    <p><strong>Supplier:</strong> {request.supplierName}</p>
                    <p><strong>Status:</strong> <Tag color={request.status === "Approved" ? "green" : "blue"}>{request.status}</Tag></p>
                    <p><strong>Warehouse Name:</strong> {warehouses.find(w => w.id === request.warehouseId)?.name || "Unknown Warehouse"}</p>
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
