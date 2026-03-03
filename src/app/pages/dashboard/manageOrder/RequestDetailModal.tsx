import { Modal, Tag, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { useAppDispatch } from "../../../../store";
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

const RequestDetailModal = ({ open, onClose, request }: RequestDetailModalProps) => {
    const dispatch = useAppDispatch();
    const products = useSelector(selectProducts);
    const warehouses = useSelector(selectWarehouses);
    const users = useSelector(selectUsers);
    const units = useSelector(selectUnits);

    useEffect(() => {
        if (open) {
            dispatch(getAllProducts());
            dispatch(getAllWarehouses());
            dispatch(getAllUsers());
            dispatch(getAllUnits());
        }
    }, [open, dispatch]);

    if (!request) return null;

    const columns: ColumnsType<InboundRequestItem> = [
        {
            title: "Tên sản phẩm",
            dataIndex: "productId",
            key: "productId",
            render: (id) => products.find(p => p.id === id)?.name || id
        },
        {
            title: "Số lượng",
            dataIndex: "quantity",
            key: "quantity",
            render: (val, record) => {
                const unitName = units.find(u => u.id === record.unitId)?.name || "";
                return `${val} ${unitName}`;
            }
        },
        {
            title: "Đã nhận",
            dataIndex: "receivedQuantity",
            key: "receivedQuantity",
            render: (val, record) => {
                const unitName = units.find(u => u.id === record.unitId)?.name || "";
                return `${val} ${unitName}`;
            }
        },
        {
            title: "Vị trí lưu kho",
            dataIndex: "storagePosition",
            key: "storagePosition",
        },
        {
            title: "Ghi chú",
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
                    <p><strong>Nhà cung cấp:</strong> {request.supplierName}</p>
                    <p><strong>Trạng thái:</strong> <Tag color={request.status === "Approved" ? "green" : (request.status === "Pending" ? "orange" : (request.status === "Rejected" ? "red" : "blue"))}>{
                        request.status === "Approved" ? "Đã duyệt" : (request.status === "Pending" ? "Đang chờ" : (request.status === "Rejected" ? "Từ chối" : request.status))
                    }</Tag></p>
                    <p><strong>Tên kho:</strong> {warehouses.find(w => w.id === request.warehouseId)?.name || request.warehouseId}</p>
                </div>
                <div>
                    <p><strong>Người tạo:</strong> {users.find(u => u.id === request.createdBy)?.username || request.createdBy}</p>
                    <p><strong>Người duyệt:</strong> {users.find(u => u.id === request.approvedBy)?.username || request.approvedBy || "—"}</p>
                    <p><strong>Ngày duyệt:</strong> {request.approvedAt ? dayjs(request.approvedAt).format("DD/MM/YYYY HH:mm") : "—"}</p>
                </div>
                <div className="col-span-2">
                    <p><strong>Ghi chú:</strong> {request.note}</p>
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
