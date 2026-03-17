import { Button, Table, Tag, Space, message, Tooltip } from "antd";
import { PlusOutlined, PlayCircleOutlined, HomeOutlined, FileSearchOutlined, EyeOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store";
import { getStockCountSessions, selectStockCountSessions, selectStockCountLoading, generateStockCountItems } from "../../../store/stockCountSlide";
import { selectCurrentUser, getAllUsers } from "../../../store/userSlide";
import { selectInfoLogin } from "../../../store/authSlide";
import dayjs from "dayjs";
import CreateStockCountModal from "../../components/modal/CreateStockCountModal";
import StockCountItemModal from "../../components/modal/StockCountItemModal";

const ManageStockCount = () => {
    const dispatch = useAppDispatch();
    const sessions = useAppSelector(selectStockCountSessions);
    const loading = useAppSelector(selectStockCountLoading);
    const currentUser = useAppSelector(selectCurrentUser);
    const infoLogin = useAppSelector(selectInfoLogin);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [selectedSession, setSelectedSession] = useState<any>(null);
    const [actionLoading, setActionLoading] = useState<number | null>(null);

    const isManager = infoLogin?.role === "MANAGE" || infoLogin?.role === "ADMIN";

    useEffect(() => {
        dispatch(getStockCountSessions());
        dispatch(getAllUsers());
    }, [dispatch]);

    const handleGenerate = async (id: number) => {
        try {
            setActionLoading(id);
            await dispatch(generateStockCountItems(id)).unwrap();
            message.success("Đã khởi tạo danh sách hàng hóa cần kiểm kê!");
            dispatch(getStockCountSessions());
            const session = sessions.find(s => s.id === id);
            if (session) {
                setSelectedSession(session);
                setIsItemModalOpen(true);
            }
        } catch (error: any) {
            message.error(error || "Có lỗi xảy ra");
        } finally {
            setActionLoading(null);
        }
    };

    const handleOpenItems = (session: any) => {
        setSelectedSession(session);
        setIsItemModalOpen(true);
    };

    const columns = [
        {
            title: "Mã phiên",
            dataIndex: "countNo",
            key: "countNo",
            render: (text: string) => <span className="font-mono font-bold text-blue-600">{text}</span>,
        },
        {
            title: "Kho hàng",
            dataIndex: "warehouseId",
            key: "warehouseId",
            render: (id: number) => (
                <Space>
                    <HomeOutlined className="text-gray-400" />
                    <span className="font-medium">{id === currentUser?.warehouseId ? (currentUser?.warehouseName || `Kho #${id}`) : `Kho #${id}`}</span>
                </Space>
            ),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status: string) => {
                let color = "blue";
                if (status === "Approved") color = "green";
                if (status === "Counting") color = "orange";
                if (status === "Draft") color = "default";
                return (
                    <Tag color={color}>
                        {status === "Draft" ? "Bản nháp" : status === "Counting" ? "Đang kiểm" : status === "Approved" ? "Đã duyệt" : status}
                    </Tag>
                );
            },
        },
        {
            title: "Ghi chú",
            dataIndex: "note",
            key: "note",
            ellipsis: true,
        },
        {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (date: string) => dayjs(date).format("DD/MM/YYYY HH:mm"),
        },
        {
            title: "Thao tác",
            key: "action",
            align: "center" as const,
            render: (_: any, record: any) => (
                <Space size="middle">
                    {record.status === "Draft" && isManager && (
                        <Tooltip title="Khởi tạo danh sách">
                            <Button
                                type="primary"
                                className="bg-orange-500 hover:bg-orange-600 border-none flex items-center justify-center p-2 h-auto"
                                icon={<PlayCircleOutlined className="text-base" />}
                                loading={actionLoading === record.id}
                                onClick={() => handleGenerate(record.id)}
                            />
                        </Tooltip>
                    )}

                    {record.status !== "Draft" && (
                        <Tooltip title={record.status === "Approved" ? "Xem kết quả" : "Kiểm đếm"}>
                            <Button
                                type="primary"
                                className={`${record.status === "Approved" ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"} border-none flex items-center justify-center p-2 h-auto`}
                                icon={record.status === "Approved" ? <EyeOutlined className="text-base" /> : <FileSearchOutlined className="text-base" />}
                                onClick={() => handleOpenItems(record)}
                            />
                        </Tooltip>
                    )}
                </Space>
            ),
        },
    ];

    return (
        <div className="p-2 page-fade-in">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Kiểm kê kho hàng</h2>
                    <p className="text-gray-500 mt-1">Quản lý và theo dõi các phiên kiểm kê định kỳ</p>
                </div>
                {isManager && (
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        size="large"
                        className="bg-blue-600 flex items-center h-11 px-6 rounded-lg font-semibold shadow-md shadow-blue-100"
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        Tạo phiên kiểm kê
                    </Button>
                )}
            </div>

            <Table
                columns={columns}
                dataSource={sessions}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
                bordered
            />

            <CreateStockCountModal
                open={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
            />

            <StockCountItemModal
                open={isItemModalOpen}
                onClose={() => {
                    setIsItemModalOpen(false);
                    dispatch(getStockCountSessions()); // Refresh lists
                }}
                session={selectedSession}
            />
        </div>
    );
};

export default ManageStockCount;
