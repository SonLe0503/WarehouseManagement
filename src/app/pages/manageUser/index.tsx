import { Button, Tag, Modal, message } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch } from "../../../store";
import { deleteUser, getAllUsers, selectUsers, type IUser } from "../../../store/userSlide";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import Condition from "./Condition";
import AddUserModal from "../../components/modal/AddUserModal";
import EditUserModal from "../../components/modal/EditUserModal";



const ManageUser = () => {
    const dispatch = useAppDispatch();
    const users = useSelector(selectUsers);
    const [searchEmail, setSearchEmail] = useState("");
    const [searchStatus, setSearchStatus] = useState("");

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<IUser | undefined>(undefined);

    const filteredUsers = useMemo(() => {
        return users.filter((user) => {
            const emailMatch = user.email?.toLowerCase().includes(searchEmail.toLowerCase());
            const statusMatch = searchStatus === "" || user.status === searchStatus;
            return emailMatch && statusMatch;
        });
    }, [users, searchEmail, searchStatus]);

    const handleEdit = (user: number) => {
        setSelectedUser(users.find((u) => u.id === user));
        setIsEditModalOpen(true);
    }
    const handleDelete = (id: number) => {
        Modal.confirm({
            title: "Xác nhận xóa tài khoản",
            content: "Bạn có chắc chắn muốn xóa tài khoản này không? Hành động này không thể hoàn tác.",
            okText: "Xóa",
            okType: "danger",
            cancelText: "Hủy",
            onOk: async () => {
                try {
                    await dispatch(deleteUser(id)).unwrap();
                    message.success("Xóa tài khoản thành công");
                } catch (error: any) {
                    message.error(error || "Có lỗi xảy ra khi xóa tài khoản");
                }
            },
        });
    }
    useEffect(() => {
        dispatch(getAllUsers());
    }, [dispatch]);
    console.log(users);
    return (
        <div className="p-2">
            <Condition
                searchEmail={searchEmail}
                setSearchEmail={setSearchEmail}
                searchStatus={searchStatus}
                setSearchStatus={setSearchStatus}
            />

            <h2 className="text-xl font-bold mb-4">Quản lý tài khoản</h2>
            <div className="mb-4 flex justify-end">
                <Button size="small" type="primary" onClick={() => setIsAddModalOpen(true)}>
                    + Thêm mới
                </Button>
            </div>

            <AddUserModal
                open={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
            />

            <EditUserModal
                open={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedUser(undefined);
                }}
                userData={selectedUser}
            />
            <div className="border-[0.05px] border-gray-300">
                <div className="grid grid-cols-6 bg-gray-100 font-semibold text-sm text-center">
                    <div className="px-3 py-2">Username</div>
                    <div className="px-3 py-2">Email</div>
                    <div className="px-3 py-2">Role</div>
                    <div className="px-3 py-2">Status</div>
                    <div className="px-3 py-2">Created At</div>
                    <div className="px-3 py-2">Action</div>
                </div>

                {filteredUsers.map((u) => (
                    <div
                        key={u.id}
                        className="grid grid-cols-6 text-center text-sm border-b-[0.05px] border-gray-300"
                    >
                        <div className="px-3 py-2 truncate">{u.username}</div>
                        <div className="px-3 py-2 truncate">{u.email ?? "—"}</div>
                        <div className="px-3 py-2">
                            {u.roles.map((role) => (
                                <Tag key={role} color="blue">
                                    {role}
                                </Tag>
                            ))}
                        </div>
                        <div className="px-3 py-2 flex justify-center items-center">
                            {u.status === "ACTIVE" ? (
                                <Tag color="green">Active</Tag>
                            ) : (
                                <Tag color="red">Blocked</Tag>
                            )}
                        </div>
                        <div className="px-3 py-2">
                            {dayjs(u.createdAt).format("DD/MM/YYYY")}
                        </div>
                        <div className="px-3 py-2 flex gap-2 justify-center">
                            <Button
                                className="!bg-blue-500 !text-white px-3 py-1 rounded"
                                onClick={() => handleEdit(u.id)}
                                size="small"
                            >
                                Edit
                            </Button>
                            <Button
                                className={`${u.roles.some((role) => role.toUpperCase() === "ADMIN") ? "!bg-gray-300" : "!bg-red-500"} !text-white px-3 py-1 rounded`}
                                onClick={() => handleDelete(u.id)}
                                size="small"
                                disabled={u.roles.some((role) => role.toUpperCase() === "ADMIN")}
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
export default ManageUser