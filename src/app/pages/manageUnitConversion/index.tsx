import { App, Button, Card, Col, Form, InputNumber, Modal, Row, Select, Space, Table, Tag, Typography } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store";
import { getAllProducts, selectProducts } from "../../../store/productSlice";
import { getAllUnits, selectUnits } from "../../../store/unitSlide";
import {
    createUnitConversion,
    deactivateUnitConversion,
    getUnitConversionsByProduct,
    selectUnitConversionLoading,
    selectUnitConversions,
    updateUnitConversion,
    type IUnitConversion,
} from "../../../store/unitConversionSlice";

import Condition from "./Condition";
import AddConversion from "./AddConversion";

const { Text, Title } = Typography;

const ManageUnitConversion = () => {
    const dispatch = useAppDispatch();
    const { message } = App.useApp();
    const [createForm] = Form.useForm();
    const [editForm] = Form.useForm();

    const products = useAppSelector(selectProducts);
    const units = useAppSelector(selectUnits);
    const conversions = useAppSelector(selectUnitConversions);
    const loading = useAppSelector(selectUnitConversionLoading);

    const [selectedProductId, setSelectedProductId] = useState<number>();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [submittingEdit, setSubmittingEdit] = useState(false);
    const [editingItem, setEditingItem] = useState<IUnitConversion | null>(null);
    const [submittingCreate, setSubmittingCreate] = useState(false);

    useEffect(() => {
        dispatch(getAllProducts());
        dispatch(getAllUnits());
    }, [dispatch]);

    useEffect(() => {
        if (selectedProductId) {
            dispatch(getUnitConversionsByProduct(selectedProductId));
            // Reset entire form when product changes to clear stale selections
            createForm.resetFields();
            createForm.setFieldValue("productId", selectedProductId);
        } else {
            createForm.resetFields();
        }
    }, [dispatch, createForm, selectedProductId]);

    const selectedProduct = useMemo(
        () => products.find((p) => p.id === selectedProductId),
        [products, selectedProductId]
    );

    const baseUnitId = selectedProduct?.baseUnitId;
    const unitMap = useMemo(
        () => new Map(units.map((u) => [u.id, u])),
        [units]
    );

    const availableFromUnits = useMemo(() => {
        if (!baseUnitId) return units;
        const alreadyConvertedUnitIds = new Set(conversions.map(c => c.fromUnitId));
        return units.filter((u) => u.id !== baseUnitId && !alreadyConvertedUnitIds.has(u.id));
    }, [units, baseUnitId, conversions]);

    const openEditModal = (record: IUnitConversion) => {
        setEditingItem(record);
        editForm.setFieldsValue({
            fromUnitId: record.fromUnitId,
            conversionFactor: record.rate,
        });
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setEditingItem(null);
        editForm.resetFields();
    };

    const handleCreate = async (values: any) => {
        try {
            if (!selectedProduct) {
                message.warning("Vui lòng chọn sản phẩm");
                return;
            }

            setSubmittingCreate(true);
            await dispatch(
                createUnitConversion({
                    productId: values.productId,
                    fromUnitId: values.fromUnitId,
                    conversionFactor: values.conversionFactor,
                })
            ).unwrap();

            message.success("Tạo quy đổi thành công");

            createForm.setFieldsValue({
                fromUnitId: undefined,
                conversionFactor: 1,
            });

            if (selectedProductId) {
                dispatch(getUnitConversionsByProduct(selectedProductId));
            }
        } catch (error: any) {
            const rawError = error.message || error || "Có lỗi xảy ra";
            const cleanError = typeof rawError === 'string' && rawError.includes("System.Exception:")
                ? rawError.split('\n')[0].replace("System.Exception: ", "")
                : rawError;
            message.error(cleanError);
        } finally {
            setSubmittingCreate(false);
        }
    };

    const handleUpdate = async () => {
        if (!editingItem) return;

        try {
            const values = await editForm.validateFields();
            setSubmittingEdit(true);
            await dispatch(
                updateUnitConversion({
                    id: editingItem.id,
                    data: {
                        conversionFactor: values.conversionFactor,
                    },
                })
            ).unwrap();

            message.success("Cập nhật quy đổi thành công");
            closeEditModal();

            if (selectedProductId) {
                dispatch(getUnitConversionsByProduct(selectedProductId));
            }
        } catch (error: any) {
            const rawError = error.message || error || "Có lỗi xảy ra";
            const cleanError = typeof rawError === 'string' && rawError.includes("System.Exception:")
                ? rawError.split('\n')[0].replace("System.Exception: ", "")
                : rawError;
            message.error(cleanError);
        } finally {
            setSubmittingEdit(false);
        }
    };

    const handleDeactivate = (record: IUnitConversion) => {
        Modal.confirm({
            title: "Xác nhận ngưng sử dụng quy đổi",
            content: `Bạn có chắc chắn muốn xóa quy đổi từ ${unitMap.get(record.fromUnitId)?.name} sang ${unitMap.get(selectedProduct?.baseUnitId || record.toUnitId)?.name}?`,
            okText: "Xác nhận",
            okType: "danger",
            cancelText: "Hủy",
            onOk: async () => {
                try {
                    await dispatch(deactivateUnitConversion(record.id)).unwrap();
                    message.success("Đã xóa quy đổi");
                    if (selectedProductId) {
                        dispatch(getUnitConversionsByProduct(selectedProductId));
                    }
                } catch (error: any) {
                    message.error(error.message || error || "Có lỗi xảy ra");
                }
            },
        });
    };

    const columns = [
        {
            title: "Đơn vị quy đổi",
            dataIndex: "fromUnitId",
            key: "fromUnitId",
            render: (id: number) => {
                const u = unitMap.get(id);
                return u ? <Tag color="blue">{`${u.name} (${u.code})`}</Tag> : id;
            },
        },
        {
            title: "Công thức quy đổi",
            key: "formula",
            render: (_: any, record: IUnitConversion) => {
                const fromUnit = unitMap.get(record.fromUnitId);
                const toUnitId = record.toUnitId || selectedProduct?.baseUnitId;
                const toUnit = toUnitId ? unitMap.get(toUnitId) : undefined;
                return (
                    <Space>
                        <Text strong>1</Text> {fromUnit?.code || "Unit"}
                        <Text type="secondary">=</Text>
                        <Text strong className="text-blue-600">{record.rate}</Text>
                        {toUnit?.code || "Base"}
                    </Space>
                );
            },
        },
        {
            title: "Đơn vị gốc",
            dataIndex: "toUnitId",
            key: "toUnitId",
            render: (id: number) => {
                const targetId = id || selectedProduct?.baseUnitId;
                const u = targetId ? unitMap.get(targetId) : undefined;
                return u ? `${u.name} (${u.code})` : id;
            },
        },
        {
            title: "Hành động",
            key: "action",
            width: 120,
            render: (_: any, record: IUnitConversion) => (
                <Space>
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => openEditModal(record)}
                        className="text-blue-600"
                    />
                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeactivate(record)}
                    />
                </Space>
            ),
        },
    ];

    return (
        <div className="p-4 bg-gray-50 min-h-screen">
            <Row gutter={[24, 24]}>
                <Col span={24}>
                    <Card variant="borderless" className="shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <Title level={4} className="m-0">Quản lý Quy đổi Đơn vị</Title>
                                <Text type="secondary">Thiết lập tỷ lệ chuyển đổi giữa các đơn vị cho sản phẩm</Text>
                            </div>
                        </div>

                        <Space orientation="vertical" size="large" className="w-full">
                            <Condition
                                products={products}
                                selectedProductId={selectedProductId}
                                setSelectedProductId={setSelectedProductId}
                                selectedProduct={selectedProduct}
                            />

                            <Row gutter={24}>
                                <Col lg={16} md={24}>
                                    <div className="bg-white rounded-lg border">
                                        <Table
                                            loading={loading}
                                            rowKey="id"
                                            dataSource={conversions}
                                            columns={columns}
                                            pagination={false}
                                            locale={{
                                                emptyText: selectedProductId
                                                    ? "Chưa có quy đổi nào được thiết lập cho sản phẩm này"
                                                    : "Vui lòng chọn sản phẩm để bắt đầu",
                                            }}
                                        />
                                    </div>
                                </Col>

                                <Col lg={8} md={24}>
                                    <AddConversion
                                        form={createForm}
                                        onFinish={handleCreate}
                                        selectedProductId={selectedProductId}
                                        selectedProduct={selectedProduct}
                                        availableFromUnits={availableFromUnits}
                                        unitMap={unitMap}
                                        loading={submittingCreate}
                                    />
                                </Col>
                            </Row>
                        </Space>
                    </Card>
                </Col>
            </Row>

            <Modal
                title={
                    <Space>
                        <EditOutlined className="text-blue-500" />
                        <span>Cập nhật Quy đổi Đơn vị</span>
                    </Space>
                }
                open={isEditModalOpen}
                onCancel={closeEditModal}
                onOk={handleUpdate}
                confirmLoading={submittingEdit}
                okText="Lưu thay đổi"
                cancelText="Hủy"
                destroyOnHidden
            >
                <Form form={editForm} layout="vertical" className="mt-4">
                    <Form.Item label="Đơn vị quy đổi" name="fromUnitId">
                        <Select
                            disabled
                            options={units.map((u) => ({
                                value: u.id,
                                label: `${u.name} (${u.code})`,
                            }))}
                        />
                    </Form.Item>

                    <Form.Item
                        label="Hệ số quy đổi (mới)"
                        name="conversionFactor"
                        rules={[
                            { required: true, message: "Vui lòng nhập hệ số" },
                            { type: 'number', min: 1, message: "Hệ số phải lớn hơn hoặc bằng 1" }
                        ]}
                    >
                        <InputNumber
                            className="w-full"
                            placeholder="Nhập hệ số mới..."
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ManageUnitConversion;
