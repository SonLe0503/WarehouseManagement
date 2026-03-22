import React, { useEffect } from "react";
import { Alert, Card, Col, Empty, Progress, Row, Spin, Statistic, Table, Tag, Typography } from "antd";
import {
    AppstoreOutlined,
    ClusterOutlined,
    DatabaseOutlined,
    ShopOutlined,
    TeamOutlined,
    UserSwitchOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "../../../store";
import {
    getAdminDashboardOverview,
    selectAdminDashboardError,
    selectAdminDashboardLoading,
    selectAdminDashboardOverview,
} from "../../../store/dashboardAdminSlice";

const { Title, Text } = Typography;

const DashboardAdmin: React.FC = () => {
    const dispatch = useAppDispatch();
    const overview = useAppSelector(selectAdminDashboardOverview);
    const loading = useAppSelector(selectAdminDashboardLoading);
    const error = useAppSelector(selectAdminDashboardError);

    useEffect(() => {
        dispatch(getAdminDashboardOverview());
    }, [dispatch]);

    const summary = overview?.summary;
    const roleDistribution = overview?.roleDistribution ?? [];
    const recentUsers = overview?.recentUsers ?? [];
    const recentProducts = overview?.recentProducts ?? [];
    const warehouseOverview = overview?.warehouseOverview ?? [];

    const userColumns = [
        {
            title: "Tài khoản",
            key: "username",
            render: (_: unknown, record: typeof recentUsers[number]) => (
                <div>
                    <Text strong>{record.username}</Text>
                    <br />
                    <Text type="secondary" className="text-xs">{record.email}</Text>
                </div>
            ),
        },
        {
            title: "Vai trò",
            dataIndex: "roles",
            key: "roles",
            render: (roles: string[]) => roles.map((role) => (
                <Tag key={role} color="blue" className="mb-1">{role}</Tag>
            )),
        },
        {
            title: "Kho phụ trách",
            dataIndex: "warehouseName",
            key: "warehouseName",
            render: (value: string | null | undefined) => value || "Toàn hệ thống",
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status: string) => (
                <Tag color={status === "Active" ? "green" : "red"}>
                    {status === "Active" ? "Đang hoạt động" : "Ngưng hoạt động"}
                </Tag>
            ),
        },
        {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (value: string | null | undefined) => value ? dayjs(value).format("DD/MM/YYYY") : "—",
        },
    ];

    const productColumns = [
        {
            title: "Mã SKU",
            dataIndex: "sku",
            key: "sku",
            render: (value: string) => <Text strong className="text-blue-600">{value}</Text>,
        },
        {
            title: "Thông tin sản phẩm",
            key: "name",
            render: (_: unknown, record: typeof recentProducts[number]) => (
                <div>
                    <Text strong>{record.name}</Text>
                    <br />
                    <Text type="secondary" className="text-xs">{record.categoryName || "Chưa có danh mục"}</Text>
                </div>
            ),
        },
        {
            title: "Đơn vị",
            dataIndex: "baseUnitCode",
            key: "baseUnitCode",
            render: (value: string) => <Tag color="geekblue">{value || "—"}</Tag>,
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status: string) => (
                <Tag color={status === "ACTIVE" ? "green" : "red"}>
                    {status === "ACTIVE" ? "Đang bán" : "Ngừng bán"}
                </Tag>
            ),
        },
        {
            title: "Ngày tạo",
            dataIndex: "createdAt",
            key: "createdAt",
            render: (value: string | null | undefined) => value ? dayjs(value).format("DD/MM/YYYY") : "—",
        },
    ];

    const warehouseColumns = [
        {
            title: "Thông tin kho",
            key: "name",
            render: (_: unknown, record: typeof warehouseOverview[number]) => (
                <div>
                    <Text strong>{record.name}</Text>
                    <br />
                    <Text type="secondary" className="text-xs">{record.code}</Text>
                </div>
            ),
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status: string) => (
                <Tag color={status === "Active" ? "green" : "red"}>
                    {status === "Active" ? "Hoạt động" : "Ngừng hoạt động"}
                </Tag>
            ),
        },
        {
            title: "Nhân sự",
            dataIndex: "userCount",
            key: "userCount",
        },
        {
            title: "Quản lý kho",
            dataIndex: "managerCount",
            key: "managerCount",
            render: (value: number) => value > 0 ? <Tag color="blue">{value}</Tag> : <Tag color="orange">Thiếu</Tag>,
        },
    ];

    if (loading && !overview) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Spin size="large" tip="Loading admin dashboard...">
                    <div className="p-12" />
                </Spin>
            </div>
        );
    }

    return (
        <motion.div
            className="p-6 bg-[#f5f7fb] min-h-screen"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
        >
            <div className="mb-8 flex items-start justify-between gap-4">
                <div>
                    <Title level={2} className="!mb-1 !text-slate-800">Bảng điều khiển quản trị</Title>
                    <Text type="secondary">
                        Tổng quan tài nguyên hệ thống và các module quản trị hiện có trong WMS.
                    </Text>
                </div>
                <Tag color="blue" className="px-3 py-1 rounded-full">ADMIN</Tag>
            </div>

            {error && (
                <Alert
                    type="error"
                    showIcon
                    className="mb-6"
                    message="Không tải được dữ liệu dashboard admin"
                    description={error}
                />
            )}

            <Row gutter={[20, 20]} className="mb-8">
                <Col xs={24} sm={12} xl={6}>
                    <Card className="rounded-2xl shadow-sm border-0">
                        <Statistic
                            title="Người dùng"
                            value={summary?.totalUsers ?? 0}
                            prefix={<TeamOutlined className="text-blue-500" />}
                        />
                        <div className="mt-4 flex justify-between text-xs text-slate-500">
                            <span>Đang hoạt động: {summary?.activeUsers ?? 0}</span>
                            <span>Ngưng hoạt động: {summary?.inactiveUsers ?? 0}</span>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} xl={6}>
                    <Card className="rounded-2xl shadow-sm border-0">
                        <Statistic
                            title="Kho hàng"
                            value={summary?.activeWarehouses ?? 0}
                            suffix={`/ ${summary?.totalWarehouses ?? 0}`}
                            prefix={<ShopOutlined className="text-emerald-500" />}
                        />
                        <div className="mt-4 text-xs text-slate-500">
                            Chưa có manager: <Text strong>{summary?.warehousesWithoutManager ?? 0}</Text>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} xl={6}>
                    <Card className="rounded-2xl shadow-sm border-0">
                        <Statistic
                            title="Sản phẩm"
                            value={summary?.activeProducts ?? 0}
                            suffix={`/ ${summary?.totalProducts ?? 0}`}
                            prefix={<DatabaseOutlined className="text-indigo-500" />}
                        />
                        <div className="mt-4 text-xs text-slate-500">
                            Ngừng bán: <Text strong>{summary?.inactiveProducts ?? 0}</Text>
                        </div>
                    </Card>
                </Col>
                <Col xs={24} sm={12} xl={6}>
                    <Card className="rounded-2xl shadow-sm border-0">
                        <Statistic
                            title="Danh mục và đơn vị"
                            value={summary?.totalCategories ?? 0}
                            prefix={<AppstoreOutlined className="text-amber-500" />}
                        />
                        <div className="mt-4 flex justify-between text-xs text-slate-500">
                            <span>Root: {summary?.rootCategories ?? 0}</span>
                            <span>Units: {summary?.totalUnits ?? 0}</span>
                        </div>
                    </Card>
                </Col>
            </Row>

            <Row gutter={[20, 20]} className="mb-8">
                <Col xs={24} lg={10}>
                    <Card
                        title={<span className="font-bold"><UserSwitchOutlined className="mr-2 text-sky-500" />Phân bố vai trò</span>}
                        className="rounded-2xl shadow-sm border-0 h-full"
                    >
                        {roleDistribution.length === 0 ? (
                            <Empty description="Chưa có dữ liệu vai trò" />
                        ) : (
                            <div className="space-y-4">
                                {roleDistribution.map((item) => {
                                    const percent = summary?.totalUsers
                                        ? Math.round((item.userCount / summary.totalUsers) * 100)
                                        : 0;

                                    return (
                                        <div key={item.roleName}>
                                            <div className="mb-1 flex items-center justify-between">
                                                <Text strong>{item.roleName}</Text>
                                                <Text type="secondary">{item.userCount} người dùng</Text>
                                            </div>
                                            <Progress percent={percent} strokeColor="#2563eb" showInfo={false} />
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </Card>
                </Col>
                <Col xs={24} lg={14}>
                    <Card
                        title={<span className="font-bold"><ClusterOutlined className="mr-2 text-emerald-500" />Tình hình vận hành hệ thống</span>}
                        className="rounded-2xl shadow-sm border-0 h-full"
                    >
                        <Row gutter={[16, 16]}>
                            <Col xs={24} sm={12}>
                                <div className="rounded-xl bg-slate-50 p-4">
                                    <Text type="secondary">Kho ngừng hoạt động</Text>
                                    <div className="mt-2 text-3xl font-bold text-slate-800">{summary?.inactiveWarehouses ?? 0}</div>
                                </div>
                            </Col>
                            <Col xs={24} sm={12}>
                                <div className="rounded-xl bg-slate-50 p-4">
                                    <Text type="secondary">Người dùng ngưng hoạt động</Text>
                                    <div className="mt-2 text-3xl font-bold text-slate-800">{summary?.inactiveUsers ?? 0}</div>
                                </div>
                            </Col>
                            <Col xs={24} sm={12}>
                                <div className="rounded-xl bg-slate-50 p-4">
                                    <Text type="secondary">Sản phẩm ngừng bán</Text>
                                    <div className="mt-2 text-3xl font-bold text-slate-800">{summary?.inactiveProducts ?? 0}</div>
                                </div>
                            </Col>
                            <Col xs={24} sm={12}>
                                <div className="rounded-xl bg-slate-50 p-4">
                                    <Text type="secondary">Đơn vị cơ sở</Text>
                                    <div className="mt-2 text-3xl font-bold text-slate-800">{summary?.baseUnits ?? 0}</div>
                                </div>
                            </Col>
                        </Row>
                    </Card>
                </Col>
            </Row>

            <Row gutter={[20, 20]}>
                <Col xs={24} xl={12}>
                    <Card title="Tài khoản tạo gần đây" className="rounded-2xl shadow-sm border-0">
                        <Table
                            rowKey="id"
                            columns={userColumns}
                            dataSource={recentUsers}
                            pagination={false}
                            locale={{ emptyText: "Chưa có người dùng nào" }}
                            size="middle"
                        />
                    </Card>
                </Col>
                <Col xs={24} xl={12}>
                    <Card title="Sản phẩm tạo gần đây" className="rounded-2xl shadow-sm border-0">
                        <Table
                            rowKey="id"
                            columns={productColumns}
                            dataSource={recentProducts}
                            pagination={false}
                            locale={{ emptyText: "Chưa có sản phẩm nào" }}
                            size="middle"
                        />
                    </Card>
                </Col>
                <Col xs={24}>
                    <Card title="Tổng quan kho hàng" className="rounded-2xl shadow-sm border-0">
                        <Table
                            rowKey="warehouseId"
                            columns={warehouseColumns}
                            dataSource={warehouseOverview}
                            pagination={false}
                            locale={{ emptyText: "Chưa có kho nào" }}
                            size="middle"
                        />
                    </Card>
                </Col>
            </Row>
        </motion.div>
    );
};

export default DashboardAdmin;
