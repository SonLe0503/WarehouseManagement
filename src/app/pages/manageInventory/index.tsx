import { Tag, Spin, Empty } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store";
import { getAllInventories, selectInventories, selectInventoryLoading } from "../../../store/inventorySlice";
import dayjs from "dayjs";
import Condition from "./Condition";

const ManageInventory = () => {
    const dispatch = useAppDispatch();
    const inventories = useAppSelector(selectInventories);
    const loading = useAppSelector(selectInventoryLoading);

    const [searchSku, setSearchSku] = useState("");
    const [searchProductName, setSearchProductName] = useState("");
    const [searchWarehouse, setSearchWarehouse] = useState("");

    const filteredInventories = useMemo(() => {
        return inventories.filter((item) => {
            const skuMatch = (item.sku || item.product?.sku || "").toLowerCase().includes(searchSku.toLowerCase());
            const nameMatch = (item.productName || item.product?.name || "").toLowerCase().includes(searchProductName.toLowerCase());
            const warehouseMatch = (item.warehouseName || item.warehouse?.name || "").toLowerCase().includes(searchWarehouse.toLowerCase());
            return skuMatch && nameMatch && warehouseMatch;
        });
    }, [inventories, searchSku, searchProductName, searchWarehouse]);

    useEffect(() => {
        dispatch(getAllInventories());
    }, [dispatch]);

    return (
        <div className="p-2 page-fade-in">
            <Condition
                searchSku={searchSku}
                setSearchSku={setSearchSku}
                searchProductName={searchProductName}
                setSearchProductName={setSearchProductName}
                searchWarehouse={searchWarehouse}
                setSearchWarehouse={setSearchWarehouse}
            />

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Quản lý kho bãi & Tồn kho</h2>
                    <p className="text-gray-500 text-sm mt-1">Theo dõi số lượng sản phẩm tồn kho tại các chi nhánh</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="grid grid-cols-6 bg-gray-50/80 font-bold text-xs uppercase tracking-wider text-gray-600 border-b border-gray-200">
                    <div className="px-6 py-4">Mã SKU</div>
                    <div className="px-6 py-4 col-span-2">Sản phẩm</div>
                    <div className="px-6 py-4">Kho hàng</div>
                    <div className="px-6 py-4 text-center">Số lượng tồn</div>
                    <div className="px-6 py-4 text-right">Cập nhật cuối</div>
                </div>

                {loading ? (
                    <div className="p-20 text-center flex flex-col items-center justify-center gap-3">
                        <Spin size="large" />
                        <div className="text-gray-500 ant-fade-in">Đang tải dữ liệu tồn kho...</div>
                    </div>
                ) : filteredInventories.length > 0 ? (
                    filteredInventories.map((item) => (
                        <div
                            key={item.id}
                            className="grid grid-cols-6 text-sm border-b border-gray-100 hover:bg-blue-50/30 transition-all duration-200"
                        >
                            <div className="px-6 py-4 font-mono font-bold text-blue-600">
                                {item.sku || item.product?.sku}
                            </div>
                            <div className="px-6 py-4 col-span-2">
                                <div className="font-semibold text-gray-800">{item.productName || item.product?.name}</div>
                                {item.storagePosition && (
                                    <div className="text-[11px] text-gray-400 mt-0.5 mt-1 border border-gray-200 rounded px-1.5 w-max bg-gray-50">
                                        Vị trí: {item.storagePosition}
                                    </div>
                                )}
                            </div>
                            <div className="px-6 py-4">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                                    {item.warehouseName || item.warehouse?.name}
                                </span>
                            </div>
                            <div className="px-6 py-4 text-center">
                                <Tag color={item.quantity > 10 ? "green" : item.quantity > 0 ? "orange" : "red"} className="rounded-md px-3 py-0.5 font-bold">
                                    {item.quantity}
                                </Tag>
                            </div>
                            <div className="px-6 py-4 text-right text-gray-500 font-medium">
                                {dayjs(item.updatedAt).format("HH:mm DD/MM/YYYY")}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-20 flex flex-col items-center">
                        <Empty description="Không tìm thấy dữ liệu tồn kho" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManageInventory;
