import { Modal, Table, InputNumber, Input, Button, message, Tag, Space, Typography, Tooltip } from "antd";
import { useEffect, useState, useMemo } from "react";
import { useAppDispatch, useAppSelector } from "../../../store";
import {
    getStockCountItems,
    updateActualQuantity,
    selectStockCountItems,
    selectStockCountLoading,
    approveStockCountSession
} from "../../../store/stockCountSlide";
import { selectInfoLogin } from "../../../store/authSlide";
import { getAllProducts, selectProducts } from "../../../store/productSlice";
import { CheckOutlined, SaveOutlined, AuditOutlined, EditOutlined, CloseOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface StockCountItemModalProps {
    open: boolean;
    onClose: () => void;
    session: any;
}

const StockCountItemModal = ({ open, onClose, session }: StockCountItemModalProps) => {
    const dispatch = useAppDispatch();
    const items = useAppSelector(selectStockCountItems);
    const products = useAppSelector(selectProducts);
    const loading = useAppSelector(selectStockCountLoading);
    const infoLogin = useAppSelector(selectInfoLogin);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editValues, setEditValues] = useState<any>({});

    useEffect(() => {
        if (open && session?.id) {
            dispatch(getStockCountItems(session.id));
            dispatch(getAllProducts());
        }
    }, [open, session?.id, dispatch]);

    const isAllCounted = useMemo(() => {
        return items.length > 0 && items.every(item => item.actualQuantity !== null && item.actualQuantity !== undefined);
    }, [items]);

    const handleUpdateQuantity = async (record: any) => {
        try {
            const payload = {
                actualQuantity: editValues.actualQuantity ?? record.actualQuantity ?? 0,
                note: editValues.note ?? record.note ?? ""
            };
            await dispatch(updateActualQuantity({ id: record.id, data: payload })).unwrap();
            message.success("Cập nhập số lượng thực tế thành công");
            setEditingId(null);
            setEditValues({});
        } catch (error: any) {
            message.error(error || "Có lỗi xảy ra");
        }
    };

    const handleApprove = async () => {
        try {
            await dispatch(approveStockCountSession(session.id)).unwrap();
            message.success("Đã phê duyệt phiên kiểm kê");
            onClose();
        } catch (error: any) {
            message.error(error || "Có lỗi xảy ra");
        }
    };

    const columns = [
        {
            title: "Sản phẩm",
            key: "product",
            render: (_: any, record: any) => {
                const productInfo = record.product || products.find(p => p.id === record.productId);

                return (
                    <div>
                        <Text strong>[{productInfo?.sku || "N/A"}]</Text>
                        <br />
                        <Text type="secondary">{productInfo?.name || `Sản phẩm ID: ${record.productId}`}</Text>
                    </div>
                );
            }
        },
        {
            title: "Vị trí",
            dataIndex: "storagePosition",
            key: "storagePosition",
            render: (val: string) => <Tag color="blue">{val || "N/A"}</Tag>
        },
        {
            title: "SL Hệ thống",
            dataIndex: "systemQuantity",
            key: "systemQuantity",
            align: "center" as const,
            render: (val: number) => <Text strong>{val}</Text>
        },
        {
            title: "SL Thực tế",
            key: "actualQuantity",
            align: "center" as const,
            render: (_: any, record: any) => {
                const isEditing = editingId === record.id;
                if (isEditing) {
                    return (
                        <InputNumber
                            min={0}
                            value={editValues.actualQuantity ?? record.actualQuantity ?? 0}
                            onChange={(val) => setEditValues({ ...editValues, actualQuantity: val })}
                            className="w-20"
                        />
                    );
                }
                return <Text strong className={record.actualQuantity !== undefined && record.actualQuantity !== null ? "text-blue-600" : "text-gray-400"}>
                    {record.actualQuantity ?? "—"}
                </Text>;
            }
        },
        {
            title: "Chênh lệch",
            key: "difference",
            align: "center" as const,
            render: (_: any, record: any) => {
                const diff = record.difference ?? 0;
                if (record.actualQuantity === undefined || record.actualQuantity === null) return "—";
                return (
                    <Tag color={diff === 0 ? "green" : diff > 0 ? "blue" : "red"}>
                        {diff > 0 ? `+${diff}` : diff}
                    </Tag>
                );
            }
        },
        {
            title: "Ghi chú",
            key: "note",
            render: (_: any, record: any) => {
                const isEditing = editingId === record.id;
                if (isEditing) {
                    return (
                        <Input
                            value={editValues.note ?? record.note ?? ""}
                            onChange={(e) => setEditValues({ ...editValues, note: e.target.value })}
                            placeholder="Ghi chú..."
                        />
                    );
                }
                return record.note || "—";
            }
        },
        {
            title: "Thao tác",
            key: "action",
            render: (_: any, record: any) => {
                const isEditing = editingId === record.id;

                // Chỉ STAFF mới được quyền sửa số lượng trong lúc đang kiểm kê
                if (session.status !== "Counting" || infoLogin?.role !== "STAFF") return null;

                if (isEditing) {
                    return (
                        <Space>
                            <Tooltip title="Lưu">
                                <Button
                                    type="primary"
                                    icon={<SaveOutlined />}
                                    onClick={() => handleUpdateQuantity(record)}
                                />
                            </Tooltip>
                            <Tooltip title="Hủy">
                                <Button
                                    icon={<CloseOutlined />}
                                    onClick={() => { setEditingId(null); setEditValues({}); }}
                                />
                            </Tooltip>
                        </Space>
                    );
                }
                return (
                    <Tooltip title="Nhập số lượng thực tế">
                        <Button
                            type="text"
                            icon={<EditOutlined className="text-blue-600" />}
                            onClick={() => {
                                setEditingId(record.id);
                                setEditValues({ actualQuantity: record.actualQuantity, note: record.note });
                            }}
                        />
                    </Tooltip>
                );
            }
        }
    ];

    return (
        <Modal
            title={
                <div className="flex items-center gap-3">
                    <AuditOutlined className="text-blue-600" />
                    <span>Chi tiết kiểm kê: {session?.countNo}</span>
                    <Tag color="orange" className="ml-2 uppercase">{session?.status}</Tag>
                </div>
            }
            open={open}
            onCancel={onClose}
            width={1000}
            footer={[
                <Button key="close" onClick={onClose}>Đóng</Button>,
                session?.status === "Counting" &&
                (infoLogin?.role === "MANAGE" || infoLogin?.role === "ADMIN") &&
                isAllCounted && (
                    <Button
                        key="approve"
                        type="primary"
                        icon={<CheckOutlined />}
                        onClick={handleApprove}
                        className="bg-green-600 hover:bg-green-700 border-none"
                    >
                        Phê duyệt & Chốt tồn kho
                    </Button>
                )
            ]}
        >
            {session?.status === "Counting" && infoLogin?.role === "MANAGE" && !isAllCounted && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm">
                    ⚠️ <b>Lưu ý:</b> Cần chờ nhân viên hoàn thành kiểm đếm tất cả sản phẩm (nhập số lượng thực tế) trước khi có thể phê duyệt.
                </div>
            )}
            <Table
                columns={columns}
                dataSource={items}
                rowKey="id"
                loading={loading}
                pagination={false}
                scroll={{ y: 500 }}
                className="mt-4"
            />
        </Modal>
    );
};

// Need this for the icon

export default StockCountItemModal;
