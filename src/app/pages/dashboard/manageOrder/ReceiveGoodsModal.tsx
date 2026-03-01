import { Modal, Table, InputNumber, Input, Tag, Typography, Alert, App } from "antd";
import { useState } from "react";
import { useAppDispatch } from "../../../../store";
import { receiveGoods, type InboundRequest, type InboundRequestItem } from "../../../../store/inboundRequestSlide";

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
    noteResult: string;
}

const ReceiveGoodsModal = ({ open, onClose, request, onSuccess }: ReceiveGoodsModalProps) => {
    const { message } = App.useApp();
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState<Record<number, ReceiveRow>>({});

    const buildInitialRows = (): Record<number, ReceiveRow> => {
        if (!request) return {};
        const initial: Record<number, ReceiveRow> = {};
        request.inboundItems.forEach((item) => {
            initial[item.id] = {
                inboundItemId: item.id,
                receivedQuantity: null,
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

        const payload = {
            items: request.inboundItems.map((item) => {
                const row = mergedRows[item.id];

                // Format LineNote: gộp ghi chú gốc + kết quả nhận hàng
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
            width: 100,
            render: (productId: number) => (
                <Tag color="blue" className="font-mono">#{productId}</Tag>
            ),
        },
        {
            title: "SL đặt",
            dataIndex: "quantity",
            key: "quantity",
            width: 80,
            align: "center" as const,
            render: (qty: number) => (
                <Text strong className="text-gray-700">{qty}</Text>
            ),
        },
        {
            title: "SL thực nhận",
            key: "receivedQuantity",
            width: 150,
            align: "center" as const,
            render: (_: any, record: InboundRequestItem) => {
                const row = currentRows[record.id];
                const received = row?.receivedQuantity;
                const isDiff = received !== null && received !== undefined && received !== record.quantity;

                return (
                    <div>
                        <InputNumber
                            min={0}
                            value={row?.receivedQuantity ?? undefined}
                            onChange={(val) => handleQuantityChange(record.id, val)}
                            className="w-full"
                            placeholder="Nhập SL"
                            status={isDiff ? "warning" : undefined}
                        />
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
                <div><span className="text-gray-500">Kho nhập:</span> <strong>#{request.warehouseId}</strong></div>
                {request.note && (
                    <div className="col-span-2">
                        <span className="text-gray-500">Ghi chú đơn:</span> {request.note}
                    </div>
                )}
            </div>

            <Alert
                message=' Nhập kết quả thực tế vào cột "Kết quả nhận hàng".'
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