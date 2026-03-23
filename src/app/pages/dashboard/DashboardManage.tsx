import React, { useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Tag, Typography, Tooltip, Empty, Spin, Badge } from 'antd';
import {
    InboxOutlined,
    WarningOutlined,
    SwapOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined,
    HistoryOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    InfoCircleOutlined,
    MedicineBoxOutlined
} from '@ant-design/icons';
import { motion } from 'framer-motion';
import dayjs from 'dayjs';
import { useAppDispatch, useAppSelector } from '../../../store';
import {
    getDashboardSummary,
    getInboundOutboundChart,
    getLowStock,
    getPendingRequests,
    getRecentTransactions,
    selectDashboardSummary,
    selectDashboardChartData,
    selectDashboardLowStock,
    selectDashboardPendingRequests,
    selectDashboardRecentTransactions,
    selectDashboardLoading
} from '../../../store/dashboardManagerSlide';

const { Title, Text } = Typography;

const DashboardManage: React.FC = () => {
    const dispatch = useAppDispatch();
    const summary = useAppSelector(selectDashboardSummary);
    const chartData = useAppSelector(selectDashboardChartData);
    const lowStock = useAppSelector(selectDashboardLowStock);
    const pendingRequests = useAppSelector(selectDashboardPendingRequests);
    const recentTransactions = useAppSelector(selectDashboardRecentTransactions);
    const loading = useAppSelector(selectDashboardLoading);

    useEffect(() => {
        dispatch(getDashboardSummary(10));
        dispatch(getInboundOutboundChart('week'));
        dispatch(getLowStock({ threshold: 10, take: 5 }));
        dispatch(getPendingRequests());
        dispatch(getRecentTransactions(8));
    }, [dispatch]);

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.5,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    const transactionColumns = [
        {
            title: 'Type',
            dataIndex: 'type',
            key: 'type',
            render: (type: string) => {
                let color = 'blue';
                let icon = <InboxOutlined />;
                if (type.includes('Outbound')) {
                    color = 'orange';
                    icon = <ArrowUpOutlined />;
                } else if (type.includes('Transfer')) {
                    color = 'purple';
                    icon = <SwapOutlined />;
                }
                return (
                    <Tag color={color} icon={icon} className="rounded-md px-2 py-0.5">
                        {type}
                    </Tag>
                );
            }
        },
        {
            title: 'Ref No',
            dataIndex: 'refNo',
            key: 'refNo',
            render: (text: string) => <Text strong className="text-blue-600">{text}</Text>
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => {
                let color = 'default';
                if (status === 'Pending') color = 'processing';
                if (status === 'Completed' || status === 'Approved') color = 'success';
                if (status === 'Rejected' || status === 'Cancelled') color = 'error';
                return <Tag color={color} className="uppercase font-medium text-[10px]">{status}</Tag>;
            }
        },
        {
            title: 'Created At',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date: string) => (
                <Text type="secondary">
                    <ClockCircleOutlined className="mr-1" />
                    {dayjs(date).format('DD/MM HH:mm')}
                </Text>
            )
        }
    ];

    const lowStockColumns = [
        {
            title: 'Product',
            key: 'product',
            render: (_: any, record: any) => (
                <div>
                    <Text strong>{record.productName}</Text>
                    <br />
                    <Text type="secondary" className="text-xs">{record.sku}</Text>
                </div>
            )
        },
        {
            title: 'Qty',
            dataIndex: 'currentQuantity',
            key: 'currentQuantity',
            render: (qty: number) => (
                <Text type={qty <= 0 ? 'danger' : 'warning'} strong>
                    {qty}
                </Text>
            )
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={status === 'Out of Stock' ? 'red' : 'orange'}>
                    {status}
                </Tag>
            )
        }
    ];

    if (loading && !summary) {
        return (
            <div className="flex h-[80vh] items-center justify-center">
                <Spin size="large" tip="Loading Dashboard...">
                    <div className="p-12" />
                </Spin>
            </div>
        );
    }

    return (
        <motion.div
            className="p-6 bg-[#f0f2f5] min-h-screen"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <div className="mb-8 flex justify-between items-center">
                <div>
                    <Title level={2} className="!mb-0 !text-slate-800 font-bold">Warehouse Dashboard</Title>
                    <Text type="secondary">Overview of your warehouse operations and inventory status.</Text>
                </div>
            </div>

            {/* Summary Cards */}
            <Row gutter={[24, 24]} className="mb-8">
                <Col xs={24} sm={12} lg={6}>
                    <motion.div variants={itemVariants}>
                        <Card variant="borderless" className="rounded-2xl shadow-md hover:shadow-lg transition-all border-l-4 border-blue-500 h-full">
                            <Statistic
                                title={<Text className="text-slate-500 font-medium">Products in Stock</Text>}
                                value={summary?.totalProductsInStock}
                                prefix={<InboxOutlined className="text-blue-500 mr-2" />}
                                styles={{ content: { fontWeight: 800, color: '#1e293b' } }}
                            />
                            <div className="mt-4 flex items-center text-xs text-slate-400">
                                <InfoCircleOutlined className="mr-1" />
                                <span>Unique items with inventory &gt; 0</span>
                            </div>
                        </Card>
                    </motion.div>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <motion.div variants={itemVariants}>
                        <Card variant="borderless" className="rounded-2xl shadow-md hover:shadow-lg transition-all border-l-4 border-indigo-500 h-full">
                            <Statistic
                                title={<Text className="text-slate-500 font-medium">Total Quantity</Text>}
                                value={summary?.totalQuantityInWarehouse}
                                prefix={<MedicineBoxOutlined className="text-indigo-500 mr-2" />}
                                styles={{ content: { fontWeight: 800, color: '#1e293b' } }}
                            />
                            <div className="mt-4 flex items-center text-xs text-indigo-500">
                                <ArrowDownOutlined className="mr-1" />
                                <span>Today's Inbound: {summary?.todayInbound}</span>
                            </div>
                        </Card>
                    </motion.div>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <motion.div variants={itemVariants}>
                        <Card variant="borderless" className="rounded-2xl shadow-md hover:shadow-lg transition-all border-l-4 border-amber-500 h-full">
                            <Statistic
                                title={<Text className="text-slate-500 font-medium">Low Stock Alerts</Text>}
                                value={summary?.lowStockItems}
                                prefix={<WarningOutlined className="text-amber-500 mr-2" />}
                                styles={{ content: { fontWeight: 800, color: '#1e293b' } }}
                                suffix={summary?.lowStockItems && summary.lowStockItems > 0 ? <Tag color="error" className="ml-2 animate-pulse">Critical</Tag> : null}
                            />
                            <div className="mt-4 flex items-center text-xs text-amber-500">
                                <InfoCircleOutlined className="mr-1" />
                                <span>Items below threshold level</span>
                            </div>
                        </Card>
                    </motion.div>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <motion.div variants={itemVariants}>
                        <Card variant="borderless" className="rounded-2xl shadow-md hover:shadow-lg transition-all border-l-4 border-emerald-500 h-full">
                            <Statistic
                                title={<Text className="text-slate-500 font-medium">Pending Requests</Text>}
                                value={summary?.pendingRequests}
                                prefix={<ClockCircleOutlined className="text-emerald-500 mr-2" />}
                                styles={{ content: { fontWeight: 800, color: '#1e293b' } }}
                            />
                            <div className="mt-4 flex items-center text-xs text-emerald-500">
                                <CheckCircleOutlined className="mr-1" />
                                <span>Requires your immediate attention</span>
                            </div>
                        </Card>
                    </motion.div>
                </Col>
            </Row>

            <Row gutter={[24, 24]}>
                {/* Chart and Pending Breakdown */}
                <Col xs={24} lg={16}>
                    <motion.div variants={itemVariants} className="mb-6">
                        <Card
                            title={<span className="font-bold flex items-center"><SwapOutlined className="mr-2 text-blue-500" /> Inbound vs Outbound (Last 7 Days)</span>}
                            className="rounded-2xl shadow-md border-0 h-[380px]"
                        >
                            <div className="h-[280px] flex flex-col justify-end">
                                {chartData && chartData.length > 0 ? (
                                    <div className="flex items-end justify-between h-full px-4 mb-2">
                                        {chartData.map((point, idx) => (
                                            <div key={idx} className="flex flex-col items-center flex-1 mx-1 group relative">
                                                <div className="flex items-end gap-1 w-full justify-center group">
                                                    {/* Inbound Bar */}
                                                    <Tooltip title={`Inbound: ${point.purchases}`}>
                                                        <motion.div
                                                            className="bg-blue-400 w-3 rounded-t-sm"
                                                            initial={{ height: 0 }}
                                                            animate={{ height: `${Math.min(point.purchases * 2, 200)}px` }}
                                                            whileHover={{ scaleY: 1.1, backgroundColor: '#3b82f6' }}
                                                        />
                                                    </Tooltip>
                                                    {/* Outbound Bar */}
                                                    <Tooltip title={`Outbound: ${point.sales}`}>
                                                        <motion.div
                                                            className="bg-orange-400 w-3 rounded-t-sm"
                                                            initial={{ height: 0 }}
                                                            animate={{ height: `${Math.min(point.sales * 2, 200)}px` }}
                                                            whileHover={{ scaleY: 1.1, backgroundColor: '#f97316' }}
                                                        />
                                                    </Tooltip>
                                                </div>
                                                <Text className="text-[10px] mt-2 whitespace-nowrap rotate-[-45deg] origin-top-left -ml-2 text-slate-400">
                                                    {dayjs(point.label).format('DD MMM')}
                                                </Text>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <Empty description="No chart data available" />
                                )}
                                <div className="flex justify-center gap-6 mt-10 pt-4 border-t border-slate-50">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                                        <Text className="text-xs font-medium text-slate-500">Inbound Requests</Text>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                                        <Text className="text-xs font-medium text-slate-500">Outbound Requests</Text>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <Card
                            title={<span className="font-bold flex items-center"><HistoryOutlined className="mr-2 text-indigo-500" /> Recent Activity</span>}
                            className="rounded-2xl shadow-md border-0"
                            extra={<a href="/transactions" className="text-blue-500 text-xs hover:underline">View All</a>}
                        >
                            <Table
                                columns={transactionColumns}
                                dataSource={recentTransactions}
                                pagination={false}
                                size="middle"
                                className="custom-table"
                                rowKey={(record) => `${record.type}-${record.refId}`}
                            />
                        </Card>
                    </motion.div>
                </Col>

                {/* Right Sidebar: Pending & Low Stock */}
                <Col xs={24} lg={8}>
                    <motion.div variants={itemVariants} className="mb-6">
                        <Card
                            title={<span className="font-bold flex items-center"><ClockCircleOutlined className="mr-2 text-emerald-500" /> Pending Approval</span>}
                            className="rounded-2xl shadow-md border-0"
                        >
                            <div className="space-y-4">
                                <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl">
                                    <div className="flex items-center">
                                        <div className="bg-emerald-100 p-2 rounded-lg mr-3">
                                            <ArrowDownOutlined className="text-emerald-600" />
                                        </div>
                                        <Text strong>Inbound</Text>
                                    </div>
                                    <Badge count={pendingRequests?.pendingInboundRequests} showZero={false} overflowCount={99} className="custom-badge" color="#10b981" />
                                </div>
                                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-xl">
                                    <div className="flex items-center">
                                        <div className="bg-orange-100 p-2 rounded-lg mr-3">
                                            <ArrowUpOutlined className="text-orange-600" />
                                        </div>
                                        <Text strong>Outbound</Text>
                                    </div>
                                    <Badge count={pendingRequests?.pendingOutboundRequests} showZero={false} overflowCount={99} color="#f59e0b" />
                                </div>
                                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
                                    <div className="flex items-center">
                                        <div className="bg-blue-100 p-2 rounded-lg mr-3">
                                            <SwapOutlined className="text-blue-600" />
                                        </div>
                                        <Text strong>Transfer In</Text>
                                    </div>
                                    <Badge count={pendingRequests?.pendingTransferInRequests} showZero={false} color="#3b82f6" />
                                </div>
                                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-xl">
                                    <div className="flex items-center">
                                        <div className="bg-purple-100 p-2 rounded-lg mr-3">
                                            <SwapOutlined className="text-purple-600 rotate-180" />
                                        </div>
                                        <Text strong>Transfer Out</Text>
                                    </div>
                                    <Badge count={pendingRequests?.pendingTransferOutRequests} showZero={false} color="#8b5cf6" />
                                </div>
                            </div>
                        </Card>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <Card
                            title={<span className="font-bold flex items-center"><WarningOutlined className="mr-2 text-amber-500" /> Low Stock Alerts</span>}
                            className="rounded-2xl shadow-md border-0"
                            extra={<Tag color="warning" className="m-0 font-bold">{lowStock.length}</Tag>}
                        >
                            <Table
                                columns={lowStockColumns}
                                dataSource={lowStock}
                                pagination={false}
                                size="small"
                                rowKey="productId"
                            />
                            {lowStock.length === 0 && !loading && <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="All stock levels healthy" />}
                        </Card>
                    </motion.div>
                </Col>
            </Row>

            <style>{`
                .ant-card-head { border-bottom: 1px solid #f1f5f9; min-height: 56px; }
                .ant-card-head-title { color: #334155; }
                .ant-statistic-title { margin-bottom: 8px; }
                .custom-table .ant-table-thead > tr > th { background: transparent; border-bottom: 1px solid #f1f5f9; color: #94a3b8; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em; }
                .custom-table .ant-table-tbody > tr > td { border-bottom: 1px solid #f8fafc; }
                .ant-table-placeholder .ant-empty-normal { margin: 16px 0; }
            `}</style>
        </motion.div>
    );
};

export default DashboardManage;