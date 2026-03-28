import { Modal, Button, message, Tag, Space, Tooltip, InputNumber, Input, Progress } from "antd";
import { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../../store";
import {
    getStockCountItems,
    updateActualQuantity,
    selectStockCountItems,
    selectStockCountLoading,
    approveStockCountSession
} from "../../../store/stockCountSlide";
import { selectInfoLogin } from "../../../store/authSlide";
import { getAllProducts, selectProducts } from "../../../store/productSlice";
import {
    CheckOutlined,
    SaveOutlined,
    AuditOutlined,
    EditOutlined,
    CloseOutlined,
    DownOutlined,
    RightOutlined,
    EnvironmentOutlined
} from "@ant-design/icons";

interface StockCountItemModalProps {
    open: boolean;
    onClose: () => void;
    session: any;
}

const StockCountItemModal = ({ open, onClose, session }: StockCountItemModalProps) => {
    const dispatch = useAppDispatch();
    const items = useAppSelector(selectStockCountItems);
    const products = useAppSelector(selectProducts);
    const loading = useAppSelector(selectStockCountLoading);
    const infoLogin = useAppSelector(selectInfoLogin);

    const [editingId, setEditingId] = useState<number | null>(null);
    const [editValues, setEditValues] = useState<any>({});
    const [expandedBins, setExpandedBins] = useState<Set<string>>(new Set());
    const [hasInitialized, setHasInitialized] = useState(false);

    useEffect(() => {
        if (open && session?.id) {
            dispatch(getStockCountItems(session.id));
            dispatch(getAllProducts());
            setHasInitialized(false); // reset khi mở modal mới
        }
    }, [open, session?.id, dispatch]);

    // Chỉ collapse tất cả bin lần đầu tiên load, không reset khi items cập nhật
    useEffect(() => {
        if (items.length > 0 && !hasInitialized) {
            setExpandedBins(new Set());
            setHasInitialized(true);
        }
    }, [items, hasInitialized]);

    // Group items by storagePosition
    const groupedByBin = useMemo(() => {
        const map = new Map<string, any[]>();
        items.forEach(item => {
            const bin = item.storagePosition || "N/A";
            if (!map.has(bin)) map.set(bin, []);
            map.get(bin)!.push(item);
        });
        return map;
    }, [items]);

    const isAllCounted = useMemo(() => {
        return items.length > 0 && items.every(item =>
            item.actualQuantity !== null && item.actualQuantity !== undefined
        );
    }, [items]);

    const totalCounted = useMemo(() => {
        return items.filter(item =>
            item.actualQuantity !== null && item.actualQuantity !== undefined
        ).length;
    }, [items]);

    const toggleBin = (bin: string) => {
        setExpandedBins(prev => {
            const next = new Set(prev);
            if (next.has(bin)) next.delete(bin);
            else next.add(bin);
            return next;
        });
    };

    const handleUpdateQuantity = async (record: any) => {
        try {
            const payload = {
                actualQuantity: editValues.actualQuantity ?? record.actualQuantity ?? 0,
                note: editValues.note ?? record.note ?? ""
            };
            await dispatch(updateActualQuantity({ id: record.id, data: payload })).unwrap();
            message.success("Cập nhật số lượng thực tế thành công");
            setEditingId(null);
            setEditValues({});
        } catch (error: any) {
            message.error(error || "Có lỗi xảy ra");
        }
    };

    const handleApprove = async () => {
        try {
            await dispatch(approveStockCountSession(session.id)).unwrap();
            message.success("Đã phê duyệt phiên kiểm kê");
            onClose();
        } catch (error: any) {
            message.error(error || "Có lỗi xảy ra");
        }
    };

    const canEdit = session?.status === "Counting" && infoLogin?.role === "STAFF";

    const renderBinGroup = (bin: string, binItems: any[]) => {
        const isExpanded = expandedBins.has(bin);
        const countedCount = binItems.filter(i =>
            i.actualQuantity !== null && i.actualQuantity !== undefined
        ).length;
        const totalCount = binItems.length;
        const isComplete = countedCount === totalCount;
        const progressPercent = totalCount > 0 ? Math.round((countedCount / totalCount) * 100) : 0;

        return (
            <div
                key={bin}
                className="mb-3 rounded-xl overflow-hidden border border-gray-200"
                style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}
            >
                {/* Bin Header */}
                <div
                    className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
                    style={{
                        background: isComplete ? "#f0fdf4" : "#fff",
                        borderBottom: isExpanded ? "1px solid #e5e7eb" : "none",
                        transition: "background 0.2s"
                    }}
                    onClick={() => toggleBin(bin)}
                >
                    <div className="flex items-center gap-3">
                        <span className="text-gray-400 text-sm">
                            {isExpanded ? <DownOutlined /> : <RightOutlined />}
                        </span>
                        <EnvironmentOutlined className={isComplete ? "text-green-500" : "text-blue-500"} />
                        <div>
                            <span className="font-bold text-gray-800 text-base">{bin}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <Tag
                                color={isComplete ? "success" : countedCount > 0 ? "warning" : "default"}
                                className="font-semibold text-xs"
                            >
                                {countedCount}/{totalCount} đã điền
                            </Tag>
                            <span className="text-gray-400 text-xs ml-1">{totalCount} sản phẩm</span>
                        </div>
                    </div>
                </div>

                {/* Progress bar */}
                <Progress
                    percent={progressPercent}
                    showInfo={false}
                    strokeColor={isComplete ? "#22c55e" : "#3b82f6"}
                    trailColor="#f3f4f6"
                    size={[undefined as any, 4]}
                    style={{ margin: 0, lineHeight: 0 }}
                    className="block"
                />

                {/* Expanded content */}
                {isExpanded && (
                    <div>
                        {/* Table header */}
                        <div className="grid grid-cols-12 px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                            <div className="col-span-5">Sản phẩm</div>
                            <div className="col-span-2 text-center">Hệ thống</div>
                            <div className="col-span-2 text-center">Thực tế</div>
                            <div className="col-span-2 text-center">Chênh lệch</div>
                            <div className="col-span-1 text-center">Thao tác</div>
                        </div>

                        {/* Table rows */}
                        {binItems.map((record, idx) => {
                            const isEditing = editingId === record.id;
                            const productInfo = record.product || products.find((p: any) => p.id === record.productId);
                            
                            // Auto calculate difference for UI feedback
                            const currentActual = isEditing 
                                ? (editValues.actualQuantity ?? record.actualQuantity ?? 0) 
                                : record.actualQuantity;
                            
                            const hasValue = currentActual !== null && currentActual !== undefined;
                            const diff = hasValue ? (currentActual - record.systemQuantity) : 0;
                            const hasCounted = record.actualQuantity !== null && record.actualQuantity !== undefined;

                            return (
                                <div
                                    key={record.id}
                                    className={`grid grid-cols-12 px-4 py-3 items-center border-b border-gray-50 text-sm ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/40"} ${isEditing ? "bg-blue-50/60" : ""}`}
                                >
                                    {/* Product */}
                                    <div className="col-span-5">
                                        <span className="font-mono font-bold text-blue-600 text-xs">
                                            [{productInfo?.sku || "N/A"}]
                                        </span>
                                        <div className="text-gray-700 text-sm leading-tight mt-0.5">
                                            {productInfo?.name || `Sản phẩm ID: ${record.productId}`}
                                        </div>
                                        {record.note && !isEditing && (
                                            <div className="text-gray-400 text-xs italic mt-0.5">📝 {record.note}</div>
                                        )}
                                    </div>

                                    {/* System qty */}
                                    <div className="col-span-2 text-center">
                                        <span className="font-semibold text-gray-700">{record.systemQuantity}</span>
                                        <span className="text-gray-400 text-xs ml-1">{record.baseUnitName}</span>
                                    </div>

                                    {/* Actual qty */}
                                    <div className="col-span-2 text-center">
                                        {isEditing ? (
                                            <div className="flex flex-col gap-1 items-center">
                                                <InputNumber
                                                    min={0}
                                                    value={editValues.actualQuantity ?? record.actualQuantity ?? 0}
                                                    onChange={(val) => setEditValues({ ...editValues, actualQuantity: val })}
                                                    className="w-20"
                                                    size="small"
                                                    autoFocus
                                                />
                                                <Input
                                                    size="small"
                                                    value={editValues.note ?? record.note ?? ""}
                                                    onChange={(e) => setEditValues({ ...editValues, note: e.target.value })}
                                                    placeholder="Ghi chú..."
                                                    className="w-28 text-xs"
                                                />
                                            </div>
                                        ) : (
                                            <span className={`font-semibold ${hasCounted ? "text-blue-600" : "text-gray-300"}`}>
                                                {hasCounted ? (
                                                    <>
                                                        {record.actualQuantity}
                                                        <span className="text-gray-400 font-normal text-xs ml-1">{record.baseUnitName}</span>
                                                    </>
                                                ) : "—"}
                                            </span>
                                        )}
                                    </div>

                                    {/* Diff */}
                                    <div className="col-span-2 text-center">
                                        {hasValue ? (
                                            <Tag
                                                color={diff === 0 ? "success" : diff > 0 ? "blue" : "error"}
                                                className="font-semibold"
                                            >
                                                {diff > 0 ? `+${diff}` : diff}
                                                <span className="font-normal text-xs ml-1">{record.baseUnitName}</span>
                                            </Tag>
                                        ) : "—"}
                                    </div>

                                    {/* Action */}
                                    <div className="col-span-1 text-center">
                                        {canEdit && (
                                            isEditing ? (
                                                <Space size={4}>
                                                    <Tooltip title="Lưu">
                                                        <Button
                                                            type="primary"
                                                            size="small"
                                                            icon={<SaveOutlined />}
                                                            onClick={() => handleUpdateQuantity(record)}
                                                        />
                                                    </Tooltip>
                                                    <Tooltip title="Hủy">
                                                        <Button
                                                            size="small"
                                                            icon={<CloseOutlined />}
                                                            onClick={() => { setEditingId(null); setEditValues({}); }}
                                                        />
                                                    </Tooltip>
                                                </Space>
                                            ) : (
                                                <Tooltip title="Nhập số lượng thực tế">
                                                    <Button
                                                        type="text"
                                                        size="small"
                                                        icon={<EditOutlined className="text-blue-500" />}
                                                        onClick={() => {
                                                            setEditingId(record.id);
                                                            setEditValues({
                                                                actualQuantity: record.actualQuantity,
                                                                note: record.note
                                                            });
                                                        }}
                                                    />
                                                </Tooltip>
                                            )
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Bin footer */}
                        <div className="flex items-center justify-end gap-2 px-4 py-2 bg-gray-50 border-t border-gray-100">
                            {canEdit && isComplete && (
                                <span className="text-green-600 text-xs font-medium flex items-center gap-1">
                                    <CheckOutlined /> Bin hoàn thành
                                </span>
                            )}
                            <Button
                                size="small"
                                onClick={() => toggleBin(bin)}
                                className="text-xs text-gray-500"
                            >
                                Thu gọn
                            </Button>
                            {isComplete && (
                                <Button
                                    size="small"
                                    type="primary"
                                    icon={<CheckOutlined />}
                                    className="bg-green-600 border-none text-xs"
                                    onClick={() => toggleBin(bin)}
                                >
                                    Xong bin này
                                </Button>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <Modal
            title={
                <div className="flex items-center gap-3">
                    <AuditOutlined className="text-blue-600" />
                    <span>Chi tiết kiểm kê: {session?.countNo}</span>
                    <Tag color="orange" className="ml-2 uppercase">{session?.status}</Tag>
                </div>
            }
            open={open}
            onCancel={onClose}
            width={1050}
            footer={[
                <Button key="close" onClick={onClose}>Đóng</Button>,
                session?.status === "Counting" &&
                (infoLogin?.role === "MANAGE" || infoLogin?.role === "ADMIN") &&
                isAllCounted && (
                    <Button
                        key="approve"
                        type="primary"
                        icon={<CheckOutlined />}
                        onClick={handleApprove}
                        className="bg-green-600 hover:bg-green-700 border-none"
                    >
                        Phê duyệt & Chốt tồn kho
                    </Button>
                )
            ]}
        >
            {/* Overall progress summary */}
            <div className="mb-4 flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center gap-2">
                    <span className="text-blue-700 font-semibold text-sm">
                        Phiên kiểm kê {session?.countNo}
                    </span>
                    <span className="text-gray-500 text-sm">·</span>
                    <span className="text-gray-600 text-sm">
                        {groupedByBin.size} bin · {totalCounted}/{items.length} hoàn thành
                    </span>
                </div>
                <Tag color={isAllCounted ? "success" : "processing"} className="font-medium">
                    {isAllCounted ? "✓ Đã kiểm xong" : `Còn ${items.length - totalCounted} chưa điền`}
                </Tag>
            </div>

            {/* Warning for manager */}
            {session?.status === "Counting" && infoLogin?.role === "MANAGE" && !isAllCounted && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
                    ⚠️ <b>Lưu ý:</b> Cần chờ nhân viên hoàn thành kiểm đếm tất cả sản phẩm trước khi có thể phê duyệt.
                </div>
            )}

            {/* Bin groups */}
            {loading ? (
                <div className="text-center py-8 text-gray-400">Đang tải dữ liệu...</div>
            ) : (
                <div style={{ maxHeight: 520, overflowY: "auto", paddingRight: 4 }}>
                    {Array.from(groupedByBin.entries()).map(([bin, binItems]) =>
                        renderBinGroup(bin, binItems)
                    )}
                </div>
            )}
        </Modal>
    );
};

export default StockCountItemModal;