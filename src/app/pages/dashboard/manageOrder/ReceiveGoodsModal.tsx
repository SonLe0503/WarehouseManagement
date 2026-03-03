import { Modal, Table, InputNumber, Input, Tag, Typography, Alert, App } from "antd";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { receiveGoods, type InboundRequest, type InboundRequestItem } from "../../../../store/inboundRequestSlide";
import { getAllProducts, selectProducts } from "../../../../store/productSlice";
import { getActiveWarehouses, selectWarehouses } from "../../../../store/warehouseslide";

const { Text } = Typography;

interface ReceiveGoodsModalProps {
    open: boolean;
    onClose: () => void;
    request?: InboundRequest;
    onSuccess: () => void;
}

interface ReceiveRow {
    inboundItemId: number;
    receivedQuantity: number | null;
    storagePosition: string;
    noteResult: string;
}

const ReceiveGoodsModal = ({ open, onClose, request, onSuccess }: ReceiveGoodsModalProps) => {
    const { message } = App.useApp();
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState<Record<number, ReceiveRow>>({});

    const products = useAppSelector(selectProducts);
    const warehouses = useAppSelector(selectWarehouses);

    useEffect(() => {
        if (open) {
            if (products.length === 0) dispatch(getAllProducts());
            if (warehouses.length === 0) dispatch(getActiveWarehouses());
        }
    }, [open, dispatch, products.length, warehouses.length]);



    const getProduct = (productId: number) => products.find((p) => p.id === productId);
    const getWarehouse = (warehouseId: number) => warehouses.find((w) => w.id === warehouseId);


    const buildInitialRows = (): Record<number, ReceiveRow> => {
        if (!request) return {};
        const initial: Record<number, ReceiveRow> = {};
        request.inboundItems.forEach((item) => {
            initial[item.id] = {
                inboundItemId: item.id,
                receivedQuantity: null,
                storagePosition: "",
                noteResult: "",
            };
        });
        return initial;
    };

    const currentRows = Object.keys(rows).length > 0 ? rows : buildInitialRows();

    const handleQuantityChange = (itemId: number, value: number | null) => {
        setRows((prev) => ({
            ...prev,
            [itemId]: {
                ...(prev[itemId] || buildInitialRows()[itemId]),
                receivedQuantity: value,
            },
        }));
    };

    const handleNoteChange = (itemId: number, value: string) => {
        setRows((prev) => ({
            ...prev,
            [itemId]: {
                ...(prev[itemId] || buildInitialRows()[itemId]),
                noteResult: value,
            },
        }));
    };

    const handlePositionChange = (itemId: number, value: string) => {
        setRows((prev) => ({
            ...prev,
            [itemId]: {
                ...(prev[itemId] || buildInitialRows()[itemId]),
                storagePosition: value,
            },
        }));
    };

    const handleSubmit = async () => {
        if (!request) return;

        const mergedRows = { ...buildInitialRows(), ...rows };

        const missing = Object.values(mergedRows).filter(
            (r) => r.receivedQuantity === null || r.receivedQuantity === undefined
        );
        if (missing.length > 0) {
            message.warning("Vui lòng nhập số lượng thực nhận cho tất cả sản phẩm");
            return;
        }

        const missingPosition = Object.values(mergedRows).filter(
            (r) => !r.storagePosition || r.storagePosition.trim() === ""
        );
        if (missingPosition.length > 0) {
            message.warning("Vui lòng nhập vị trí bin cho tất cả sản phẩm");
            return;
        }

        const payload = {
            items: request.inboundItems.map((item) => {
                const row = mergedRows[item.id];

                let finalNote = "";
                if (item.lineNote && row.noteResult) {
                    finalNote = `[YC: ${item.lineNote}] | [KQ: ${row.noteResult}]`;
                } else if (item.lineNote && !row.noteResult) {
                    finalNote = item.lineNote;
                } else if (!item.lineNote && row.noteResult) {
                    finalNote = row.noteResult;
                }

                return {
                    inboundItemId: item.id,
                    receivedQuantity: row.receivedQuantity as number,
                    storagePosition: row.storagePosition || undefined,
                    lineNote: finalNote || undefined,
                };
            }),
        };

        setLoading(true);
        try {
            await dispatch(receiveGoods({ id: request.id, data: payload })).unwrap();
            message.success(`Nhận hàng đơn ${request.requestNo} thành công!`);
            setRows({});
            onSuccess();
            onClose();
        } catch (error: any) {
            message.error(typeof error === "string" ? error : "Có lỗi xảy ra khi nhận hàng");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setRows({});
        onClose();
    };

    const columns = [
        {
            title: "Sản phẩm",
            dataIndex: "productId",
            key: "productId",
            width: 200,
            render: (productId: number) => {
                const product = getProduct(productId);
                return product ? (
                    <div>
                        <div className="font-medium text-gray-800">{product.name}</div>
                        <div className="text-xs text-gray-400 font-mono">{product.sku}</div>
                    </div>
                ) : (
                    <Tag color="blue" className="font-mono">#{productId}</Tag>
                );
            },
        },
        {
            title: "SL đặt",
            dataIndex: "quantity",
            key: "quantity",
            width: 100,
            align: "center" as const,
            render: (qty: number, record: InboundRequestItem) => {
                const product = getProduct(record.productId);
                return (
                    <div className="text-center">
                        <Text strong className="text-gray-700">{qty}</Text>
                        {product && (
                            <span className="ml-1 text-xs text-gray-400">{product.baseUnitCode}</span>
                        )}
                    </div>
                );
            },
        },
        {
            title: "SL thực nhận",
            key: "receivedQuantity",
            width: 160,
            align: "center" as const,
            render: (_: any, record: InboundRequestItem) => {
                const row = currentRows[record.id];
                const received = row?.receivedQuantity;
                const isDiff = received !== null && received !== undefined && received !== record.quantity;
                const product = getProduct(record.productId);

                return (
                    <div>
                        <div className="flex items-center gap-1">
                            <InputNumber
                                min={0}
                                value={row?.receivedQuantity ?? undefined}
                                onChange={(val) => handleQuantityChange(record.id, val)}
                                className="flex-1"
                                placeholder="Nhập SL"
                                status={isDiff ? "warning" : undefined}
                            />
                            {product && (
                                <span className="text-xs text-gray-400 whitespace-nowrap">{product.baseUnitCode}</span>
                            )}
                        </div>
                        {isDiff && (
                            <div className="text-[10px] text-orange-500 mt-0.5 text-center">
                                Chênh {(received! - record.quantity) > 0 ? "+" : ""}
                                {(received! - record.quantity).toFixed(2)}
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            title: "Vị trí bin",
            key: "storagePosition",
            width: 110,
            render: (_: any, record: InboundRequestItem) => {
                const row = currentRows[record.id];
                return (
                    <Input
                        value={row?.storagePosition ?? ""}
                        onChange={(e) => handlePositionChange(record.id, e.target.value)}
                        placeholder="VD: A1, B2..."
                        status={!row?.storagePosition ? "error" : undefined}
                    />
                );
            },
        },
        {
            title: "Yêu cầu từ đơn",
            dataIndex: "lineNote",
            key: "lineNoteOriginal",
            width: 160,
            render: (note: string) => (
                note
                    ? <span className="text-gray-500 italic text-xs">{note}</span>
                    : <span className="text-gray-300 text-xs">—</span>
            ),
        },
        {
            title: "Kết quả nhận hàng",
            key: "noteResult",
            render: (_: any, record: InboundRequestItem) => {
                const row = currentRows[record.id];
                return (
                    <Input
                        value={row?.noteResult ?? ""}
                        onChange={(e) => handleNoteChange(record.id, e.target.value)}
                        placeholder="VD: Đủ hàng, tốt / Thiếu 2 cái / 3 hộp bị dập..."
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
            width={900}
            okButtonProps={{ className: "!bg-green-600 hover:!bg-green-500" }}
        >
            <div className="mb-4 grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg text-sm">
                <div><span className="text-gray-500">Nhà cung cấp:</span> <strong>{request.supplierName}</strong></div>
                <div><span className="text-gray-500">Kho nhập:</span> <strong>{warehouse ? `${warehouse.name} (${warehouse.code})` : `#${request.warehouseId}`}</strong></div>
                {request.note && (
                    <div className="col-span-2">
                        <span className="text-gray-500">Ghi chú đơn:</span> {request.note}
                    </div>
                )}
            </div>

            <Alert
                message='Nhập kết quả thực tế vào cột "Kết quả nhận hàng".'
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