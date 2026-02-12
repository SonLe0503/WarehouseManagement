import { Button, Tag, Modal, message, Tooltip } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../store";
import { deleteProduct, getAllProducts, selectProducts, type IProduct } from "../../../store/productSlice";
import dayjs from "dayjs";
import Condition from "./Condition";
import AddProductModal from "../../components/modal/AddProductModal";
import EditProductModal from "../../components/modal/EditProductModal";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import ButtonAdd from "../../components/common/ButtonAdd";

const ManageProduct = () => {
    const dispatch = useAppDispatch();
    const products = useAppSelector(selectProducts);
    const [searchSku, setSearchSku] = useState("");
    const [searchName, setSearchName] = useState("");

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<IProduct | undefined>(undefined);

    const filteredProducts = useMemo(() => {
        return products.filter((p) => {
            const skuMatch = p.sku?.toLowerCase().includes(searchSku.toLowerCase());
            const nameMatch = p.name?.toLowerCase().includes(searchName.toLowerCase());
            return skuMatch && nameMatch;
        });
    }, [products, searchSku, searchName]);

    const handleEdit = (product: IProduct) => {
        setSelectedProduct(product);
        setIsEditModalOpen(true);
    };

    const handleDelete = (id: number) => {
        Modal.confirm({
            title: "Xác nhận ngừng kinh doanh sản phẩm",
            content: "Bạn có chắc chắn muốn chuyển trạng thái sản phẩm này sang INACTIVE không?",
            okText: "Xác nhận",
            okType: "danger",
            cancelText: "Hủy",
            onOk: async () => {
                try {
                    await dispatch(deleteProduct(id)).unwrap();
                    message.success("Cập nhật trạng thái thành công");
                    dispatch(getAllProducts());
                } catch (error: any) {
                    message.error(error || "Có lỗi xảy ra");
                }
            },
        });
    };

    useEffect(() => {
        dispatch(getAllProducts());
    }, [dispatch]);

    return (
        <div className="p-2">
            <Condition
                searchSku={searchSku}
                setSearchSku={setSearchSku}
                searchName={searchName}
                setSearchName={setSearchName}
            />

            <h2 className="text-xl font-bold mb-4">Quản lý sản phẩm</h2>
            <div className="mb-4 flex justify-end">
                <ButtonAdd onClick={() => setIsAddModalOpen(true)} />
            </div>

            <AddProductModal
                open={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
            />

            <EditProductModal
                open={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedProduct(undefined);
                }}
                productData={selectedProduct}
            />

            <div className="border-[0.05px] border-gray-300">
                <div className="grid grid-cols-7 bg-gray-100 font-semibold text-sm text-center">
                    <div className="px-3 py-2">Mã SKU</div>
                    <div className="px-3 py-2">Tên sản phẩm</div>
                    <div className="px-3 py-2">Danh mục</div>
                    <div className="px-3 py-2">ĐVT</div>
                    <div className="px-3 py-2">Trạng thái</div>
                    <div className="px-3 py-2">Ngày tạo</div>
                    <div className="px-3 py-2">Hành động</div>
                </div>

                {filteredProducts.length > 0 ? (
                    filteredProducts.map((p) => (
                        <div
                            key={p.id}
                            className="grid grid-cols-7 text-center text-sm border-b-[0.05px] border-gray-300 hover:bg-gray-50 transition-colors"
                        >
                            <div className="px-3 py-2 font-medium">{p.sku}</div>
                            <div className="px-3 py-2">{p.name}</div>
                            <div className="px-3 py-2">{p.categoryName}</div>
                            <div className="px-3 py-2">
                                <Tag color="blue">{p.baseUnitCode}</Tag>
                            </div>
                            <div className="px-3 py-2 flex justify-center items-center">
                                {p.status === "ACTIVE" ? (
                                    <Tag color="green">Đang bán</Tag>
                                ) : (
                                    <Tag color="red">Ngừng bán</Tag>
                                )}
                            </div>
                            <div className="px-3 py-2 text-gray-500">
                                {dayjs(p.createdAt).format("DD/MM/YYYY")}
                            </div>
                            <div className="px-3 py-2 flex gap-2 justify-center">
                                <Tooltip title="Sửa">
                                    <Button
                                        type="primary"
                                        icon={<EditOutlined />}
                                        onClick={() => handleEdit(p)}
                                        className="!flex !items-center !justify-center"
                                    />
                                </Tooltip>
                                <Tooltip title="Xóa">
                                    <Button
                                        danger
                                        type="primary"
                                        icon={<DeleteOutlined />}
                                        onClick={() => handleDelete(p.id)}
                                        disabled={p.status === "INACTIVE"}
                                        className="!flex !items-center !justify-center"
                                    />
                                </Tooltip>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-8 text-center text-gray-400">Không tìm thấy sản phẩm</div>
                )}
            </div>
        </div>
    );
};

export default ManageProduct;