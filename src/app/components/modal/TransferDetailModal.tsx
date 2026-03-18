import { useEffect } from "react";
import { Modal, Button, Tag, Table, Descriptions, Spin, Space, Typography, Divider } from "antd";
import { SwapOutlined, ArrowRightOutlined } from "@ant-design/icons";
import { useAppDispatch, useAppSelector } from "../../../store";
import {
    getStockTransferById, clearCurrentTransfer,
    selectCurrentTransfer, selectStockTransferLoading,
} from "../../../store/stockTransferSlice";

const { Text } = Typography;

interface Props {
    open: boolean;
    transferId: number | null;
    onClose: () => void;
}

const TransferDetailModal = ({ open, transferId, onClose }: Props) => {
    const dispatch = useAppDispatch();
    const transfer = useAppSelector(selectCurrentTransfer);
    const loading = useAppSelector(selectStockTransferLoading);

    useEffect(() => {
        if (open && transferId) {
            dispatch(getStockTransferById(transferId));
        }
        return () => { dispatch(clearCurrentTransfer()); };
    }, [open, transferId]);

    const columns = [
        {
            title: "STT",
            key: "idx",
            width: 50,
            render: (_: any, __: any, index: number) => index + 1,
        },
        {
            title: "Sản phẩm",
            key: "product",
            render: (_: any, row: any) => (
                <div>
                    <div className="font-medium">{row.productName}</div>
                    <Text type="secondary" className="text-xs">{row.productSku}</Text>
                </div>
            ),
        },
        {
            title: "Bin nguồn",
            dataIndex: "fromStoragePosition",
            render: (v: string) => <Tag color="orange">{v}</Tag>,
        },
        {
            title: "",
            width: 30,
            render: () => <ArrowRightOutlined className="text-gray-400" />,
        },
        {
            title: "Bin đích",
            dataIndex: "toStoragePosition",
            render: (v: string) => <Tag color="blue">{v}</Tag>,
        },
        {
            title: "Số lượng",
            key: "qty",
            render: (_: any, row: any) => `${row.quantity} ${row.unitCode || ""}`,
        },
        {
            title: "Ghi chú",
            dataIndex: "lineNote",
            render: (v: string) => v || "—",
        },
    ];

    return (
        <Modal
            open={open}
            onCancel={onClose}
            width={750}
            title={
                <Space>
                    <SwapOutlined />
                    <span className="text-blue-700 font-semibold">CHI TIẾT PHIẾU CHUYỂN BIN</span>
                </Space>
            }
            footer={<Button onClick={onClose}>Đóng</Button>}
        >
            {loading || !transfer ? (
                <div className="flex justify-center items-center h-40">
                    <Spin size="large" tip="Đang tải..." />
                </div>
            ) : (
                <>
                    <Descriptions bordered column={2} className="mb-4">
                        <Descriptions.Item label="Mã phiếu">
                            <Text strong className="text-blue-600">{transfer.transferNo}</Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                            <Tag color="success">Hoàn thành</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Kho">
                            {transfer.fromWarehouseName}
                        </Descriptions.Item>
                        <Descriptions.Item label="Người tạo">
                            {transfer.createdByUsername}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày tạo" span={2}>
                            {transfer.createdAt
                                ? new Date(transfer.createdAt).toLocaleString("vi-VN")
                                : "—"}
                        </Descriptions.Item>
                        {transfer.note && (
                            <Descriptions.Item label="Ghi chú" span={2}>
                                {transfer.note}
                            </Descriptions.Item>
                        )}
                    </Descriptions>

                    <Divider plain>Danh sách hàng hóa</Divider>

                    <Table
                        size="small"
                        dataSource={transfer.stockTransferItems}
                        rowKey="id"
                        pagination={false}
                        bordered
                        columns={columns}
                    />
                </>
            )}
        </Modal>
    );
};

export default TransferDetailModal;