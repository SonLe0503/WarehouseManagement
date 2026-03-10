import { useEffect, useState, useMemo } from "react";
import {
    Modal, Button, Select, InputNumber, Input,
    Tag, Space, Typography, Divider, message,
} from "antd";
import { PlusOutlined, SwapOutlined, DeleteOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../store";
import {
    createStockTransfer, getAllStockTransfers,
    selectStockTransferLoading,
    type StockTransferItemCreateDto,
} from "../../../store/stockTransferSlice";
import { getAllInventories, selectInventories } from "../../../store/inventorySlice";
import { getAllBins, selectBins as selectBinList } from "../../../store/binSlice";
import {
    getUnitConversionsByProduct, clearUnitConversions,
    selectUnitConversions,
} from "../../../store/unitConversionSlice";
import { getAllProducts, selectProducts } from "../../../store/productSlice";

const { Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

interface ItemRow {
    key: string;
    productId?: number;
    unitId?: number;
    quantity?: number;
    fromStoragePosition?: string;
    toStoragePosition?: string;
    lineNote?: string;
}

interface Props {
    open: boolean;
    onClose: () => void;
    warehouseId: number;
}

const CreateTransferModal = ({ open, onClose, warehouseId }: Props) => {
    const dispatch = useAppDispatch();
    const inventories = useAppSelector(selectInventories);
    const bins = useAppSelector(selectBinList);
    const products = useAppSelector(selectProducts);
    const conversions = useAppSelector(selectUnitConversions);
    const loading = useAppSelector(selectStockTransferLoading);

    const [note, setNote] = useState("");
    const [rows, setRows] = useState<ItemRow[]>([{ key: Date.now().toString() }]);
    const [loadedProducts, setLoadedProducts] = useState<Set<number>>(new Set());

    const warehouseInventories = useMemo(
        () => inventories.filter(inv => inv.warehouseId === warehouseId && inv.quantity > 0),
        [inventories, warehouseId]
    );

    const warehouseBins = useMemo(
        () => bins.filter(b => b.warehouseId === warehouseId),
        [bins, warehouseId]
    );

    useEffect(() => {
        if (open) {
            dispatch(getAllInventories());
            dispatch(getAllBins(warehouseId));
            dispatch(getAllProducts());
        }
        return () => {
            dispatch(clearUnitConversions());
            setRows([{ key: Date.now().toString() }]);
            setNote("");
            setLoadedProducts(new Set());
        };
    }, [open]);

    const handleProductChange = (productId: number, key: string) => {
        const product = products.find(p => p.id === productId);
        setRows(prev => prev.map(r =>
            r.key === key
                ? {
                    ...r,
                    productId,
                    unitId: product?.baseUnitId,  // auto-set base unit
                    fromStoragePosition: undefined,
                    toStoragePosition: undefined,
                }
                : r
        ));
        if (!loadedProducts.has(productId)) {
            dispatch(getUnitConversionsByProduct(productId));
            setLoadedProducts(prev => new Set(prev).add(productId));
        }
    };

    const updateRow = (key: string, fields: Partial<ItemRow>) => {
        setRows(prev => prev.map(r => r.key === key ? { ...r, ...fields } : r));
    };

    const addRow = () => setRows(prev => [...prev, { key: Date.now().toString() }]);
    const removeRow = (key: string) => setRows(prev => prev.filter(r => r.key !== key));

    const getUnitsForProduct = (productId: number) => {
        const product = products.find(p => p.id === productId);
        if (!product) return [];
        const base = [{ id: product.baseUnitId, label: `${product.baseUnitCode} (gốc)`, isBase: true }];
        const convs = conversions
            .filter(c => c.productId === productId)
            .map(c => ({ id: c.fromUnitId, label: `(×${c.rate})`, isBase: false }));
        return [...base, ...convs];
    };

    const getBinsWithStock = (productId: number) =>
        warehouseInventories
            .filter(inv => inv.productId === productId)
            .map(inv => ({ bin: inv.storagePosition, qty: inv.quantity }));

    const toBaseQty = (productId: number, unitId: number, qty: number): number => {
        const product = products.find(p => p.id === productId);
        if (!product || unitId === product.baseUnitId) return qty;
        const conv = conversions.find(c => c.productId === productId && c.fromUnitId === unitId);
        return conv ? qty * conv.rate : qty;
    };

    const getStockInBin = (productId: number, bin: string) =>
        warehouseInventories.find(inv => inv.productId === productId && inv.storagePosition === bin)?.quantity ?? 0;

    const handleSubmit = async () => {
        for (const row of rows) {
            if (!row.productId) { message.error("Vui lòng chọn sản phẩm"); return; }
            if (!row.unitId) { message.error("Vui lòng chọn đơn vị"); return; }
            if (!row.quantity || row.quantity <= 0) { message.error("Số lượng phải lớn hơn 0"); return; }
            if (!row.fromStoragePosition) { message.error("Vui lòng chọn bin nguồn"); return; }
            if (!row.toStoragePosition) { message.error("Vui lòng chọn bin đích"); return; }
            if (row.fromStoragePosition === row.toStoragePosition) {
                message.error("Bin nguồn và bin đích không được trùng nhau"); return;
            }
            const baseQty = toBaseQty(row.productId, row.unitId, row.quantity);
            const stock = getStockInBin(row.productId, row.fromStoragePosition);
            if (baseQty > stock) {
                message.error(`Bin ${row.fromStoragePosition}: không đủ tồn (cần ${baseQty}, còn ${stock})`);
                return;
            }
        }

        const items: StockTransferItemCreateDto[] = rows.map(r => ({
            productId: Number(r.productId),
            unitId: Number(r.unitId),
            quantity: Number(r.quantity),
            fromStoragePosition: r.fromStoragePosition!,
            toStoragePosition: r.toStoragePosition!,
            lineNote: r.lineNote ?? undefined,
        }));

        console.log("📦 Payload gửi lên:", JSON.stringify({ warehouseId, note, items }, null, 2));
        const result = await dispatch(createStockTransfer({ warehouseId, note, items }));
        if (createStockTransfer.fulfilled.match(result)) {
            message.success("Tạo phiếu chuyển bin thành công!");
            dispatch(getAllStockTransfers());
            onClose();
        } else {
            const payload = result.payload;
            console.error("❌ createStockTransfer error payload:", payload);
            console.error("❌ errors detail:", JSON.stringify((payload as any)?.errors, null, 2));
            let errMsg = "Có lỗi xảy ra";
            if (typeof payload === "string") errMsg = payload;
            else if (payload && typeof payload === "object") {
                // backend trả về string trực tiếp hoặc object có message
                errMsg = (payload as any).message || (payload as any).title || JSON.stringify(payload);
            }
            message.error(errMsg);
        }
    };

    return (
        <Modal
            open={open}
            onCancel={onClose}
            width={900}
            title={
                <Space>
                    <SwapOutlined className="text-blue-500" />
                    <span className="text-blue-700 font-semibold">TẠO PHIẾU CHUYỂN BIN</span>
                </Space>
            }
            footer={
                <Space>
                    <Button onClick={onClose}>Hủy</Button>
                    <Button type="primary" loading={loading} onClick={handleSubmit} icon={<SwapOutlined />}>
                        Thực hiện chuyển
                    </Button>
                </Space>
            }
        >
            <div className="mb-4">
                <Text type="secondary">Ghi chú phiếu</Text>
                <TextArea
                    rows={2}
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="Lý do chuyển bin, ghi chú..."
                    className="mt-1"
                />
            </div>

            <Divider plain>Danh sách hàng hóa cần chuyển</Divider>

            <div className="space-y-3">
                {rows.map((row, idx) => {
                    const binsWithStock = row.productId ? getBinsWithStock(row.productId) : [];
                    const units = row.productId ? getUnitsForProduct(row.productId) : [];
                    const product = products.find(p => p.id === row.productId);
                    const stockInFrom = row.productId && row.fromStoragePosition
                        ? getStockInBin(row.productId, row.fromStoragePosition) : null;
                    const baseQty = row.productId && row.unitId && row.quantity
                        ? toBaseQty(row.productId, row.unitId, row.quantity) : null;
                    const isInsufficient = stockInFrom !== null && baseQty !== null && baseQty > stockInFrom;

                    return (
                        <div key={row.key} className="bg-gray-50 p-4 rounded border border-dashed border-gray-300">
                            {/* Header dòng */}
                            <div className="flex items-center justify-between mb-3">
                                <Text type="secondary" className="text-xs font-semibold">DÒNG {idx + 1}</Text>
                                {rows.length > 1 && (
                                    <Button size="small" danger type="text"
                                        icon={<DeleteOutlined />}
                                        onClick={() => removeRow(row.key)}
                                    />
                                )}
                            </div>

                            {/* Sản phẩm + Đơn vị + Số lượng */}
                            <div className="flex gap-3 mb-3">
                                <div className="flex-1">
                                    <div className="text-xs text-gray-500 mb-1">Sản phẩm *</div>
                                    <Select
                                        showSearch
                                        className="w-full"
                                        placeholder="Chọn sản phẩm"
                                        value={row.productId}
                                        onChange={(v) => handleProductChange(v, row.key)}
                                        optionFilterProp="label"
                                    >
                                        {products.map(p => (
                                            <Option key={p.id} value={p.id} label={`${p.sku} ${p.name}`}>
                                                <span className="font-bold">[{p.sku}]</span> {p.name}
                                            </Option>
                                        ))}
                                    </Select>
                                </div>
                                <div style={{ width: 150 }}>
                                    <div className="text-xs text-gray-500 mb-1">Đơn vị *</div>
                                    <Select
                                        className="w-full"
                                        placeholder="Đơn vị"
                                        value={row.unitId}
                                        disabled={!row.productId}
                                        onChange={(v) => updateRow(row.key, { unitId: v })}
                                    >
                                        {units.map(u => (
                                            <Option key={`unit-${row.key}-${u.id}`} value={u.id}>{u.label}</Option>
                                        ))}
                                    </Select>
                                </div>
                                <div style={{ width: 150 }}>
                                    <div className="text-xs text-gray-500 mb-1">Số lượng *</div>
                                    <InputNumber
                                        className="w-full"
                                        min={0.001}
                                        value={row.quantity}
                                        status={isInsufficient ? "error" : undefined}
                                        onChange={(v) => updateRow(row.key, { quantity: v ?? undefined })}
                                        placeholder="0"
                                    />
                                    {isInsufficient && (
                                        <div className="text-red-500 text-xs mt-1">
                                            Không đủ tồn (còn {stockInFrom} {product?.baseUnitCode})
                                        </div>
                                    )}
                                    {baseQty !== null && row.unitId !== product?.baseUnitId && !isInsufficient && (
                                        <div className="text-gray-400 text-xs mt-1">
                                            = {baseQty} {product?.baseUnitCode}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Bin nguồn → Bin đích */}
                            <div className="flex gap-3 items-center mb-3">
                                <div className="flex-1">
                                    <div className="text-xs text-gray-500 mb-1">Bin nguồn *</div>
                                    <Select
                                        className="w-full"
                                        placeholder="Chọn bin nguồn"
                                        value={row.fromStoragePosition}
                                        disabled={!row.productId}
                                        onChange={(v) => updateRow(row.key, { fromStoragePosition: v })}
                                    >
                                        {binsWithStock.map(({ bin, qty }) => (
                                            <Option key={`from-${row.key}-${bin}`} value={bin}>
                                                <div className="flex justify-between">
                                                    <span>{bin}</span>
                                                    <Tag color="orange" className="text-xs">tồn: {qty}</Tag>
                                                </div>
                                            </Option>
                                        ))}
                                    </Select>
                                </div>
                                <div className="pt-4">
                                    <ArrowRightOutlined className="text-blue-400 text-lg" />
                                </div>
                                <div className="flex-1">
                                    <div className="text-xs text-gray-500 mb-1">Bin đích *</div>
                                    <Select
                                        className="w-full"
                                        placeholder="Chọn bin đích"
                                        value={row.toStoragePosition}
                                        disabled={!row.productId}
                                        onChange={(v) => updateRow(row.key, { toStoragePosition: v })}
                                    >
                                        {warehouseBins
                                            .filter(b => b.code !== row.fromStoragePosition)
                                            .map(b => (
                                                <Option key={`to-${row.key}-${b.code}`} value={b.code}>
                                                    {b.code}{b.name ? ` (${b.name})` : ""}
                                                </Option>
                                            ))}
                                    </Select>
                                </div>
                            </div>

                            {/* Ghi chú dòng */}
                            <Input
                                size="small"
                                placeholder="Ghi chú dòng hàng (tùy chọn)"
                                value={row.lineNote}
                                onChange={e => updateRow(row.key, { lineNote: e.target.value })}
                            />
                        </div>
                    );
                })}
            </div>

            <Button type="dashed" block icon={<PlusOutlined />} onClick={addRow} className="mt-3">
                Thêm sản phẩm
            </Button>
        </Modal>
    );
};

export default CreateTransferModal;