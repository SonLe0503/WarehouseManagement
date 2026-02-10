import { Button, Tag, Modal, message } from "antd";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import Condition from "./Condition";
import axios from "axios";
import { useAppSelector } from "../../../store";
import { selectInfoLogin } from "../../../store/authSlide";

// Định nghĩa kiểu dữ liệu cho Request
interface IPurchaseRequest {
    id: number;
    requestNo: string;
    supplierName: string;
    status: string;
    createdAt: string;
    note: string;
    rejectReason: string;
}

const ManagePurchaseRequest = () => {
    const [requests, setRequests] = useState<IPurchaseRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchNo, setSearchNo] = useState("");
    const [searchStatus, setSearchStatus] = useState("");

    // ✅ Lấy token từ Redux store
    const infoLogin = useAppSelector(selectInfoLogin);

    // ✅ Hàm lấy config với token từ Redux
    const getAxiosConfig = () => {
        const token = infoLogin?.accessToken;

        if (!token) {
            message.error("Không tìm thấy token. Vui lòng đăng nhập lại");
            return null;
        }

        return {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        };
    };

    // Hàm gọi API
    const fetchRequests = async () => {
        const config = getAxiosConfig();
        if (!config) return;

        setLoading(true);
        try {
            const response = await axios.get(
                `https://localhost:7069/api/PurchaseStaff/my-requests`,
                config
            );

            setRequests(response.data);
        } catch (error: any) {
            console.error("Lỗi fetch API:", error);

            if (error.response?.status === 401) {
                message.error("Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại");
            } else {
                message.error("Không thể tải danh sách phiếu nhập");
            }
        } finally {
            setLoading(false);
        }
    };

    // Gọi API khi component mount
    useEffect(() => {
        fetchRequests();
    }, []);

    // Logic lọc dữ liệu tại local
    const filteredRequests = useMemo(() => {
        return requests.filter((req) => {
            const noMatch = req.requestNo?.toLowerCase().includes(searchNo.toLowerCase());
            const statusMatch = searchStatus === "" || req.status === searchStatus;
            return noMatch && statusMatch;
        });
    }, [requests, searchNo, searchStatus]);

    // Hàm xóa
    const handleDelete = (id: number) => {
        Modal.confirm({
            title: "Xác nhận xóa phiếu",
            content: "Bạn có chắc chắn muốn xóa phiếu nhập này không?",
            okText: "Xóa",
            okType: "danger",
            onOk: async () => {
                const config = getAxiosConfig();
                if (!config) return;

                try {
                    await axios.delete(
                        `https://localhost:7069/api/PurchaseStaff/${id}/delete`,
                        config
                    );
                    message.success("Xóa phiếu thành công");
                    fetchRequests();
                } catch (error: any) {
                    console.error("Lỗi xóa:", error);

                    if (error.response?.status === 403) {
                        message.error("Bạn không có quyền xóa phiếu này");
                    } else if (error.response?.status === 400) {
                        message.error(error.response.data?.message || "Không thể xóa phiếu này");
                    } else {
                        message.error("Xóa thất bại");
                    }
                }
            },
        });
    };

    // Hàm xem chi tiết
    const handleViewDetail = async (id: number) => {
        const config = getAxiosConfig();
        if (!config) return;

        try {
            const response = await axios.get(
                `https://localhost:7069/api/PurchaseStaff/${id}/details`,
                config
            );

            console.log("Chi tiết:", response.data);

            // TODO: Hiển thị modal chi tiết
            Modal.info({
                title: "Chi tiết phiếu nhập",
                width: 800,
                content: (
                    <div>
                        <pre>{JSON.stringify(response.data, null, 2)}</pre>
                    </div>
                ),
            });

        } catch (error: any) {
            if (error.response?.status === 403) {
                message.error("Bạn không có quyền xem phiếu này");
            } else {
                message.error("Không thể tải chi tiết phiếu");
            }
        }
    };

    // Hàm chỉnh sửa
    const handleEdit = (id: number) => {
        // TODO: Navigate to edit page
        console.log("Edit request:", id);
    };

    const getStatusTag = (status: string) => {
        switch (status) {
            case "Pending": return <Tag color="gold">Pending</Tag>;
            case "Approved": return <Tag color="green">Approved</Tag>;
            case "Rejected": return <Tag color="red">Rejected</Tag>;
            case "Completed": return <Tag color="blue">Completed</Tag>;
            default: return <Tag>{status}</Tag>;
        }
    };

    return (
        <div className="p-2">
            {/* ✅ ĐÃ XÓA DEBUG PANEL */}

            <Condition
                searchNo={searchNo}
                setSearchNo={setSearchNo}
                searchStatus={searchStatus}
                setSearchStatus={setSearchStatus}
            />

            <h2 className="text-xl font-bold mb-4">Quản lý phiếu nhập hàng</h2>

            <div className="mb-4 flex justify-end">
                <Button
                    size="small"
                    type="primary"
                    loading={loading}
                    onClick={() => fetchRequests()}
                    style={{ marginRight: 8 }}
                >
                    Làm mới
                </Button>
                <Button size="small" type="primary" onClick={() => { }}>
                    + Tạo phiếu mới
                </Button>
            </div>

            <div className="border-[0.05px] border-gray-300">
                <div className="grid grid-cols-6 bg-gray-100 font-semibold text-sm text-center">
                    <div className="px-3 py-2">Mã phiếu</div>
                    <div className="px-3 py-2">Nhà cung cấp</div>
                    <div className="px-3 py-2">Trạng thái</div>
                    <div className="px-3 py-2">Ngày tạo</div>
                    <div className="px-3 py-2">Ghi chú</div>
                    <div className="px-3 py-2">Thao tác</div>
                </div>

                {loading ? (
                    <div className="p-10 text-center">Đang tải dữ liệu...</div>
                ) : (
                    filteredRequests.map((req) => (
                        <div
                            key={req.id}
                            className="grid grid-cols-6 text-center text-sm border-b-[0.05px] border-gray-300 items-center hover:bg-gray-50 transition-all"
                        >
                            <div className="px-3 py-2 font-medium text-blue-600">{req.requestNo}</div>
                            <div className="px-3 py-2 truncate text-left" title={req.supplierName}>
                                {req.supplierName}
                            </div>
                            <div className="px-3 py-2 flex justify-center">
                                {getStatusTag(req.status)}
                            </div>
                            <div className="px-3 py-2">
                                {dayjs(req.createdAt).format("DD/MM/YYYY HH:mm")}
                            </div>
                            <div className="px-3 py-2 truncate italic text-gray-500" title={req.note}>
                                {req.note || "—"}
                            </div>
                            <div className="px-3 py-2 flex gap-2 justify-center">
                                <Button
                                    className="!bg-green-500 !text-white px-3 py-1 rounded"
                                    size="small"
                                    onClick={() => handleViewDetail(req.id)}
                                >
                                    View
                                </Button>
                                <Button
                                    className="!bg-blue-500 !text-white px-3 py-1 rounded"
                                    size="small"
                                    onClick={() => handleEdit(req.id)}
                                    disabled={req.status === "Approved" || req.status === "Completed"}
                                >
                                    Edit
                                </Button>
                                <Button
                                    className="!bg-red-500 !text-white px-3 py-1 rounded"
                                    size="small"
                                    onClick={() => handleDelete(req.id)}
                                    disabled={req.status === "Approved" || req.status === "Completed"}
                                >
                                    Delete
                                </Button>
                            </div>
                        </div>
                    ))
                )}

                {!loading && filteredRequests.length === 0 && (
                    <div className="p-4 text-center text-gray-500">Không có dữ liệu</div>
                )}
            </div>
        </div>
    );
};

export default ManagePurchaseRequest;