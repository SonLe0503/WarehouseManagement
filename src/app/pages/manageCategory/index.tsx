import { Button, Modal, message, Tooltip } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store";
import { deleteCategory, getAllCategories, selectCategories, type ICategory } from "../../../store/categorySlide";
import AddCategoryModal from "../../components/modal/AddCategoryModal";
import EditCategoryModal from "../../components/modal/EditCategoryModal";
import Condition from "./Condition";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import ButtonAdd from "../../components/common/ButtonAdd";

const ManageCategory = () => {
    const dispatch = useAppDispatch();
    const categories = useAppSelector(selectCategories);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<ICategory | undefined>(undefined);
    const [searchName, setSearchName] = useState("");

    useEffect(() => {
        dispatch(getAllCategories());
    }, [dispatch]);

    const flattenedCategories = useMemo(() => {
        const result: (ICategory & { level: number })[] = [];
        const flatten = (items: ICategory[], level: number = 0) => {
            items.forEach(item => {
                result.push({ ...item, level });
                if (item.children && item.children.length > 0) {
                    flatten(item.children, level + 1);
                }
            });
        };
        flatten(categories);
        return result;
    }, [categories]);

    const filteredCategories = useMemo(() => {
        return flattenedCategories.filter(cat =>
            cat.name.toLowerCase().includes(searchName.toLowerCase())
        );
    }, [flattenedCategories, searchName]);


    const getParentName = (parentId?: number | null) => {
        if (!parentId) return "—";
        const parent = flattenedCategories.find((c: ICategory) => c.id === parentId);
        return parent ? parent.name : "—";
    };

    const handleEdit = (category: ICategory) => {
        setSelectedCategory(category);
        setIsEditModalOpen(true);
    };

    const handleDelete = (id: number) => {
        Modal.confirm({
            title: "Xác nhận xóa danh mục",
            content: "Bạn có chắc chắn muốn xóa danh mục này không?",
            okText: "Xóa",
            okType: "danger",
            cancelText: "Hủy",
            onOk: async () => {
                try {
                    await dispatch(deleteCategory(id)).unwrap();
                    message.success("Xóa danh mục thành công");
                    dispatch(getAllCategories());
                } catch (error: any) {
                    message.error(error || "Có lỗi xảy ra khi xóa danh mục");
                }
            },
        });
    };

    return (
        <div className="p-2">
            <Condition
                searchName={searchName}
                setSearchName={setSearchName}
            />
            <h2 className="text-xl font-bold mb-4">Quản lý danh mục</h2>
            <div className="mb-4 flex justify-end">
                <ButtonAdd onClick={() => setIsAddModalOpen(true)} />
            </div>

            <AddCategoryModal
                open={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
            />

            <EditCategoryModal
                open={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedCategory(undefined);
                }}
                categoryData={selectedCategory}
            />

            <div className="border-[0.05px] border-gray-300">
                <div className="grid grid-cols-4 bg-gray-100 font-semibold text-sm text-center">
                    <div className="px-3 py-2">ID</div>
                    <div className="px-3 py-2">Tên danh mục</div>
                    <div className="px-3 py-2">Danh mục cha</div>
                    <div className="px-3 py-2">Hành động</div>
                </div>

                {filteredCategories.map((cat: ICategory & { level: number }) => (
                    <div
                        key={cat.id}
                        className="grid grid-cols-4 text-center text-sm border-b-[0.05px] border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                        <div className="px-3 py-2">{cat.id}</div>
                        <div className="px-3 py-2">
                            <span style={{ marginLeft: `${cat.level * 20}px` }}>
                                {cat.name}
                            </span>
                        </div>
                        <div className="px-3 py-2 italic text-gray-500">
                            {getParentName(cat.parentId)}
                        </div>
                        <div className="px-3 py-2 flex gap-2 justify-center">
                            <Tooltip title="Sửa">
                                <Button
                                    type="primary"
                                    icon={<EditOutlined />}
                                    onClick={() => handleEdit(cat)}
                                    className="!flex !items-center !justify-center"
                                />
                            </Tooltip>
                            <Tooltip title="Xóa">
                                <Button
                                    danger
                                    type="primary"
                                    icon={<DeleteOutlined />}
                                    onClick={() => handleDelete(cat.id)}
                                    className="!flex !items-center !justify-center"
                                />
                            </Tooltip>
                        </div>
                    </div>
                ))}
                {filteredCategories.length === 0 && (
                    <div className="p-4 text-center text-gray-400">Không có dữ liệu</div>
                )}
            </div>
        </div>
    );
};

export default ManageCategory;