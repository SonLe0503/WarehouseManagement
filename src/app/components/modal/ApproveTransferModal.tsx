// components/modal/ApproveTransferModal.tsx
import { Modal, Form, Input, Radio, App } from "antd";
import { useState } from "react";
import { useAppDispatch } from "../../../store";
import { approveStockTransfer, getMyStockTransfers } from "../../../store/stockTransfer2StepSlice";

interface ApproveTransferModalProps {
    open: boolean;
    transferId: number | null;
    transferNo?: string;
    onClose: () => void;
}

const ApproveTransferModal = ({ open, transferId, transferNo, onClose }: ApproveTransferModalProps) => {
    const { message } = App.useApp();
    const [form] = Form.useForm();
    const dispatch = useAppDispatch();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (!transferId) return;
            setLoading(true);

            await dispatch(approveStockTransfer({
                id: transferId,
                action: values.action,
                comment: values.comment,
            })).unwrap();

            message.success(
                values.action === "Approve"
                    ? "Đã duyệt phiếu thành công"
                    : "Đã từ chối phiếu"
            );
            form.resetFields();
            dispatch(getMyStockTransfers());
            onClose();
        } catch (error: any) {
            message.error(typeof error === "string" ? error : "Có lỗi xảy ra");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title={`Xác nhận phiếu ${transferNo || ""}`}
            open={open}
            onCancel={() => { form.resetFields(); onClose(); }}
            onOk={handleSubmit}
            confirmLoading={loading}
            okText="Xác nhận"
            cancelText="Hủy"
            width={500}
        >
            <Form form={form} layout="vertical" initialValues={{ action: "Approve" }}>
                <Form.Item name="action" label="Hành động" rules={[{ required: true }]}>
                    <Radio.Group>
                        <Radio value="Approve">
                            <span className="text-green-600 font-medium">✓ Duyệt phiếu</span>
                        </Radio>
                        <Radio value="Reject">
                            <span className="text-red-500 font-medium">✗ Từ chối</span>
                        </Radio>
                    </Radio.Group>
                </Form.Item>

                <Form.Item
                    noStyle
                    shouldUpdate={(prev, curr) => prev.action !== curr.action}
                >
                    {({ getFieldValue }) => (
                        <Form.Item
                            name="comment"
                            label={getFieldValue("action") === "Reject" ? "Lý do từ chối" : "Ghi chú (tuỳ chọn)"}
                            rules={getFieldValue("action") === "Reject"
                                ? [{ required: true, message: "Vui lòng nhập lý do từ chối" }]
                                : []
                            }
                        >
                            <Input.TextArea
                                rows={3}
                                placeholder={
                                    getFieldValue("action") === "Reject"
                                        ? "Nhập lý do từ chối..."
                                        : "Ghi chú thêm (nếu có)..."
                                }
                            />
                        </Form.Item>
                    )}
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default ApproveTransferModal;