import { Descriptions, Tag, Spin, Button, Tooltip } from "antd";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import dayjs from "dayjs";
import { useAppDispatch, useAppSelector } from "../../../store";
import { getStockTransferById, selectCurrentTransfer, selectStockTransferLoading } from "../../../store/stockTransfer2StepSlice";
import URL from "../../../constants/url";

const ViewTransferRequest = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const id = Number(searchParams.get("id"));
    const request = useAppSelector(selectCurrentTransfer);
    const loading = useAppSelector(selectStockTransferLoading);

    useEffect(() => {
        if (id) dispatch(getStockTransferById(id));
    }, [dispatch, id]);

    const getStatusTag = (status: string) => {
        const statusMap: Record<string, { color: string; label: string }> = {
            Pending: { color: "gold", label: "Chờ duyệt" },
            Approved: { color: "green", label: "Đã duyệt" },
            InTransit: { color: "geekblue", label: "Đang vận chuyển" },
            Completed: { color: "blue", label: "Hoàn thành" },
            Rejected: { color: "red", label: "Từ chối" },
        };
        const mapped = statusMap[status];
        return <Tag color={mapped?.color || "default"}>{mapped?.label || status}</Tag>;
    };

    if (loading) return <div className="p-10 text-center"><Spin size="large" /></div>;
    if (!request) return <div className="p-10 text-center text-gray-500">Không tìm thấy phiếu chuyển kho</div>;

    return (
        <div className="p-4">
            <div className="mb-4">
                <Tooltip title="Quay lại">
                    <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(URL.TransferRequest)}
                        className="!flex !items-center !justify-center">
                        Quay lại
                    </Button>
                </Tooltip>
            </div>

            <h2 className="text-xl font-bold mb-4">Chi tiết phiếu chuyển kho</h2>

            <Descriptions bordered column={2} className="mb-6">
                <Descriptions.Item label="Mã phiếu">{request.transferNo}</Descriptions.Item>
                <Descriptions.Item label="Trạng thái">{getStatusTag(request.status)}</Descriptions.Item>
                <Descriptions.Item label="Kho nguồn">{request.fromWarehouseName || `Kho #${request.fromWarehouseId}`}</Descriptions.Item>
                <Descriptions.Item label="Kho đích">{request.toWarehouseName || `Kho #${request.toWarehouseId}`}</Descriptions.Item>
                <Descriptions.Item label="Ngày tạo">{dayjs(request.createdAt).format("DD/MM/YYYY HH:mm")}</Descriptions.Item>
                <Descriptions.Item label="Ghi chú">{request.note || "—"}</Descriptions.Item>
                {request.rejectReason && (
                    <Descriptions.Item label="Lý do từ chối" span={2}>
                        <span className="text-red-500">{request.rejectReason}</span>
                    </Descriptions.Item>
                )}
            </Descriptions>

            <h3 className="text-lg font-semibold mb-3">Danh sách sản phẩm</h3>
            <div className="border-[0.05px] border-gray-300 rounded overflow-hidden">
                <div className="grid grid-cols-7 bg-gray-100 font-semibold text-sm text-center">
                    <div className="px-3 py-2">Sản phẩm</div>
                    <div className="px-3 py-2">SKU</div>
                    <div className="px-3 py-2">Đơn vị</div>
                    <div className="px-3 py-2">SL yêu cầu</div>
                    <div className="px-3 py-2">SL đã nhận</div>
                    <div className="px-3 py-2">Vị trí xuất</div>
                    <div className="px-3 py-2">Ghi chú</div>
                </div>
                {(request.items || []).length === 0 ? (
                    <div className="p-6 text-center text-gray-500">Không có sản phẩm</div>
                ) : (
                    request.items!.map((item) => (
                        <div key={item.id} className="grid grid-cols-7 text-center text-sm border-b-[0.05px] border-gray-300 items-center hover:bg-gray-50">
                            <div className="px-3 py-2">{item.product?.name || `SP #${item.productId}`}</div>
                            <div className="px-3 py-2 text-gray-500">{item.product?.sku || "—"}</div>
                            <div className="px-3 py-2">
                                <Tag color="blue">{item.unitCode || item.unitName || `Unit #${item.unitId}`}</Tag>
                            </div>
                            <div className="px-3 py-2 font-medium">{item.quantity}</div>
                            <div className="px-3 py-2">{item.receivedQuantity ?? "—"}</div>
                            <div className="px-3 py-2">{item.fromStoragePosition || "—"}</div>
                            <div className="px-3 py-2 text-gray-500">{item.lineNote || "—"}</div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ViewTransferRequest;