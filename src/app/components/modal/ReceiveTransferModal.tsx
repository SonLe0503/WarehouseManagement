// app/pages/dashboard/manageOrder/ReceiveTransferModal.tsx
import { Modal, InputNumber, Input, Tag, App, Select, Button, Spin } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store";
import { getStockTransferById, selectCurrentTransfer, type IStockTransferItem } from "../../../store/stockTransfer2StepSlice";
import { getAvailableBins, selectAvailableBins } from "../../../store/binSlice";
import { request as httpRequest } from "../../../utils/request";
import type { RootState } from "../../../store";

interface BinRow {
    storagePosition: string;
    quantity: number | null;
}

interface ItemRow {
    bins: BinRow[];
    lineNote: string;
}

interface ReceiveTransferModalProps {
    open: boolean;
    transferId: number | null;
    onClose: () => void;
    onSuccess: () => void;
}

const ReceiveTransferModal = ({ open, transferId, onClose, onSuccess }: ReceiveTransferModalProps) => {
    const { message } = App.useApp();
    const dispatch = useAppDispatch();
    const transfer = useAppSelector(selectCurrentTransfer);
    const availableBins = useAppSelector(selectAvailableBins);
    const token = useAppSelector((state: RootState) => state.auth.infoLogin?.accessToken);

    const [itemRows, setItemRows] = useState<Record<number, ItemRow>>({});
    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(false);

    useEffect(() => {
        if (open && transferId) {
            setDataLoading(true);
            dispatch(getStockTransferById(transferId)).finally(() => setDataLoading(false));
        }
    }, [open, transferId, dispatch]);

    // Load bins của kho đích khi biết toWarehouseId
    useEffect(() => {
        if (transfer?.toWarehouseId) {
            dispatch(getAvailableBins(transfer.toWarehouseId));
        }
    }, [transfer?.toWarehouseId, dispatch]);

    // Init itemRows khi transfer load xong
    useEffect(() => {
        if (transfer?.items) {
            const rows: Record<number, ItemRow> = {};
            transfer.items.forEach((item: IStockTransferItem) => {
                rows[item.id] = {
                    bins: [{ storagePosition: "", quantity: item.quantity }],
                    lineNote: "",
                };
            });
            setItemRows(rows);
        }
    }, [transfer]);

    const updateBin = (itemId: number, binIdx: number, field: keyof BinRow, value: any) => {
        setItemRows(prev => ({
            ...prev,
            [itemId]: {
                ...prev[itemId],
                bins: prev[itemId].bins.map((b, i) => i === binIdx ? { ...b, [field]: value } : b),
            },
        }));
    };

    const addBin = (itemId: number) => {
        setItemRows(prev => ({
            ...prev,
            [itemId]: {
                ...prev[itemId],
                bins: [...prev[itemId].bins, { storagePosition: "", quantity: null }],
            },
        }));
    };

    const removeBin = (itemId: number, binIdx: number) => {
        setItemRows(prev => ({
            ...prev,
            [itemId]: {
                ...prev[itemId],
                bins: prev[itemId].bins.filter((_, i) => i !== binIdx),
            },
        }));
    };

    const handleSubmit = async () => {
        if (!transfer) return;

        // Validate
        for (const item of transfer.items || []) {
            const row = itemRows[item.id];
            if (!row) continue;
            for (const bin of row.bins) {
                if (!bin.storagePosition) {
                    message.error(`Vui lòng chọn bin cho sản phẩm ${item.product?.name || item.productId}`);
                    return;
                }
                if (!bin.quantity || bin.quantity <= 0) {
                    message.error(`Vui lòng nhập số lượng cho bin`);
                    return;
                }
            }
        }

        const payload = {
            items: (transfer.items || []).map((item: IStockTransferItem) => ({
                stockTransferItemId: item.id,
                lineNote: itemRows[item.id]?.lineNote || "",
                binQuantities: (itemRows[item.id]?.bins || []).map(b => ({
                    storagePosition: b.storagePosition,
                    quantity: b.quantity,
                })),
            })),
        };

        try {
            setLoading(true);
            await httpRequest({
                url: `/CrossWarehouseTransfer/${transferId}/receive`,
                method: "POST",
                data: payload,
                headers: { Authorization: `Bearer ${token}` },
            });
            message.success(`Nhận hàng ${transfer.transferNo} thành công!`);
            onSuccess();
            onClose();
        } catch (err: any) {
            const errMsg = err.response?.data || err.message || "Có lỗi xảy ra";
            message.error(typeof errMsg === "string" ? errMsg : "Nhận hàng thất bại");
        } finally {
            setLoading(false);
        }
    };

    const binOptions = availableBins.map((b: any) => ({
        value: b.code ?? b,
        label: b.code ?? b,
    }));

    return (
        <Modal
            title={
                <div className="flex items-center gap-2">
                    <span>Nhận hàng chuyển kho</span>
                    {transfer && <Tag color="geekblue">{transfer.transferNo}</Tag>}
                </div>
            }
            open={open}
            onCancel={onClose}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText="Xác nhận nhận hàng"
            cancelText="Hủy"
            width={860}
        >
            {dataLoading ? (
                <div className="py-10 text-center"><Spin /></div>
            ) : !transfer ? (
                <div className="py-6 text-center text-gray-400">Không tìm thấy phiếu</div>
            ) : (
                <>
                    <div className="mb-4 text-sm text-gray-500 bg-blue-50 p-3 rounded">
                        <span>Kho nguồn: <strong>{transfer.fromWarehouseName}</strong></span>
                        <span className="mx-3">→</span>
                        <span>Kho đích: <strong>{transfer.toWarehouseName}</strong></span>
                    </div>

                    {(transfer.items || []).map((item) => {
                        const row = itemRows[item.id];
                        if (!row) return null;
                        const totalReceived = row.bins.reduce((s, b) => s + (b.quantity || 0), 0);
                        const isDiff = totalReceived !== item.quantity;

                        return (
                            <div key={item.id} className="mb-4 border rounded p-3 bg-gray-50">
                                {/* Header sản phẩm */}
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                        <span className="font-semibold">{item.product?.name || `SP #${item.productId}`}</span>
                                        <span className="text-gray-400 text-xs ml-2">{item.product?.sku}</span>
                                        <Tag color="blue" className="ml-2 text-xs">{item.unitCode || item.unitName || "—"}</Tag>
                                    </div>
                                    <div className="text-sm">
                                        SL chuyển: <strong>{item.quantity}</strong>
                                        {isDiff && totalReceived > 0 && (
                                            <Tag color="orange" className="ml-2">
                                                Nhận: {totalReceived} ({totalReceived > item.quantity ? "+" : ""}{totalReceived - item.quantity})
                                            </Tag>
                                        )}
                                    </div>
                                </div>

                                {/* Bins */}
                                <div className="space-y-2">
                                    {row.bins.map((bin, binIdx) => (
                                        <div key={binIdx} className="flex gap-2 items-center">
                                            <Select
                                                placeholder="Chọn bin nhập"
                                                className="w-48"
                                                value={bin.storagePosition || undefined}
                                                onChange={(v) => updateBin(item.id, binIdx, "storagePosition", v)}
                                                showSearch
                                                options={binOptions}
                                            />
                                            <InputNumber
                                                placeholder="Số lượng"
                                                min={0.01}
                                                value={bin.quantity ?? undefined}
                                                onChange={(v) => updateBin(item.id, binIdx, "quantity", v)}
                                                className="w-32"
                                            />
                                            <span className="text-gray-400 text-xs">{item.unitCode || item.unitName}</span>
                                            {row.bins.length > 1 && (
                                                <Button size="small" danger type="text"
                                                    icon={<DeleteOutlined />}
                                                    onClick={() => removeBin(item.id, binIdx)} />
                                            )}
                                        </div>
                                    ))}
                                </div>

                                <div className="flex items-center gap-3 mt-2">
                                    <Button size="small" type="dashed" icon={<PlusOutlined />}
                                        onClick={() => addBin(item.id)}>
                                        Thêm bin
                                    </Button>
                                    <Input
                                        placeholder="Ghi chú dòng"
                                        size="small"
                                        className="flex-1"
                                        value={row.lineNote}
                                        onChange={(e) => setItemRows(prev => ({
                                            ...prev,
                                            [item.id]: { ...prev[item.id], lineNote: e.target.value },
                                        }))}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </>
            )}
        </Modal>
    );
};

export default ReceiveTransferModal;