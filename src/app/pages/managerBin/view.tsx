import { Card, Descriptions, Table, Tag, Spin, Button, Empty } from "antd";
import { LeftOutlined, InboxOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../../store";
import { getBinById, selectBinLoading } from "../../../store/binSlice";
import dayjs from "dayjs";

interface IBinProduct {
    productId: number;
    sku: string;
    name: string;
    quantity: number;
}

interface IBinDetail {
    id: number;
    code: string;
    name: string | null;
    warehouseId: number;
    warehouseName: string;
    status: string;
    createdAt: string;
}

const ViewBin = () => {
    const [searchParams] = useSearchParams();
    const id = searchParams.get("id");
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const loading = useAppSelector(selectBinLoading);

    const [binDetail, setBinDetail] = useState<IBinDetail | null>(null);
    const [products, setProducts] = useState<IBinProduct[]>([]);

    useEffect(() => {
        if (id) {
            dispatch(getBinById(parseInt(id)))
                .unwrap()
                .then((data: any) => {
                    setBinDetail(data.bin);
                    setProducts(data.products || []);
                });
        }
    }, [dispatch, id]);

    const columns = [
        {
            title: "Mã SKU",
            dataIndex: "sku",
            key: "sku",
            render: (sku: string) => (
                <span className="font-mono font-bold text-blue-600">{sku}</span>
            ),
        },
        {
            title: "Tên sản phẩm",
            dataIndex: "name",
            key: "name",
            render: (name: string) => (
                <span className="font-medium text-gray-800">{name}</span>
            ),
        },
        {
            title: "Số lượng tồn",
            dataIndex: "quantity",
            key: "quantity",
            align: "center" as const,
            render: (qty: number) => (
                <Tag
                    color={qty > 10 ? "green" : qty > 0 ? "orange" : "red"}
                    className="rounded-md px-3 py-0.5 font-bold"
                >
                    {qty}
                </Tag>
            ),
        },
    ];

    if (loading) {
        return (
            <div className="p-6 flex justify-center items-center h-96">
                <Spin size="large" tip="Đang tải dữ liệu..." />
            </div>
        );
    }

    if (!binDetail) {
        return (
            <div className="p-6 flex flex-col items-center justify-center h-96 gap-4">
                <Empty description="Không tìm thấy thông tin bin" />
                <Button icon={<LeftOutlined />} onClick={() => navigate(-1)}>
                    Quay lại
                </Button>
            </div>
        );
    }

    return (
        <div className="p-4 page-fade-in">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <Button
                    icon={<LeftOutlined />}
                    onClick={() => navigate(-1)}
                    className="flex items-center"
                >
                    Quay lại
                </Button>
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 leading-tight">
                        Chi tiết bin{" "}
                        <span className="font-mono text-blue-600">{binDetail.code}</span>
                    </h2>
                    <p className="text-gray-400 text-sm mt-0.5">
                        Thông tin vị trí lưu kho và danh sách sản phẩm
                    </p>
                </div>
            </div>

            {/* Bin info */}
            <Card
                className="mb-4 shadow-sm border border-gray-100 rounded-xl"
                title={
                    <span className="font-semibold text-gray-700 flex items-center gap-2">
                        <InboxOutlined />
                        Thông tin bin
                    </span>
                }
            >
                <Descriptions column={2} bordered size="small">
                    <Descriptions.Item label="Mã bin">
                        <span className="font-mono font-bold text-blue-600">
                            {binDetail.code}
                        </span>
                    </Descriptions.Item>
                    <Descriptions.Item label="Tên bin">
                        {binDetail.name || <span className="text-gray-400">—</span>}
                    </Descriptions.Item>
                    <Descriptions.Item label="Kho hàng">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                            {binDetail.warehouseName}
                        </span>
                    </Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                        <Tag color={binDetail.status === "Available" ? "green" : "red"}>
                            {binDetail.status === "Available" ? "Khả dụng" : "Không dùng"}
                        </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Ngày tạo">
                        {binDetail.createdAt
                            ? dayjs(binDetail.createdAt).format("HH:mm DD/MM/YYYY")
                            : "—"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Số loại sản phẩm">
                        <Tag color="blue">{products.length} sản phẩm</Tag>
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            {/* Products table */}
            <Card
                className="shadow-sm border border-gray-100 rounded-xl"
                title={
                    <span className="font-semibold text-gray-700">
                        Danh sách sản phẩm trong bin
                    </span>
                }
            >
                <Table
                    dataSource={products}
                    columns={columns}
                    rowKey="productId"
                    pagination={products.length > 10 ? { pageSize: 10 } : false}
                    locale={{ emptyText: <Empty description="Bin này chưa có sản phẩm" /> }}
                    size="middle"
                    className="rounded-lg overflow-hidden"
                />
            </Card>
        </div>
    );
};

export default ViewBin;