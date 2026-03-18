import { Modal, Table, InputNumber, Input, Tag, Typography, Alert, App, Select, Button } from "antd";
import { useEffect, useState } from "react";
import { PlusOutlined, DeleteOutlined, WarningOutlined } from "@ant-design/icons";
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
    totalReceivedQuantity: number | null; // SL thực nhận từ NCC
    noteResult: string;
    bins: BinRow[];
}

const ReceiveGoodsModal = ({ open, onClose, request, onSuccess }: ReceiveGoodsModalProps) => {
    const { message, modal } = App.useApp();
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

    const getItemRow = (itemId: number): ItemRow =>
        itemRows[itemId] ?? {
            totalReceivedQuantity: null,
            noteResult: "",
            bins: [{ storagePosition: "", quantity: null }],
        };

    const updateItemRow = (itemId: number, updater: (row: ItemRow) => ItemRow) => {
        setItemRows((prev) => ({ ...prev, [itemId]: updater(getItemRow(itemId)) }));
    };

    const addBinRow = (itemId: number) => {
        updateItemRow(itemId, (row) => ({
            ...row,
            bins: [...row.bins, { storagePosition: "", quantity: null }],
        }));
    };

    const removeBinRow = (itemId: number, binIndex: number) => {
        updateItemRow(itemId, (row) => ({
            ...row,
            bins: row.bins.filter((_, i) => i !== binIndex),
        }));
    };

    const updateBin = (itemId: number, binIndex: number, field: keyof BinRow, value: any) => {
        updateItemRow(itemId, (row) => ({
            ...row,
            bins: row.bins.map((b, i) => (i === binIndex ? { ...b, [field]: value } : b)),
        }));
    };

    const updateNote = (itemId: number, value: string) => {
        updateItemRow(itemId, (row) => ({ ...row, noteResult: value }));
    };

    const updateTotalReceived = (itemId: number, value: number | null) => {
        updateItemRow(itemId, (row) => ({ ...row, totalReceivedQuantity: value }));
    };

    // Tính tổng SL đã chia vào bins
    const getTotalBins = (itemId: number) => {
        const row = getItemRow(itemId);
        return row.bins.reduce((s, b) => s + (b.quantity ?? 0), 0);
    };

    const doSubmit = async () => {
        if (!request) return;

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
                    totalReceivedQuantity: row.totalReceivedQuantity as number,
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

    const handleSubmit = async () => {
        if (!request) return;

        // Validate cơ bản
        for (const item of request.inboundItems) {
            const row = getItemRow(item.id);

            if (row.totalReceivedQuantity === null || row.totalReceivedQuantity <= 0) {
                message.warning(`Vui lòng nhập SL thực nhận cho "${getProduct(item.productId)?.name}"`);
                return;
            }

            if (row.bins.length === 0) {
                message.warning(`Sản phẩm "${getProduct(item.productId)?.name}" chưa có bin nào`);
                return;
            }

            for (const bin of row.bins) {
                if (!bin.storagePosition) {
                    message.warning("Vui lòng chọn bin cho tất cả dòng");
                    return;
                }
                if (!bin.quantity || bin.quantity <= 0) {
                    message.warning("Vui lòng nhập số lượng > 0 cho tất cả bin");
                    return;
                }
            }

            const binCodes = row.bins.map((b) => b.storagePosition);
            if (binCodes.length !== new Set(binCodes).size) {
                message.warning(`Sản phẩm "${getProduct(item.productId)?.name}" có bin bị trùng`);
                return;
            }

            const totalBins = getTotalBins(item.id);
            if (totalBins !== row.totalReceivedQuantity) {
                message.warning(
                    `Sản phẩm "${getProduct(item.productId)?.name}": Tổng SL bins (${totalBins}) phải bằng SL thực nhận (${row.totalReceivedQuantity})`
                );
                return;
            }
        }

        // Kiểm tra có item nào chênh lệch so với SL đặt không → hỏi xác nhận
        const diffItems = request.inboundItems.filter((item) => {
            const row = getItemRow(item.id);
            return row.totalReceivedQuantity !== null && row.totalReceivedQuantity !== item.quantity;
        });

        if (diffItems.length > 0) {
            const diffText = diffItems
                .map((item) => {
                    const row = getItemRow(item.id);
                    const diff = (row.totalReceivedQuantity ?? 0) - item.quantity;
                    return `• ${getProduct(item.productId)?.name}: đặt ${item.quantity}, nhận ${row.totalReceivedQuantity} (${diff > 0 ? "+" : ""}${diff})`;
                })
                .join("\n");

            modal.confirm({
                title: "Có chênh lệch số lượng",
                icon: <WarningOutlined className="text-orange-500" />,
                content: (
                    <div>
                        <p className="text-gray-600 mb-2">Các sản phẩm sau có SL thực nhận khác SL đặt:</p>
                        <pre className="bg-orange-50 border border-orange-200 rounded p-2 text-sm text-orange-700 whitespace-pre-wrap">
                            {diffText}
                        </pre>
                        <p className="mt-2 text-gray-500 text-sm">Bạn có chắc muốn xác nhận nhận hàng không?</p>
                    </div>
                ),
                okText: "Xác nhận dù chênh lệch",
                okButtonProps: { danger: true },
                cancelText: "Kiểm tra lại",
                onOk: doSubmit,
            });
        } else {
            doSubmit();
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
            width: 170,
            render: (_: any, record: InboundRequestItem) => {
                const product = getProduct(record.productId);
                return product ? (
                    <div>
                        <div className="font-medium text-gray-800">{product.name}</div>
                        <div className="text-xs text-gray-400 font-mono">{product.sku}</div>
                    </div>
                ) : (
                    <Tag color="blue">#{record.productId}</Tag>
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
            title: "SL thực nhận",
            key: "totalReceived",
            width: 140,
            align: "center" as const,
            render: (_: any, record: InboundRequestItem) => {
                const row = getItemRow(record.id);
                const val = row.totalReceivedQuantity;
                const isDiff = val !== null && val !== record.quantity;

                return (
                    <div>
                        <div className="flex items-center gap-1 justify-center">
                            <InputNumber
                                min={0}
                                value={val ?? undefined}
                                onChange={(v) => updateTotalReceived(record.id, v)}
                                placeholder="Nhập SL"
                                className="w-20"
                                status={val === null ? "error" : isDiff ? "warning" : undefined}
                            />
                            <span className="text-xs text-gray-400">{getUnitName(record)}</span>
                        </div>
                        {isDiff && val !== null && (
                            <div className="text-[10px] text-orange-500 mt-1 text-center flex items-center justify-center gap-1">
                                <WarningOutlined />
                                chênh {val - record.quantity > 0 ? "+" : ""}{val - record.quantity}

                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            title: "Phân bổ vào bin",
            key: "bins",
            render: (_: any, record: InboundRequestItem) => {
                const row = getItemRow(record.id);
                const totalBins = getTotalBins(record.id);
                const totalReceived = row.totalReceivedQuantity ?? 0;
                const binsDiff = totalReceived > 0 && totalBins !== totalReceived;

                return (
                    <div className="flex flex-col gap-2">
                        {row.bins.map((bin, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <Select
                                    value={bin.storagePosition || undefined}
                                    onChange={(val) => updateBin(record.id, idx, "storagePosition", val ?? "")}
                                    placeholder="Chọn bin"
                                    className="w-28"
                                    status={!bin.storagePosition ? "error" : undefined}
                                    options={binOptions}
                                    showSearch
                                    filterOption={(input, option) =>
                                        (option?.value as string)?.toLowerCase().includes(input.toLowerCase())
                                    }
                                />
                                <InputNumber
                                    min={0}
                                    value={bin.quantity ?? undefined}
                                    onChange={(val) => updateBin(record.id, idx, "quantity", val)}
                                    placeholder="SL"
                                    className="w-20"
                                    status={!bin.quantity ? "error" : undefined}
                                />
                                <span className="text-xs text-gray-400">{getUnitName(record)}</span>
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

                        <Button
                            type="dashed"
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={() => addBinRow(record.id)}
                            className="w-fit"
                        >
                            Thêm bin
                        </Button>

                        {/* Tổng bins vs SL thực nhận */}
                        <div className="text-xs">
                            <span className="text-gray-500">Tổng bins: </span>
                            <span className={`font-bold ${binsDiff ? "text-red-500" : "text-green-600"}`}>
                                {totalBins}
                            </span>
                            {totalReceived > 0 && (
                                <span className="text-gray-400"> / {totalReceived}</span>
                            )}
                            {binsDiff && (
                                <span className="ml-1 text-red-500 font-medium">
                                    (còn thiếu {totalReceived - totalBins})
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
            width: 140,
            render: (note: string) =>
                note
                    ? <span className="text-gray-500 italic text-xs">{note}</span>
                    : <span className="text-gray-300 text-xs">—</span>,
        },
        {
            title: "Kết quả nhận hàng",
            key: "noteResult",
            width: 170,
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
            width={1100}
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
                message="Nhập SL thực nhận từ NCC → phân bổ vào bin. Tổng SL các bin phải bằng SL thực nhận."
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