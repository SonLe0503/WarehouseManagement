import { Modal, Table, InputNumber, Input, Tag, Typography, Alert, App, Select, Button } from "antd";
import { useEffect, useState } from "react";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../../store";
import {
    receiveGoods,
    type InboundRequest,
    type InboundRequestItem,
} from "../../../../store/inboundRequestSlide";
import { getAllProducts, selectProducts } from "../../../../store/productSlice";
import { getActiveWarehouses, selectWarehouses } from "../../../../store/warehouseslide";
import { getAllUnits, selectUnits } from "../../../../store/unitSlide";
import { getAvailableBins, selectAvailableBins } from "../../../../store/binSlice";

const { Text } = Typography;

interface ReceiveGoodsModalProps {
    open: boolean;
    onClose: () => void;
    request?: InboundRequest;
    onSuccess: () => void;
}

interface BinRow {
    storagePosition: string;
    quantity: number | null;
}

interface ItemRow {
    noteResult: string;
    bins: BinRow[];
}

const ReceiveGoodsModal = ({ open, onClose, request, onSuccess }: ReceiveGoodsModalProps) => {
    const { message } = App.useApp();
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(false);
    const [itemRows, setItemRows] = useState<Record<number, ItemRow>>({});

    const products = useAppSelector(selectProducts);
    const warehouses = useAppSelector(selectWarehouses);
    const units = useAppSelector(selectUnits);
    const availableBins = useAppSelector(selectAvailableBins);

    useEffect(() => {
        if (open) {
            if (products.length === 0) dispatch(getAllProducts());
            if (warehouses.length === 0) dispatch(getActiveWarehouses());
            if (units.length === 0) dispatch(getAllUnits());
            if (request?.warehouseId) dispatch(getAvailableBins(request.warehouseId));
        }
    }, [open, dispatch, products.length, warehouses.length, units.length, request?.warehouseId]);

    // Reset khi đóng modal
    useEffect(() => {
        if (!open) setItemRows({});
    }, [open]);

    const getProduct = (productId: number) => products.find((p) => p.id === productId);
    const getWarehouse = (warehouseId: number) => warehouses.find((w) => w.id === warehouseId);
    const getUnitName = (item: InboundRequestItem) => {
        const unit = units.find((u) => u.id === item.unitId);
        if (unit) return unit.name;
        return getProduct(item.productId)?.baseUnitCode || "";
    };

    const binOptions = availableBins.map((b) => ({ label: b.code, value: b.code }));

    // Lấy hoặc khởi tạo row cho item
    const getItemRow = (itemId: number): ItemRow => {
        return itemRows[itemId] ?? { noteResult: "", bins: [{ storagePosition: "", quantity: null }] };
    };

    const updateItemRow = (itemId: number, updater: (row: ItemRow) => ItemRow) => {
        setItemRows((prev) => ({
            ...prev,
            [itemId]: updater(getItemRow(itemId)),
        }));
    };

    // Thêm bin mới cho item
    const addBinRow = (itemId: number) => {
        updateItemRow(itemId, (row) => ({
            ...row,
            bins: [...row.bins, { storagePosition: "", quantity: null }],
        }));
    };

    // Xóa bin khỏi item
    const removeBinRow = (itemId: number, binIndex: number) => {
        updateItemRow(itemId, (row) => ({
            ...row,
            bins: row.bins.filter((_, i) => i !== binIndex),
        }));
    };

    // Cập nhật bin
    const updateBin = (itemId: number, binIndex: number, field: keyof BinRow, value: any) => {
        updateItemRow(itemId, (row) => ({
            ...row,
            bins: row.bins.map((b, i) => i === binIndex ? { ...b, [field]: value } : b),
        }));
    };

    // Cập nhật note
    const updateNote = (itemId: number, value: string) => {
        updateItemRow(itemId, (row) => ({ ...row, noteResult: value }));
    };

    const handleSubmit = async () => {
        if (!request) return;

        // Validate tất cả items
        for (const item of request.inboundItems) {
            const row = getItemRow(item.id);

            if (row.bins.length === 0) {
                message.warning(`Sản phẩm "${getProduct(item.productId)?.name}" chưa có bin nào`);
                return;
            }

            for (const bin of row.bins) {
                if (!bin.storagePosition) {
                    message.warning(`Vui lòng chọn bin cho tất cả sản phẩm`);
                    return;
                }
                if (bin.quantity === null || bin.quantity === undefined || bin.quantity <= 0) {
                    message.warning(`Vui lòng nhập số lượng > 0 cho tất cả bin`);
                    return;
                }
            }

            // Kiểm tra trùng bin trong cùng 1 item
            const binCodes = row.bins.map((b) => b.storagePosition);
            const hasDuplicate = binCodes.length !== new Set(binCodes).size;
            if (hasDuplicate) {
                message.warning(`Sản phẩm "${getProduct(item.productId)?.name}" có bin bị trùng`);
                return;
            }
        }

        const payload = {
            items: request.inboundItems.map((item) => {
                const row = getItemRow(item.id);

                let finalNote = "";
                if (item.lineNote && row.noteResult) {
                    finalNote = `[YC: ${item.lineNote}] | [KQ: ${row.noteResult}]`;
                } else if (item.lineNote) {
                    finalNote = item.lineNote;
                } else if (row.noteResult) {
                    finalNote = row.noteResult;
                }

                return {
                    inboundItemId: item.id,
                    binQuantities: row.bins.map((b) => ({
                        storagePosition: b.storagePosition,
                        quantity: b.quantity as number,
                    })),
                    lineNote: finalNote || undefined,
                };
            }),
        };

        setLoading(true);
        try {
            await dispatch(receiveGoods({ id: request.id, data: payload })).unwrap();
            message.success(`Nhận hàng đơn ${request.requestNo} thành công!`);
            setItemRows({});
            onSuccess();
            onClose();
        } catch (error: any) {
            message.error(typeof error === "string" ? error : "Có lỗi xảy ra khi nhận hàng");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setItemRows({});
        onClose();
    };

    const columns = [
        {
            title: "Sản phẩm",
            key: "product",
            width: 180,
            render: (_: any, record: InboundRequestItem) => {
                const product = getProduct(record.productId);
                return product ? (
                    <div>
                        <div className="font-medium text-gray-800">{product.name}</div>
                        <div className="text-xs text-gray-400 font-mono">{product.sku}</div>
                    </div>
                ) : (
                    <Tag color="blue" className="font-mono">#{record.productId}</Tag>
                );
            },
        },
        {
            title: "SL đặt",
            key: "quantity",
            width: 90,
            align: "center" as const,
            render: (_: any, record: InboundRequestItem) => (
                <div className="text-center">
                    <Text strong>{record.quantity}</Text>
                    <span className="ml-1 text-xs text-gray-400">{getUnitName(record)}</span>
                </div>
            ),
        },
        {
            title: "Phân bổ vào bin",
            key: "bins",
            render: (_: any, record: InboundRequestItem) => {
                const row = getItemRow(record.id);
                const totalReceived = row.bins.reduce((s, b) => s + (b.quantity ?? 0), 0);
                const isDiff = totalReceived !== record.quantity && totalReceived > 0;

                return (
                    <div className="flex flex-col gap-2">
                        {row.bins.map((bin, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                {/* Bin select */}
                                <Select
                                    value={bin.storagePosition || undefined}
                                    onChange={(val) => updateBin(record.id, idx, "storagePosition", val ?? "")}
                                    placeholder="Chọn bin"
                                    className="w-32"
                                    status={!bin.storagePosition ? "error" : undefined}
                                    options={binOptions}
                                    showSearch
                                    filterOption={(input, option) =>
                                        (option?.value as string)?.toLowerCase().includes(input.toLowerCase())
                                    }
                                />

                                {/* Quantity input */}
                                <InputNumber
                                    min={0}
                                    value={bin.quantity ?? undefined}
                                    onChange={(val) => updateBin(record.id, idx, "quantity", val)}
                                    placeholder="SL"
                                    className="w-20"
                                    status={!bin.quantity ? "error" : undefined}
                                />
                                <span className="text-xs text-gray-400 whitespace-nowrap">
                                    {getUnitName(record)}
                                </span>

                                {/* Xóa bin — chỉ xóa được nếu có > 1 bin */}
                                <Button
                                    type="text"
                                    danger
                                    size="small"
                                    icon={<DeleteOutlined />}
                                    onClick={() => removeBinRow(record.id, idx)}
                                    disabled={row.bins.length === 1}
                                />
                            </div>
                        ))}

                        {/* Thêm bin */}
                        <Button
                            type="dashed"
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={() => addBinRow(record.id)}
                            className="w-fit"
                        >
                            Thêm bin
                        </Button>

                        {/* Tổng + cảnh báo chênh lệch */}
                        <div className="text-xs mt-1">
                            <span className="text-gray-500">Tổng: </span>
                            <span className={`font-bold ${isDiff ? "text-orange-500" : "text-green-600"}`}>
                                {totalReceived}
                            </span>
                            <span className="text-gray-400 ml-1">{getUnitName(record)}</span>
                            {isDiff && (
                                <span className="ml-2 text-orange-500">
                                    (chênh {totalReceived - record.quantity > 0 ? "+" : ""}
                                    {totalReceived - record.quantity})
                                </span>
                            )}
                        </div>
                    </div>
                );
            },
        },
        {
            title: "Yêu cầu từ đơn",
            dataIndex: "lineNote",
            key: "lineNote",
            width: 150,
            render: (note: string) =>
                note
                    ? <span className="text-gray-500 italic text-xs">{note}</span>
                    : <span className="text-gray-300 text-xs">—</span>,
        },
        {
            title: "Kết quả nhận hàng",
            key: "noteResult",
            width: 180,
            render: (_: any, record: InboundRequestItem) => {
                const row = getItemRow(record.id);
                return (
                    <Input
                        value={row.noteResult}
                        onChange={(e) => updateNote(record.id, e.target.value)}
                        placeholder="VD: Đủ hàng / Thiếu 2 cái..."
                    />
                );
            },
        },
    ];

    if (!request) return null;

    const warehouse = getWarehouse(request.warehouseId);

    return (
        <Modal
            title={
                <div className="flex items-center gap-3">
                    <span className="text-blue-700 font-bold text-lg">Nhận hàng thực tế</span>
                    <Tag color="blue" className="font-mono">{request.requestNo}</Tag>
                </div>
            }
            open={open}
            onCancel={handleCancel}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText="Xác nhận nhận hàng"
            cancelText="Hủy"
            width={1000}
            okButtonProps={{ className: "!bg-green-600 hover:!bg-green-500" }}
        >
            <div className="mb-4 grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg text-sm">
                <div>
                    <span className="text-gray-500">Nhà cung cấp:</span>{" "}
                    <strong>{request.supplierName}</strong>
                </div>
                <div>
                    <span className="text-gray-500">Kho nhập:</span>{" "}
                    <strong>
                        {warehouse ? `${warehouse.name} (${warehouse.code})` : `#${request.warehouseId}`}
                    </strong>
                </div>
                {request.note && (
                    <div className="col-span-2">
                        <span className="text-gray-500">Ghi chú đơn:</span> {request.note}
                    </div>
                )}
            </div>

            <Alert
                message="Mỗi sản phẩm có thể phân bổ vào nhiều bin khác nhau. Nhấn '+ Thêm bin' để chia nhỏ."
                type="info"
                showIcon
                className="mb-4"
            />

            <Table
                dataSource={request.inboundItems}
                columns={columns}
                rowKey="id"
                pagination={false}
                bordered
                size="middle"
            />
        </Modal>
    );
};

export default ReceiveGoodsModal;