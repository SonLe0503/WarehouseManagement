import { Modal, Table, InputNumber, Input, Tag, Typography, Alert, App } from "antd";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../../store";
import { shipGoods, type IOutboundRequest, type IOutboundItem, type PickedOutboundItemDTO } from "../../../../store/outboundSlice";
import { getAllProducts, selectProducts } from "../../../../store/productSlice";
import { getAllWarehouses, selectWarehouses } from "../../../../store/warehouseslide";
import { getAllInventories, selectInventories } from "../../../../store/inventorySlice";

const { Text } = Typography;

interface ShipGoodsModalProps {
    open: boolean;
    onClose: () => void;
    request?: IOutboundRequest;
    onSuccess: () => void;
}

interface ShipRow {
    outboundItemId: number;
    pickedQuantity: number | null;
    storagePosition: string;
    lineNote: string;
}

const ShipGoodsModal = ({ open, onClose, request, onSuccess }: ShipGoodsModalProps) => {
    const { message } = App.useApp();
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(false);
    const [rows, setRows] = useState<Record<number, ShipRow>>({});

    const products = useAppSelector(selectProducts);
    const warehouses = useAppSelector(selectWarehouses);
    const inventories = useAppSelector(selectInventories);

    useEffect(() => {
        if (open) {
            if (products.length === 0) dispatch(getAllProducts());
            if (warehouses.length === 0) dispatch(getAllWarehouses());
            dispatch(getAllInventories());
        }
    }, [open, dispatch, products.length, warehouses.length]);

    const getProduct = (productId: number) => products.find((p) => p.id === productId);
    const getWarehouse = (warehouseId: number) => warehouses.find((w) => w.id === warehouseId);

    // Lấy các vị trí tồn kho khả dụng cho sản phẩm
    const getAvailablePositions = (productId: number) =>
        inventories.filter(
            (inv) =>
                inv.productId === productId &&
                inv.warehouseId === request?.warehouseId &&
                inv.quantity > 0
        );

    const buildInitialRows = (): Record<number, ShipRow> => {
        if (!request?.outboundItems) return {};
        const initial: Record<number, ShipRow> = {};
        request.outboundItems.forEach((item) => {
            initial[item.id] = {
                outboundItemId: item.id,
                pickedQuantity: null,
                storagePosition: "",
                lineNote: "",
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
                pickedQuantity: value,
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

    const handleNoteChange = (itemId: number, value: string) => {
        setRows((prev) => ({
            ...prev,
            [itemId]: {
                ...(prev[itemId] || buildInitialRows()[itemId]),
                lineNote: value,
            },
        }));
    };

    const handleSubmit = async () => {
        if (!request?.outboundItems) return;

        const mergedRows = { ...buildInitialRows(), ...rows };

        const missing = Object.values(mergedRows).filter(
            (r) => r.pickedQuantity === null || r.pickedQuantity === undefined
        );
        if (missing.length > 0) {
            message.warning("Vui lòng nhập số lượng thực xuất cho tất cả sản phẩm");
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
            items: request.outboundItems.map((item) => {
                const row = mergedRows[item.id];
                return {
                    outboundItemId: item.id,
                    pickedQuantity: row.pickedQuantity as number,
                    storagePosition: row.storagePosition || undefined,
                    lineNote: row.lineNote || undefined,
                } as PickedOutboundItemDTO;
            }),
        };

        setLoading(true);
        try {
            await dispatch(shipGoods({ id: request.id, data: payload })).unwrap();
            message.success(`Xuất hàng cho đơn ${request.requestNo} thành công!`);
            setRows({});
            onSuccess();
            onClose();
        } catch (error: any) {
            message.error(typeof error === "string" ? error : "Có lỗi xảy ra khi xuất hàng");
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
            title: "SL yêu cầu",
            dataIndex: "quantity",
            key: "quantity",
            width: 110,
            align: "center" as const,
            render: (qty: number, record: IOutboundItem) => {
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
            title: "Tồn kho (bin)",
            key: "inventory",
            width: 160,
            render: (_: any, record: IOutboundItem) => {
                const positions = getAvailablePositions(record.productId);
                if (positions.length === 0) {
                    return <span className="text-red-400 text-xs">Không có tồn</span>;
                }
                return (
                    <div className="flex flex-col gap-0.5">
                        {positions.map((inv) => (
                            <span
                                key={inv.id}
                                className="text-xs cursor-pointer text-blue-500 hover:text-blue-700"
                                onClick={() => handlePositionChange(record.id, inv.storagePosition)}
                            >
                                <Tag color="cyan" className="font-mono text-[10px] mr-0">
                                    {inv.storagePosition}
                                </Tag>
                                <span className="text-gray-500 ml-1">({inv.quantity})</span>
                            </span>
                        ))}
                    </div>
                );
            },
        },
        {
            title: "Vị trí xuất",
            key: "storagePosition",
            width: 130,
            render: (_: any, record: IOutboundItem) => {
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
            title: "SL thực xuất",
            key: "pickedQuantity",
            width: 160,
            align: "center" as const,
            render: (_: any, record: IOutboundItem) => {
                const row = currentRows[record.id];
                const picked = row?.pickedQuantity;
                const isDiff = picked !== null && picked !== undefined && picked !== record.quantity;
                const product = getProduct(record.productId);

                return (
                    <div>
                        <div className="flex items-center gap-1">
                            <InputNumber
                                min={0}
                                value={row?.pickedQuantity ?? undefined}
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
                                Chênh {(picked! - record.quantity) > 0 ? "+" : ""}
                                {(picked! - record.quantity).toFixed(2)}
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            title: "Ghi chú",
            key: "lineNote",
            render: (_: any, record: IOutboundItem) => {
                const row = currentRows[record.id];
                return (
                    <Input
                        value={row?.lineNote ?? ""}
                        onChange={(e) => handleNoteChange(record.id, e.target.value)}
                        placeholder="Ghi chú thêm..."
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
            width={1000}
            okButtonProps={{ className: "!bg-purple-600 hover:!bg-purple-500" }}
        >
            <div className="mb-4 grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg text-sm">
                <div><span className="text-gray-500">Khách hàng:</span> <strong>{request.customerName}</strong></div>
                <div><span className="text-gray-500">Kho xuất:</span> <strong>{warehouse ? `${warehouse.name} (${warehouse.code})` : `#${request.warehouseId}`}</strong></div>
                {request.note && (
                    <div className="col-span-2">
                        <span className="text-gray-500">Ghi chú đơn:</span> {request.note}
                    </div>
                )}
            </div>

            <Alert
                message='Chọn vị trí bin từ danh sách tồn kho hoặc nhập thủ công. Nhập số lượng thực xuất vào cột "SL thực xuất".'
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
