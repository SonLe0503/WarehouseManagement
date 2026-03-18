// components/modal/ShipTransferModal.tsx
import { Modal, Select, InputNumber, App, Tag, Spin } from "antd";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../store";
import { getStockTransferById, selectCurrentTransfer } from "../../../store/stockTransfer2StepSlice";
import { getAllInventories, selectInventories } from "../../../store/inventorySlice";
import { request } from "../../../utils/request";
import type { RootState } from "../../../store";

interface ShipItem {
    stockTransferItemId: number;
    pickedQuantity: number;
    storagePosition: string;
    lineNote?: string;
}

interface ShipTransferModalProps {
    open: boolean;
    transferId: number | null;
    onClose: () => void;
}

const ShipTransferModal = ({ open, transferId, onClose }: ShipTransferModalProps) => {
    const { message } = App.useApp();
    const dispatch = useAppDispatch();
    const transfer = useAppSelector(selectCurrentTransfer);
    const inventories = useAppSelector(selectInventories);
    const token = useAppSelector((state: RootState) => state.auth.infoLogin?.accessToken);

    const [shipItems, setShipItems] = useState<ShipItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(false);

    useEffect(() => {
        if (open && transferId) {
            setDataLoading(true);
            Promise.all([
                dispatch(getStockTransferById(transferId)),
                dispatch(getAllInventories()),
            ]).finally(() => setDataLoading(false));
        }
    }, [open, transferId, dispatch]);

    useEffect(() => {
        if (transfer?.items) {
            setShipItems(transfer.items.map(item => ({
                stockTransferItemId: item.id,
                pickedQuantity: item.quantity,
                storagePosition: "",
                lineNote: "",
            })));
        }
    }, [transfer]);

    // Bins có hàng cho sản phẩm tại kho nguồn
    const getBinOptions = (productId: number) => {
        return inventories
            .filter(inv =>
                inv.productId === productId &&
                inv.warehouseId === transfer?.fromWarehouseId &&
                inv.quantity > 0
            )
            .map(inv => ({
                value: inv.storagePosition,
                quantity: inv.quantity,
                unitCode: inv.unitCode,
            }));
    };

    // Tồn kho của bin đang chọn
    const getBinStock = (productId: number, storagePosition: string) => {
        return inventories.find(inv =>
            inv.productId === productId &&
            inv.warehouseId === transfer?.fromWarehouseId &&
            inv.storagePosition === storagePosition
        );
    };

    const updateShipItem = (idx: number, field: keyof ShipItem, value: any) => {
        setShipItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
    };

    const handleSubmit = async () => {
        for (const [idx, shipItem] of shipItems.entries()) {
            if (!shipItem.storagePosition) {
                message.error("Vui lòng chọn bin xuất cho tất cả sản phẩm");
                return;
            }
            if (!shipItem.pickedQuantity || shipItem.pickedQuantity <= 0) {
                message.error("Số lượng xuất phải lớn hơn 0");
                return;
            }
            const transferItem = transfer?.items?.[idx];
            if (transferItem) {
                const stock = getBinStock(transferItem.productId, shipItem.storagePosition);
                if (!stock || stock.quantity < shipItem.pickedQuantity) {
                    message.error(
                        `Bin ${shipItem.storagePosition}: tồn kho chỉ còn ${stock?.quantity ?? 0} ${stock?.unitCode ?? ""}, ` +
                        `không đủ để xuất ${shipItem.pickedQuantity}`
                    );
                    return;
                }
            }
        }

        try {
            setLoading(true);
            await request({
                url: `/CrossWarehouseTransfer/${transferId}/ship`,
                method: "POST",
                data: { items: shipItems },
                headers: { Authorization: `Bearer ${token}` },
            });
            message.success("Xuất hàng thành công! Trạng thái: Đang vận chuyển");
            onClose();
        } catch (err: any) {
            const errMsg = err.response?.data || err.message || "Có lỗi xảy ra";
            message.error(typeof errMsg === "string" ? errMsg : "Xuất hàng thất bại");
        } finally {
            setLoading(false);
        }
    };

    if (!transfer) return null;

    return (
        <Modal
            title={`Xuất hàng — ${transfer.transferNo}`}
            open={open}
            onCancel={onClose}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText="Xác nhận xuất hàng"
            cancelText="Hủy"
            width={860}
        >
            {dataLoading ? (
                <div className="py-10 text-center"><Spin /></div>
            ) : (
                <>
                    <p className="mb-4 text-gray-500 text-sm">
                        Kho nguồn: <strong>{transfer.fromWarehouseName}</strong> →
                        Kho đích: <strong>{transfer.toWarehouseName}</strong>
                    </p>

                    <div className="border rounded overflow-hidden">
                        <div className="grid grid-cols-5 bg-gray-100 font-semibold text-sm text-center py-2 px-2">
                            <div className="text-left pl-2">Sản phẩm</div>
                            <div>SL yêu cầu</div>
                            <div>Bin xuất <span className="text-red-500">*</span></div>
                            <div>Tồn bin</div>
                            <div>SL xuất thực</div>
                        </div>

                        {(transfer.items || []).map((item, idx) => {
                            const binOptions = getBinOptions(item.productId);
                            const selectedBin = shipItems[idx]?.storagePosition;
                            const stock = selectedBin ? getBinStock(item.productId, selectedBin) : null;
                            const isInsufficient = !!(stock && shipItems[idx]?.pickedQuantity > stock.quantity);

                            return (
                                <div key={item.id}
                                    className="grid grid-cols-5 items-start text-sm border-t py-3 px-2 gap-2 hover:bg-gray-50">

                                    {/* Sản phẩm */}
                                    <div className="pl-2">
                                        <div className="font-medium">{item.product?.name || `SP #${item.productId}`}</div>
                                        <div className="text-gray-400 text-xs">{item.product?.sku}</div>
                                        <Tag color="blue" className="mt-1 text-xs">
                                            {item.unitCode || item.unitName || "—"}
                                        </Tag>
                                    </div>

                                    {/* SL yêu cầu */}
                                    <div className="text-center font-medium pt-1">{item.quantity}</div>

                                    {/* Dropdown bin — hiện tồn kho từng bin */}
                                    <div>
                                        <Select
                                            placeholder="Chọn bin"
                                            className="w-full"
                                            value={selectedBin || undefined}
                                            onChange={(v) => {
                                                updateShipItem(idx, "storagePosition", v);
                                                // Auto-fill SL = min(yêu cầu, tồn bin)
                                                const s = getBinStock(item.productId, v);
                                                if (s) {
                                                    updateShipItem(idx, "pickedQuantity",
                                                        Math.min(item.quantity, s.quantity));
                                                }
                                            }}
                                            showSearch
                                            notFoundContent={
                                                <span className="text-red-500 text-xs px-2">
                                                    ⚠ Không có bin nào đủ hàng tại kho nguồn
                                                </span>
                                            }
                                            optionLabelProp="label"
                                            options={binOptions.map(opt => ({
                                                value: opt.value,
                                                label: opt.value,
                                                // Option có tag màu xanh/cam hiển thị tồn
                                                customRender: opt,
                                            }))}
                                            optionRender={(opt: any) => {
                                                const o = opt.data.customRender;
                                                const enough = o.quantity >= item.quantity;
                                                return (
                                                    <div className="flex justify-between items-center w-full">
                                                        <span className="font-medium">{o.value}</span>
                                                        <Tag color={enough ? "green" : "orange"} className="text-xs ml-2">
                                                            tồn: {o.quantity} {o.unitCode}
                                                        </Tag>
                                                    </div>
                                                );
                                            }}
                                        />
                                        {binOptions.length === 0 && (
                                            <div className="text-red-500 text-xs mt-1">
                                                ⚠ Không có tồn kho tại kho nguồn
                                            </div>
                                        )}
                                    </div>

                                    {/* Tồn bin đang chọn */}
                                    <div className="text-center pt-1">
                                        {stock ? (
                                            <Tag color={isInsufficient ? "red" : "green"}>
                                                {stock.quantity} {stock.unitCode}
                                            </Tag>
                                        ) : (
                                            <span className="text-gray-300 text-xs">—</span>
                                        )}
                                    </div>

                                    {/* SL xuất thực */}
                                    <div>
                                        <InputNumber
                                            min={0.01}
                                            max={stock?.quantity ?? undefined}
                                            value={shipItems[idx]?.pickedQuantity}
                                            onChange={(v) => updateShipItem(idx, "pickedQuantity", v ?? 0)}
                                            className="w-full"
                                            status={isInsufficient ? "error" : undefined}
                                        />
                                        {isInsufficient && (
                                            <div className="text-red-500 text-xs mt-1">
                                                Vượt tồn kho ({stock?.quantity} {stock?.unitCode})
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
        </Modal>
    );
};

export default ShipTransferModal;