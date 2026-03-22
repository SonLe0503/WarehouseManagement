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

            const skuMatch = (item.sku || "")
                .toLowerCase().includes(searchSku.toLowerCase());
            const nameMatch = (item.productName || "")
                .toLowerCase().includes(searchProductName.toLowerCase());
            const warehouseMatch = (item.warehouseName || "")
                .toLowerCase().includes(searchWarehouse.toLowerCase());

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

                <div className="grid grid-cols-8 bg-gray-50/80 font-bold text-xs uppercase tracking-wider text-gray-600 border-b border-gray-200">

                    <div className="px-6 py-4">Mã SKU</div>
                    <div className="px-6 py-4 col-span-2">Sản phẩm</div>
                    <div className="px-6 py-4">Vị trí</div>
                    <div className="px-6 py-4">Kho hàng</div>
                    <div className="px-6 py-4 text-center">Số lượng tồn</div>

                    <div className="px-6 py-4 text-center">Đơn vị</div>

                    <div className="px-6 py-4 text-right">Cập nhật cuối</div>
                </div >

                {
                    loading ? (
                        <div className="p-20 text-center flex flex-col items-center justify-center gap-3" >
                            <Spin size="large" />
                            <div className="text-gray-500 ant-fade-in">Đang tải dữ liệu tồn kho...</div>
                        </div>
                    ) : filteredInventories.length > 0 ? (
                        filteredInventories.map((item) => (
                            <div
                                key={item.id}

                                className="grid grid-cols-8 text-sm border-b border-gray-100 hover:bg-blue-50/30 transition-all duration-200"

                            >
                                <div className="px-6 py-4 font-mono font-bold text-blue-600">
                                    {item.sku}
                                </div>
                                <div className="px-6 py-4 col-span-2">
                                    <div className="font-semibold text-gray-800">{item.productName}</div>
                                </div>
                                <div className="px-6 py-4">
                                    {item.storagePosition ? (
                                        <Tag color="cyan" className="font-medium mr-0">
                                            {item.storagePosition}
                                        </Tag>
                                    ) : (
                                        <span className="text-gray-300">—</span>
                                    )}
                                </div>
                                <div className="px-6 py-4">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                                        {item.warehouseName}
                                    </span>
                                </div>
                                <div className="px-6 py-4 text-center">
                                    <Tag color={item.quantity > 10 ? "green" : item.quantity > 0 ? "orange" : "red"} className="rounded-md px-3 py-0.5 font-bold">
                                        {item.quantity}
                                    </Tag>
                                </div>

                                <div className="px-6 py-4 text-center">
                                    {item.unitCode ? (
                                        <Tag color="purple" className="font-medium mr-0">
                                            {item.unitCode}
                                        </Tag>
                                    ) : (
                                        <span className="text-gray-300">—</span>
                                    )}
                                </div>

                                <div className="px-6 py-4 text-right text-gray-500 font-medium">
                                    {dayjs(item.updatedAt).format("HH:mm DD/MM/YYYY")}
                                </div>
                            </div >
                        ))
                    ) : (
                        <div className="p-20 flex flex-col items-center">
                            <Empty description="Không tìm thấy dữ liệu tồn kho" />
                        </div>
                    )}
            </div >
        </div >
    );
};

export default ManageInventory;
