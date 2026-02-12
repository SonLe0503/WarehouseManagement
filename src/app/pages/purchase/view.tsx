// pages/purchase/view.tsx
import { Button, Card, Descriptions, Table, Tag, Spin, App } from "antd";
import { LeftOutlined } from "@ant-design/icons";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../store";
import { getInboundRequestById, selectCurrentRequest, selectInboundLoading, clearCurrentRequest } from "../../../store/inboundSlice";
import dayjs from "dayjs";

const ViewInboundRequest = () => {
    const [searchParams] = useSearchParams();
    const id = searchParams.get('id');
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const request = useAppSelector(selectCurrentRequest);
    const loading = useAppSelector(selectInboundLoading);

    useEffect(() => {
        if (id) {
            dispatch(getInboundRequestById(parseInt(id)));
        }
        return () => {
            dispatch(clearCurrentRequest());
        };
    }, [dispatch, id]);

    const getStatusTag = (status: string) => {
        const statusMap: Record<string, { color: string }> = {
            Pending: { color: "gold" },
            Approved: { color: "green" },
            Rejected: { color: "red" },
            Completed: { color: "blue" },
        };
        return <Tag color={statusMap[status]?.color || "default"}>{status}</Tag>;
    };

    const columns = [
        {
            title: "STT",
            key: "index",
            width: 60,
            render: (_: any, __: any, index: number) => index + 1,
        },
        {
            title: "Mã sản phẩm",
            dataIndex: ["product", "sku"],
            key: "sku",
        },
        {
            title: "Tên sản phẩm",
            dataIndex: ["product", "name"],
            key: "name",
        },
        {
            title: "Số lượng",
            dataIndex: "quantity",
            key: "quantity",
        },
        {
            title: "Ghi chú",
            dataIndex: "lineNote",
            key: "lineNote",
            render: (text: string) => text || "—",
        },
    ];

    if (loading) {
        return (
            <div className="p-6 flex justify-center items-center h-96">
                <Spin size="large" tip="Đang tải dữ liệu..." />
            </div>
        );
    }

    if (!request && !loading) {
        return (
            <div className="p-6">
                <Card>
                    <p>Không tìm thấy phiếu nhập hàng</p>
                    <Button onClick={() => navigate(-1)} className="mt-4">Quay lại</Button>
                </Card>
            </div>
        );
    }

    if (!request) {
        return null;
    }

    return (
        <div className="p-6">
            <Button icon={<LeftOutlined />} onClick={() => navigate(-1)} className="mb-4">
                Quay lại
            </Button>

            <Card title={<span className="text-blue-700">CHI TIẾT PHIẾU NHẬP HÀNG</span>}>
                <Descriptions bordered column={2} className="mb-6">
                    <Descriptions.Item label="Mã phiếu">{request.requestNo}</Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">{getStatusTag(request.status)}</Descriptions.Item>
                    <Descriptions.Item label="Nhà cung cấp">{request.supplierName}</Descriptions.Item>
                    <Descriptions.Item label="Ngày tạo">
                        {dayjs(request.createdAt).format("DD/MM/YYYY HH:mm")}
                    </Descriptions.Item>
                    <Descriptions.Item label="Ghi chú" span={2}>
                        {request.note || "—"}
                    </Descriptions.Item>
                </Descriptions>

                <h3 className="text-lg font-semibold mb-3">Danh sách sản phẩm</h3>
                <Table
                    dataSource={request.items || []}
                    columns={columns}
                    rowKey="id"
                    pagination={false}
                    bordered
                />
            </Card>
        </div>
    );
};

export default ViewInboundRequest;