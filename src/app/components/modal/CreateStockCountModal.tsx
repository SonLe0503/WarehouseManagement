import { Modal, Form, Input, message, Spin } from "antd";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store";
import { createStockCountSession, getStockCountSessions } from "../../../store/stockCountSlide";
import { getAllUsers, selectCurrentUser, selectUserLoading } from "../../../store/userSlide";

interface CreateStockCountModalProps {
    open: boolean;
    onClose: () => void;
}

const CreateStockCountModal = ({ open, onClose }: CreateStockCountModalProps) => {
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const currentUser = useAppSelector(selectCurrentUser);
    const userLoading = useAppSelector(selectUserLoading);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open) {
            dispatch(getAllUsers());
        }
    }, [open, dispatch]);

    useEffect(() => {
        if (open && currentUser?.warehouseId) {
            form.setFieldsValue({
                warehouseId: currentUser.warehouseId
            });
        }
    }, [open, currentUser, form]);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            
            // Lấy warehouseId từ thông tin User hiện tại
            const warehouseId = currentUser?.warehouseId;

            if (!warehouseId) {
                message.error("Lỗi: Tài khoản của bạn chưa được gán quản lý kho hàng nào. Vui lòng liên hệ Admin.");
                return;
            }

            const payload = {
                ...values,
                warehouseId: warehouseId
            };

            setLoading(true);
            await dispatch(createStockCountSession(payload)).unwrap();
            
            message.success("Tạo phiên kiểm kê thành công!");
            dispatch(getStockCountSessions());
            onClose();
            form.resetFields();
        } catch (error: any) {
            message.error(error || "Có lỗi xảy ra khi tạo phiên kiểm kê");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Tạo phiên kiểm kê mới"
            open={open}
            onCancel={() => {
                form.resetFields();
                onClose();
            }}
            onOk={handleSubmit}
            confirmLoading={loading || userLoading}
            okText="Tạo phiên"
            cancelText="Hủy"
            destroyOnClose
        >
            <Spin spinning={userLoading}>
                <Form
                    form={form}
                    layout="vertical"
                >
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100 flex flex-col gap-1">
                        <span className="text-blue-500 text-xs font-bold uppercase tracking-wider">Kho hàng kiểm kê</span>
                        <span className="text-gray-800 font-bold text-lg">
                            {currentUser?.warehouseName || (userLoading ? "Đang tải..." : "Chưa xác định")}
                        </span>
                        <p className="text-gray-500 text-[11px] italic mt-1">
                            * Phiên kiểm kê sẽ được tạo cho kho hàng bạn đang quản lý.
                        </p>
                        <Form.Item name="warehouseId" hidden>
                            <Input />
                        </Form.Item>
                    </div>

                    <Form.Item
                        name="note"
                        label="Ghi chú phiên kiểm kê"
                    >
                        <Input.TextArea placeholder="Nhập ghi chú cho phiên kiểm kê này (nếu có)" rows={4} />
                    </Form.Item>
                </Form>
            </Spin>
        </Modal>
    );
};

export default CreateStockCountModal;
