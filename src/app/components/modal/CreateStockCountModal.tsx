import { Modal, Form, Input, message, Spin, Checkbox, Empty, Button, Tag } from "antd";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store";
import {
    createStockCountSession,
    generateStockCountItems,
    getStockCountSessions,
} from "../../../store/stockCountSlide";
import { getAllBins, selectBins } from "../../../store/binSlice";
import { selectCurrentUser } from "../../../store/userSlide";

interface CreateStockCountModalProps {
    open: boolean;
    onClose: () => void;
}

type Step = "create" | "select-bins";

const CreateStockCountModal = ({ open, onClose }: CreateStockCountModalProps) => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const bins = useAppSelector(selectBins);
    const currentUser = useAppSelector(selectCurrentUser);

    const [step, setStep] = useState<Step>("create");
    const [loading, setLoading] = useState(false);
    const [binsLoading, setBinsLoading] = useState(false);
    const [createdSessionId, setCreatedSessionId] = useState<number | null>(null);
    const [selectedBinIds, setSelectedBinIds] = useState<number[]>([]);

    useEffect(() => {
        if (open) {
            setStep("create");
            setCreatedSessionId(null);
            setSelectedBinIds([]);
            form.resetFields();
        }
    }, [open, form]);

    const handleClose = () => {
        form.resetFields();
        setStep("create");
        setCreatedSessionId(null);
        setSelectedBinIds([]);
        onClose();
    };


    const handleCreate = async () => {
        try {
            const values = await form.validateFields();

            if (!currentUser?.warehouseId) {
                message.error("Tài khoản của bạn chưa được gán kho hàng. Vui lòng liên hệ Admin.");
                return;
            }

            setLoading(true);
            const result = await dispatch(createStockCountSession({ note: values.note })).unwrap();
            setCreatedSessionId(result.id);

            // Load bins sau khi tạo phiên
            setBinsLoading(true);
            await dispatch(getAllBins(undefined));
            setBinsLoading(false);

            setStep("select-bins");
        } catch (error: any) {
            message.error(error || "Có lỗi xảy ra khi tạo phiên kiểm kê");
        } finally {
            setLoading(false);
        }
    };

    // Bước 2: Generate items theo bin đã chọn
    const handleGenerate = async () => {
        if (selectedBinIds.length === 0) {
            message.warning("Vui lòng chọn ít nhất 1 bin để kiểm kê");
            return;
        }
        try {
            setLoading(true);
            await dispatch(generateStockCountItems({
                id: createdSessionId!,
                binIds: selectedBinIds,
            })).unwrap();
            message.success(`Đã khởi tạo kiểm kê cho ${selectedBinIds.length} bin!`);
            dispatch(getStockCountSessions());
            handleClose();
        } catch (error: any) {
            message.error(error || "Có lỗi xảy ra khi khởi tạo danh sách kiểm kê");
        } finally {
            setLoading(false);
        }
    };

    const toggleBin = (binId: number) => {
        setSelectedBinIds((prev) =>
            prev.includes(binId) ? prev.filter((id) => id !== binId) : [...prev, binId]
        );
    };

    const availableBins = bins.filter((b) => b.status === "Available");

    const toggleAll = () => {
        if (selectedBinIds.length === availableBins.length) {
            setSelectedBinIds([]);
        } else {
            setSelectedBinIds(availableBins.map((b) => b.id));
        }
    };

    return (
        <Modal
            title={
                <div className="flex items-center gap-2">
                    <span>Tạo phiên kiểm kê</span>
                    <Tag color={step === "create" ? "blue" : "orange"}>
                        {step === "create" ? "Bước 1: Thông tin" : "Bước 2: Chọn bin"}
                    </Tag>
                </div>
            }
            open={open}
            onCancel={handleClose}
            destroyOnClose
            footer={
                step === "create" ? (
                    <div className="flex justify-end gap-2">
                        <Button onClick={handleClose}>Hủy</Button>
                        <Button type="primary" loading={loading} onClick={handleCreate}>
                            Tiếp theo →
                        </Button>
                    </div>
                ) : (
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-xs">
                            Đã chọn {selectedBinIds.length}/{availableBins.length} bin
                        </span>
                        <div className="flex gap-2">
                            <Button onClick={() => setStep("create")} disabled={loading}>
                                ← Quay lại
                            </Button>
                            <Button
                                type="primary"
                                loading={loading}
                                disabled={selectedBinIds.length === 0}
                                onClick={handleGenerate}
                                className="bg-green-600 hover:bg-green-700 border-none"
                            >
                                Khởi tạo kiểm kê
                            </Button>
                        </div>
                    </div>
                )
            }
            width={560}
        >
            {/* Bước 1 */}
            {step === "create" && (
                <Form form={form} layout="vertical" className="mt-4">
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100 flex flex-col gap-1">
                        <span className="text-blue-500 text-xs font-bold uppercase tracking-wider">
                            Kho hàng kiểm kê
                        </span>
                        <span className="text-gray-800 font-bold text-lg">
                            {currentUser?.warehouseName || "Chưa xác định"}
                        </span>
                        <p className="text-gray-400 text-xs italic mt-1">
                            * Phiên kiểm kê sẽ được tạo cho kho hàng bạn đang quản lý.
                        </p>
                    </div>
                    <Form.Item name="note" label="Ghi chú phiên kiểm kê">
                        <Input.TextArea
                            placeholder="Nhập ghi chú cho phiên kiểm kê này (nếu có)"
                            rows={3}
                        />
                    </Form.Item>
                </Form>
            )}

            {/* Bước 2 */}
            {step === "select-bins" && (
                <div className="mt-4">
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-gray-600 text-sm">Chọn các bin muốn đưa vào phiên kiểm kê:</p>
                        <Button type="link" size="small" onClick={toggleAll}>
                            {selectedBinIds.length === availableBins.length ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                        </Button>
                    </div>

                    {binsLoading ? (
                        <div className="flex justify-center py-10">
                            <Spin tip="Đang tải danh sách bin..." />
                        </div>
                    ) : availableBins.length === 0 ? (
                        <Empty description="Không có bin khả dụng trong kho này" />
                    ) : (
                        <div className="grid grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                            {availableBins.map((bin) => {
                                const isChecked = selectedBinIds.includes(bin.id);
                                return (
                                    <div
                                        key={bin.id}
                                        onClick={() => toggleBin(bin.id)}
                                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-150 ${isChecked
                                                ? "border-blue-400 bg-blue-50"
                                                : "border-gray-200 hover:border-blue-300 hover:bg-gray-50"
                                            }`}
                                    >
                                        <Checkbox checked={isChecked} />
                                        <div className="flex flex-col min-w-0">
                                            <span className="font-mono font-bold text-blue-600 text-sm truncate">
                                                {bin.code}
                                            </span>
                                            {bin.name && (
                                                <span className="text-gray-400 text-xs truncate">{bin.name}</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </Modal>
    );
};

export default CreateStockCountModal;