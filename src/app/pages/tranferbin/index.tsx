import { Button, Tag, Tooltip } from "antd";
import { ReloadOutlined, PlusOutlined, EyeOutlined, SwapOutlined } from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import Condition from "./Condition";
import { useAppDispatch, useAppSelector } from "../../../store";
import {
    getAllStockTransfers,
    selectStockTransfers,
    selectStockTransferLoading,
} from "../../../store/stockTransferSlice";
import CreateTransferModal from "../../components/modal/CreateTransferModal";
import TransferDetailModal from "../../components/modal/TransferDetailModal";

const TransferBinPage = () => {
    const dispatch = useAppDispatch();
    const transfers = useAppSelector(selectStockTransfers);
    const loading = useAppSelector(selectStockTransferLoading);

    // Lấy warehouseId từ user đang login
    const currentUser = useAppSelector((state: any) => state.auth.infoLogin?.user);
    const warehouseId: number = currentUser?.warehouseId ?? 1;

    const [searchNo, setSearchNo] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [detailId, setDetailId] = useState<number | null>(null);

    useEffect(() => {
        dispatch(getAllStockTransfers());
    }, [dispatch]);

    const filteredTransfers = useMemo(() => {
        return transfers.filter((t) => {
            const noMatch = t.transferNo?.toLowerCase().includes(searchNo.toLowerCase())
                || t.createdByUsername?.toLowerCase().includes(searchNo.toLowerCase());
            return noMatch;
        });
    }, [transfers, searchNo]);

    return (
        <div className="p-2">
            <Condition searchNo={searchNo} setSearchNo={setSearchNo} />

            <h2 className="text-xl font-bold mb-4">
                <SwapOutlined className="mr-2 text-blue-500" />
                Quản lý chuyển bin nội bộ
            </h2>

            <div className="mb-4 flex justify-end gap-2 items-center">
                <Tooltip title="Làm mới">
                    <Button
                        icon={<ReloadOutlined />}
                        onClick={() => dispatch(getAllStockTransfers())}
                        className="!flex !items-center !justify-center"
                    />
                </Tooltip>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsCreateOpen(true)}
                    className="!flex !items-center !justify-center h-10 px-6 font-semibold shadow-md"
                >
                    Tạo phiếu chuyển
                </Button>
            </div>

            <CreateTransferModal
                open={isCreateOpen}
                onClose={() => setIsCreateOpen(false)}
                warehouseId={warehouseId}
            />

            <TransferDetailModal
                open={detailId !== null}
                transferId={detailId}
                onClose={() => setDetailId(null)}
            />

            <div className="border-[0.05px] border-gray-300">
                <div className="grid grid-cols-6 bg-gray-100 font-semibold text-sm text-center">
                    <div className="px-3 py-2">Mã phiếu</div>
                    <div className="px-3 py-2">Kho</div>
                    <div className="px-3 py-2">Số dòng</div>
                    <div className="px-3 py-2">Trạng thái</div>
                    <div className="px-3 py-2">Người tạo</div>
                    <div className="px-3 py-2">Thao tác</div>
                </div>

                {loading ? (
                    <div className="p-10 text-center">Đang tải dữ liệu...</div>
                ) : filteredTransfers.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">Không có dữ liệu</div>
                ) : (
                    filteredTransfers.map((t) => (
                        <div
                            key={t.id}
                            className="grid grid-cols-6 text-center text-sm border-b-[0.05px] border-gray-300 items-center hover:bg-gray-50 transition-all"
                        >
                            <div className="px-3 py-2 font-medium text-blue-600">{t.transferNo}</div>
                            <div className="px-3 py-2 truncate">{t.fromWarehouseName}</div>
                            <div className="px-3 py-2">
                                <Tag color="blue">{t.stockTransferItems?.length ?? 0} dòng</Tag>
                            </div>
                            <div className="px-3 py-2">
                                <Tag color="success">Hoàn thành</Tag>
                            </div>
                            <div className="px-3 py-2 truncate text-gray-600">
                                <div>{t.createdByUsername}</div>
                                <div className="text-xs text-gray-400">
                                    {t.createdAt ? dayjs(t.createdAt).format("DD/MM/YYYY HH:mm") : "—"}
                                </div>
                            </div>
                            <div className="px-3 py-2 flex gap-2 justify-center">
                                <Tooltip title="Xem chi tiết">
                                    <Button
                                        type="primary"
                                        icon={<EyeOutlined />}
                                        onClick={() => setDetailId(t.id)}
                                        className="!flex !items-center !justify-center !bg-green-500 hover:!bg-green-400"
                                    />
                                </Tooltip>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default TransferBinPage;
