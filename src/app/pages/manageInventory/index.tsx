import { Tag, Spin, Empty, Button } from "antd";
import { useEffect, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../../store";
import { getAllInventories, selectInventories, selectInventoryLoading } from "../../../store/inventorySlice";
import dayjs from "dayjs";
import Condition from "./Condition";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { InboxOutlined } from "@ant-design/icons";
import URL from "../../../constants/url";

const ManageInventory = () => {
    const dispatch = useAppDispatch();
    const inventories = useAppSelector(selectInventories);
    const loading = useAppSelector(selectInventoryLoading);
    const navigate = useNavigate();

    const [searchSku, setSearchSku] = useState("");
    const [searchProductName, setSearchProductName] = useState("");
    const [searchBin, setSearchBin] = useState("");

    const groupedInventories = useMemo(() => {
        const filtered = inventories.filter((item) => {
            const skuMatch = item.sku.toLowerCase().includes(searchSku.toLowerCase());
            const nameMatch = item.productName.toLowerCase().includes(searchProductName.toLowerCase());
            const binMatch = (item.storagePosition || "").toLowerCase().includes(searchBin.toLowerCase());
            return skuMatch && nameMatch && binMatch;
        });

        const groupMap = new Map<
            string,
            {
                key: string;
                sku: string;
                productName: string;
                warehouseName: string;
                totalQuantity: number;
                binCount: number;
                unitCode: string;
                latestUpdatedAt: string;
            }
        >();

        for (const item of filtered) {
            const key = `${item.productId}-${item.warehouseId}`;
            if (!groupMap.has(key)) {
                groupMap.set(key, {
                    key,
                    sku: item.sku,
                    productName: item.productName,
                    warehouseName: item.warehouseName,
                    totalQuantity: 0,
                    binCount: 0,
                    unitCode: item.unitCode,
                    latestUpdatedAt: item.updatedAt,
                });
            }
            const group = groupMap.get(key)!;
            group.totalQuantity += item.quantity;
            group.binCount += 1;
            if (item.updatedAt > group.latestUpdatedAt) {
                group.latestUpdatedAt = item.updatedAt;
            }
        }

        return Array.from(groupMap.values());
    }, [inventories, searchSku, searchProductName, searchBin]);

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
                searchBin={searchBin}
                setSearchBin={setSearchBin}
            />

            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Quản lý kho bãi & Tồn kho</h2>
                    <p className="text-gray-500 text-sm mt-1">Theo dõi số lượng sản phẩm tồn kho tại các chi nhánh</p>
                </div>
                <Button
                    icon={<InboxOutlined />}
                    onClick={() => navigate(URL.ManageBin)}
                    className="flex items-center gap-1"
                >
                    Quản lý vị trí bin
                </Button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">

                {/* Header */}
                <div className="grid grid-cols-7 bg-gray-50/80 font-bold text-xs uppercase tracking-wider text-gray-600 border-b border-gray-200">
                    <div className="px-6 py-4">Mã SKU</div>
                    <div className="px-6 py-4 col-span-2">Sản phẩm</div>
                    <div className="px-6 py-4">Kho hàng</div>
                    <div className="px-6 py-4 text-center">Tổng tồn</div>
                    <div className="px-6 py-4 text-center">Đơn vị</div>
                    <div className="px-6 py-4 text-right">Cập nhật cuối</div>
                </div>

                {loading ? (
                    <div className="p-20 text-center flex flex-col items-center justify-center gap-3">
                        <Spin size="large" />
                        <div className="text-gray-500 ant-fade-in">Đang tải dữ liệu tồn kho...</div>
                    </div>
                ) : groupedInventories.length > 0 ? (
                    groupedInventories.map((group) => (
                        <div
                            key={group.key}
                            className="grid grid-cols-7 text-sm border-b border-gray-100 hover:bg-blue-50/20 transition-all duration-200"
                        >
                            <div className="px-6 py-4 font-mono font-bold text-blue-600">
                                {group.sku}
                            </div>
                            <div className="px-6 py-4 col-span-2">
                                <div className="font-semibold text-gray-800">{group.productName}</div>
                                {group.binCount > 1 && (
                                    <div className="text-xs text-gray-400 mt-0.5">
                                        {group.binCount} vị trí lưu kho
                                    </div>
                                )}
                            </div>
                            <div className="px-6 py-4">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                                    {group.warehouseName}
                                </span>
                            </div>
                            <div className="px-6 py-4 text-center">
                                <Tag
                                    color={
                                        group.totalQuantity > 10
                                            ? "green"
                                            : group.totalQuantity > 0
                                                ? "orange"
                                                : "red"
                                    }
                                    className="rounded-md px-3 py-0.5 font-bold"
                                >
                                    {group.totalQuantity}
                                </Tag>
                            </div>
                            <div className="px-6 py-4 text-center">
                                {group.unitCode ? (
                                    <Tag color="purple" className="font-medium mr-0">
                                        {group.unitCode}
                                    </Tag>
                                ) : (
                                    <span className="text-gray-300">—</span>
                                )}
                            </div>
                            <div className="px-6 py-4 text-right text-gray-500 font-medium">
                                {dayjs(group.latestUpdatedAt).format("HH:mm DD/MM/YYYY")}
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