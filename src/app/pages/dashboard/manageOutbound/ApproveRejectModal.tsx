import { Modal, Input, Typography, message } from "antd";
import { useState, useEffect } from "react";

const { TextArea } = Input;
const { Text } = Typography;

interface ApproveRejectModalProps {
    open: boolean;
    onClose: () => void;
    onOk: (data: { action: "Approve" | "Reject"; comment?: string; rejectReason?: string }) => void;
    action: "Approve" | "Reject";
    loading?: boolean;
}

const ApproveRejectModal = ({ open, onClose, onOk, action, loading }: ApproveRejectModalProps) => {
    const [comment, setComment] = useState("");
    const [rejectReason, setRejectReason] = useState("");

    // Reset fields when opening/closing or changing action
    useEffect(() => {
        if (open) {
            setComment("");
            setRejectReason("");
        }
    }, [open, action]);

    const handleOk = () => {
        if (action === "Reject" && !rejectReason.trim()) {
            message.error("Vui lòng nhập lý do từ chối!");
            return;
        }

        onOk({
            action,
            comment: comment.trim() || undefined,
            rejectReason: action === "Reject" ? rejectReason.trim() : undefined,
        });
    };

    return (
        <Modal
            title={`Xác nhận ${action === "Approve" ? "Duyệt" : "Từ chối"} phiếu`}
            open={open}
            onCancel={onClose}
            onOk={handleOk}
            okText="Đồng ý"
            cancelText="Hủy"
            confirmLoading={loading}
            okButtonProps={{ danger: action === "Reject" }}
        >
            <div className="flex flex-col gap-4">
                <Text>
                    Bạn có chắc chắn muốn {action === "Approve" ? <span className="text-green-600 font-bold">duyệt</span> : <span className="text-red-600 font-bold">từ chối</span>} phiếu xuất này không?
                </Text>

                {action === "Reject" && (
                    <div>
                        <Text strong className="text-red-500">* Lý do từ chối:</Text>
                        <TextArea
                            rows={3}
                            placeholder="Nhập lý do từ chối..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            className="mt-1"
                        />
                    </div>
                )}

                <div>
                    <Text strong>Ghi chú / Comment (Tùy chọn):</Text>
                    <TextArea
                        rows={2}
                        placeholder="Nhập ghi chú thêm..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="mt-1"
                    />
                </div>
            </div>
        </Modal>
    );
};

export default ApproveRejectModal;
