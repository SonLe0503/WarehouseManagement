import { Modal, Table, InputNumber, Input, Tag, Alert, App, Select, Button, Tooltip } from "antd";
import { useEffect, useState } from "react";
import { PlusOutlined, DeleteOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../../store";
import {
    shipGoods,
    type IOutboundRequest,
    type IOutboundItem,
} from "../../../../store/outboundSlice";
import { getAllProducts, selectProducts } from "../../../../store/productSlice";
import { getAllWarehouses, selectWarehouses } from "../../../../store/warehouseslide";
import { getAllUnits, selectUnits } from "../../../../store/unitSlide";
import { getAllInventories, selectInventories } from "../../../../store/inventorySlice";
import { getUnitConversionsByProduct, selectUnitConversions, clearUnitConversions } from "../../../../store/unitConversionSlice";

interface ShipGoodsModalProps {
    open: boolean;
    onClose: () => void;
    request?: IOutboundRequest;
    onSuccess: () => void;
}

interface BinRow {
    storagePosition: string;
    unitId: number | null;
    quantity: number | null;
}

interface ItemRow {
    bins: BinRow[];
    lineNote: string;
}

const ShipGoodsModal = ({ open, onClose, request, onSuccess }: ShipGoodsModalProps) => {
    const { message } = App.useApp();
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(false);
    const [itemRows, setItemRows] = useState<Record<number, ItemRow>>({});

    const products = useAppSelector(selectProducts);
    const warehouses = useAppSelector(selectWarehouses);
    const units = useAppSelector(selectUnits);
    const inventories = useAppSelector(selectInventories);
    const conversions = useAppSelector(selectUnitConversions);

    useEffect(() => {
        if (open) {
            if (products.length === 0) dispatch(getAllProducts());
            if (warehouses.length === 0) dispatch(getAllWarehouses());
            if (units.length === 0) dispatch(getAllUnits());
            dispatch(getAllInventories());
        }
    }, [open, dispatch, products.length, warehouses.length, units.length]);

    useEffect(() => {
        if (open && request?.outboundItems) {
            dispatch(clearUnitConversions());
            const productIds = [...new Set(request.outboundItems.map((i) => i.productId))];
            productIds.forEach((pid) => dispatch(getUnitConversionsByProduct(pid)));
        }
    }, [open, request?.outboundItems]);

    useEffect(() => {
        if (!open) {
            setItemRows({});
            dispatch(clearUnitConversions());
        }
    }, [open]);

    const getProduct = (productId: number) => products.find((p) => p.id === productId);
    const getWarehouse = (warehouseId: number) => warehouses.find((w) => w.id === warehouseId);

    const getProductBins = (productId: number) =>
        inventories.filter(
            (inv) =>
                inv.productId === productId &&
                inv.warehouseId === request?.warehouseId &&
                inv.quantity > 0
        );

    const toBaseQty = (productId: number, unitId: number, qty: number): number => {
        const product = getProduct(productId);
        if (!product) return qty;
        if (unitId === product.baseUnitId) return qty;
        const conv = conversions.find((c) => c.productId === productId && c.fromUnitId === unitId);
        return conv ? qty * conv.rate : qty;
    };

    const getItemRow = (itemId: number, defaultUnitId?: number): ItemRow =>
        itemRows[itemId] ?? {
            bins: [{ storagePosition: "", unitId: defaultUnitId ?? null, quantity: null }],
            lineNote: "",
        };

    const updateItemRow = (itemId: number, updater: (row: ItemRow) => ItemRow, defaultUnitId?: number) => {
        setItemRows((prev) => ({ ...prev, [itemId]: updater(getItemRow(itemId, defaultUnitId)) }));
    };

    const addBinRow = (itemId: number, defaultUnitId?: number) => {
        updateItemRow(itemId, (row) => ({
            ...row,
            bins: [...row.bins, { storagePosition: "", unitId: defaultUnitId ?? null, quantity: null }],
        }), defaultUnitId);
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
        updateItemRow(itemId, (row) => ({ ...row, lineNote: value }));
    };

    const getTotalBaseQty = (itemId: number, productId: number) => {
        const row = getItemRow(itemId);
        return row.bins.reduce((sum, b) => {
            if (!b.unitId || !b.quantity) return sum;
            return sum + toBaseQty(productId, b.unitId, b.quantity);
        }, 0);
    };

    const handleSubmit = async () => {
        if (!request?.outboundItems) return;

        for (const item of request.outboundItems) {
            const product = getProduct(item.productId);
            const row = getItemRow(item.id, item.unitId ?? product?.baseUnitId);

            if (row.bins.length === 0) {
                message.warning(`"${product?.name}": chưa có bin nào`);
                return;
            }

            for (const bin of row.bins) {
                if (!bin.storagePosition) {
                    message.warning(`"${product?.name}": vui lòng chọn bin`);
                    return;
                }
                if (!bin.unitId) {
                    message.warning(`"${product?.name}": vui lòng chọn đơn vị`);
                    return;
                }
                if (!bin.quantity || bin.quantity <= 0) {
                    message.warning(`"${product?.name}": số lượng phải > 0`);
                    return;
                }

                const invBin = getProductBins(item.productId).find(
                    (inv) => inv.storagePosition === bin.storagePosition
                );
                const neededBase = toBaseQty(item.productId, bin.unitId, bin.quantity);
                if (invBin && invBin.quantity < neededBase) {
                    message.error(
                        `Bin ${bin.storagePosition} - "${product?.name}": không đủ tồn (cần ${neededBase}, còn ${invBin.quantity} ${invBin.unitCode})`
                    );
                    return;
                }
            }

            const binPositions = row.bins.map((b) => b.storagePosition);
            if (binPositions.length !== new Set(binPositions).size) {
                message.warning(`"${product?.name}": có bin bị trùng`);
                return;
            }
        }

        const payload = {
            items: request.outboundItems.map((item) => {
                const product = getProduct(item.productId);
                const row = getItemRow(item.id, item.unitId ?? product?.baseUnitId);
                return {
                    outboundItemId: item.id,
                    binQuantities: row.bins.map((b) => ({
                        storagePosition: b.storagePosition,
                        unitId: b.unitId as number,
                        quantity: b.quantity as number,
                    })),
                    lineNote: row.lineNote || undefined,
                };
            }),
        };

        setLoading(true);
        try {
            await dispatch(shipGoods({ id: request.id, data: payload })).unwrap();
            message.success(`Xuất hàng đơn ${request.requestNo} thành công!`);
            setItemRows({});
            onSuccess();
            onClose();
        } catch (error: any) {
            message.error(typeof error === "string" ? error : "Có lỗi xảy ra khi xuất hàng");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        setItemRows({});
        dispatch(clearUnitConversions());
        onClose();
    };

    const columns = [
        {
            title: "Sản phẩm",
            key: "product",
            width: 160,
            render: (_: any, record: IOutboundItem) => {
                const product = getProduct(record.productId);
                return product ? (
                    <div>
                        <div className="font-medium text-gray-800">{product.name}</div>
                        <div className="text-xs text-gray-400 font-mono">{product.sku}</div>
                    </div>
                ) : (
                    <Tag>#{record.productId}</Tag>
                );
            },
        },
        {
            title: "SL yêu cầu",
            key: "quantity",
            width: 100,
            align: "center" as const,
            render: (_: any, record: IOutboundItem) => {
                const product = getProduct(record.productId);
                const reqUnit = record.unit
                    ? record.unit.name
                    : units.find((u) => u.id === record.unitId)?.name || product?.baseUnitCode || "";
                return (
                    <div className="text-center">
                        <span className="font-bold text-gray-700">{record.quantity}</span>
                        <span className="ml-1 text-xs text-gray-400">{reqUnit}</span>
                    </div>
                );
            },
        },
        {
            title: "Tồn theo bin",
            key: "stock",
            width: 170,
            render: (_: any, record: IOutboundItem) => {
                const bins = getProductBins(record.productId);
                if (bins.length === 0)
                    return <span className="text-red-400 text-xs">Không có tồn kho</span>;

                return (
                    <div className="flex flex-col gap-1">
                        {bins.map((inv) => (
                            <div
                                key={inv.id}
                                className="flex items-center gap-1 cursor-pointer group"
                                onClick={() => {
                                    const product = getProduct(record.productId);
                                    updateBin(record.id, 0, "storagePosition", inv.storagePosition);
                                    if (product) updateBin(record.id, 0, "unitId", product.baseUnitId);
                                }}
                            >
                                <Tag color="cyan" className="font-mono text-[11px] m-0 group-hover:bg-cyan-200 cursor-pointer">
                                    {inv.storagePosition}
                                </Tag>
                                <span className="text-xs text-gray-600 font-medium">{inv.quantity}</span>
                                <span className="text-xs text-gray-400">{inv.unitCode}</span>
                            </div>
                        ))}
                    </div>
                );
            },
        },
        {
            title: (
                <span>
                    Xuất từ bin{" "}
                    <Tooltip title="Chọn bin → chọn đơn vị → nhập SL. Click vào bin tồn kho để điền nhanh.">
                        <InfoCircleOutlined className="text-gray-400" />
                    </Tooltip>
                </span>
            ),
            key: "bins",
            render: (_: any, record: IOutboundItem) => {
                const product = getProduct(record.productId);
                const defaultUnitId = record.unitId ?? product?.baseUnitId;
                const row = getItemRow(record.id, defaultUnitId);
                const productBins = getProductBins(record.productId);
                const binOptions = productBins.map((inv) => ({
                    label: (
                        <span>
                            <span className="font-mono font-bold">{inv.storagePosition}</span>
                            <span className="text-gray-400 ml-2 text-xs">({inv.quantity} {inv.unitCode})</span>
                        </span>
                    ),
                    value: inv.storagePosition,
                }));
                const totalBaseQty = getTotalBaseQty(record.id, record.productId);

                return (
                    <div className="flex flex-col gap-2">
                        {row.bins.map((bin, idx) => {
                            const invBin = productBins.find((inv) => inv.storagePosition === bin.storagePosition);
                            const baseNeeded = bin.unitId && bin.quantity
                                ? toBaseQty(record.productId, bin.unitId, bin.quantity)
                                : 0;
                            const notEnough = invBin && baseNeeded > invBin.quantity;

                            return (
                                <div key={idx} className="flex flex-col gap-1">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <Select
                                            value={bin.storagePosition || undefined}
                                            onChange={(val) => updateBin(record.id, idx, "storagePosition", val ?? "")}
                                            placeholder="Chọn bin"
                                            className="w-36"
                                            status={!bin.storagePosition ? "error" : notEnough ? "warning" : undefined}
                                            options={binOptions}
                                            showSearch
                                            filterOption={(input, option) =>
                                                (option?.value as string)?.toLowerCase().includes(input.toLowerCase())
                                            }
                                            notFoundContent={<span className="text-gray-400 text-xs">Không có tồn kho</span>}
                                        />

                                        <Select
                                            value={bin.unitId ?? undefined}
                                            onChange={(val) => updateBin(record.id, idx, "unitId", val)}
                                            placeholder="ĐVT"
                                            className="w-28"
                                            status={!bin.unitId ? "error" : undefined}
                                            options={units.map((u) => {
                                                const conv = conversions.find(
                                                    (c) => c.productId === record.productId && c.fromUnitId === u.id
                                                );
                                                const isBase = u.id === product?.baseUnitId;
                                                return {
                                                    label: isBase
                                                        ? `${u.name} (gốc)`
                                                        : conv
                                                            ? `${u.name} (×${conv.rate})`
                                                            : u.name,
                                                    value: u.id,
                                                };
                                            })}
                                            showSearch
                                            filterOption={(input, option) =>
                                                String(option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                                            }
                                        />

                                        <InputNumber
                                            min={0}
                                            value={bin.quantity ?? undefined}
                                            onChange={(val) => updateBin(record.id, idx, "quantity", val)}
                                            placeholder="SL"
                                            className="w-20"
                                            status={!bin.quantity || notEnough ? "error" : undefined}
                                        />

                                        <Button
                                            type="text"
                                            danger
                                            size="small"
                                            icon={<DeleteOutlined />}
                                            onClick={() => removeBinRow(record.id, idx)}
                                            disabled={row.bins.length === 1}
                                        />
                                    </div>

                                    {bin.unitId && bin.quantity && bin.storagePosition && (
                                        <div className="text-[11px] flex gap-2 ml-1">
                                            {bin.unitId !== product?.baseUnitId && (
                                                <span className="text-blue-500">
                                                    = {baseNeeded} {product?.baseUnitCode}
                                                </span>
                                            )}
                                            {notEnough && (
                                                <span className="text-red-500 font-medium">
                                                    ⚠ Không đủ tồn (còn {invBin?.quantity} {invBin?.unitCode})
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                        <Button
                            type="dashed"
                            size="small"
                            icon={<PlusOutlined />}
                            onClick={() => addBinRow(record.id, defaultUnitId)}
                            className="w-fit"
                        >
                            Thêm bin
                        </Button>

                        <div className="text-xs mt-0.5">
                            <span className="text-gray-500">Tổng xuất: </span>
                            <span className={`font-bold ${totalBaseQty > 0 ? "text-purple-600" : "text-gray-400"}`}>
                                {totalBaseQty}
                            </span>
                            <span className="text-gray-400 ml-1">{product?.baseUnitCode}</span>
                        </div>
                    </div>
                );
            },
        },
        {
            title: "Ghi chú",
            key: "lineNote",
            width: 150,
            render: (_: any, record: IOutboundItem) => {
                const row = getItemRow(record.id);
                return (
                    <Input
                        value={row.lineNote}
                        onChange={(e) => updateNote(record.id, e.target.value)}
                        placeholder="Ghi chú..."
                    />
                );
            },
        },
    ];

    if (!request) return null;
    const warehouse = getWarehouse(request.warehouseId!);

    return (
        <Modal
            title={
                <div className="flex items-center gap-3">
                    <span className="text-purple-700 font-bold text-lg">Xuất hàng thực tế</span>
                    <Tag color="purple" className="font-mono">{request.requestNo}</Tag>
                </div>
            }
            open={open}
            onCancel={handleCancel}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText="Xác nhận xuất hàng"
            cancelText="Hủy"
            width={1100}
            okButtonProps={{ className: "!bg-purple-600 hover:!bg-purple-500" }}
        >
            <div className="mb-4 grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg text-sm">
                <div>
                    <span className="text-gray-500">Khách hàng:</span>{" "}
                    <strong>{request.customerName}</strong>
                </div>
                <div>
                    <span className="text-gray-500">Kho xuất:</span>{" "}
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
                message="Click vào bin trong cột 'Tồn theo bin' để điền nhanh. Chọn đơn vị khác base unit sẽ tự quy đổi."
                type="info"
                showIcon
                className="mb-4"
            />

            <Table
                dataSource={request.outboundItems || []}
                columns={columns}
                rowKey="id"
                pagination={false}
                bordered
                size="middle"
            />
        </Modal>
    );
};

export default ShipGoodsModal;