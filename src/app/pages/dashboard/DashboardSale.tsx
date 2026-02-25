import { useState, useEffect, useCallback } from "react";
import axios from "axios";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Product {
    id: number;
    name: string;
    sku: string;
}

interface SalesOrderItemDto {
    id: number;
    productId: number;
    productName: string;
    quantity: number;
}

interface SalesOrderDto {
    id: number;
    orderNo: string;
    customerName: string;
    status: string;
    note: string;
    createdBy: number;
    createdAt: string;
    items: SalesOrderItemDto[];
}

interface SalesOrderItemRequest {
    id?: number;
    productId: number;
    quantity: number;
}

interface SalesOrderRequest {
    orderNo: string;
    customerName: string;
    status: string;
    note: string;
    createdBy: number;
    items: SalesOrderItemRequest[];
}

// ─── API ──────────────────────────────────────────────────────────────────────

const API = "http://localhost:5000/api";

const api = {
    getOrders: () => axios.get<SalesOrderDto[]>(`${API}/salesorders`),
    getOrder: (id: number) => axios.get<SalesOrderDto>(`${API}/salesorders/${id}`),
    createOrder: (data: SalesOrderRequest) => axios.post<SalesOrderDto>(`${API}/salesorders`, data),
    updateOrder: (id: number, data: SalesOrderRequest) => axios.put<SalesOrderDto>(`${API}/salesorders/${id}`, data),
    deleteOrder: (id: number) => axios.delete(`${API}/salesorders/${id}`),
    getProducts: () => axios.get<Product[]>(`${API}/products`),
};

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    Draft: { label: "Draft", color: "#6b7280", bg: "#f3f4f6" },
    Pending: { label: "Pending", color: "#d97706", bg: "#fef3c7" },
    Approved: { label: "Approved", color: "#059669", bg: "#d1fae5" },
    Cancelled: { label: "Cancelled", color: "#dc2626", bg: "#fee2e2" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtDate = (d: string) =>
    d ? new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";

// ─── Components ───────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
    const cfg = STATUS_CONFIG[status] ?? { label: status, color: "#374151", bg: "#e5e7eb" };
    return (
        <span style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600,
            color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}22`,
        }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.color, display: "inline-block" }} />
            {cfg.label}
        </span>
    );
}

function Spinner() {
    return (
        <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
            <div style={{
                width: 36, height: 36, border: "3px solid #e5e7eb",
                borderTopColor: "#1d4ed8", borderRadius: "50%",
                animation: "spin 0.7s linear infinite",
            }} />
        </div>
    );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
    return (
        <div style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center",
        }} onClick={onClose}>
            <div style={{
                background: "#fff", borderRadius: 12, width: "min(700px, 95vw)", maxHeight: "90vh",
                overflow: "auto", boxShadow: "0 24px 64px rgba(0,0,0,0.2)",
            }} onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "20px 24px", borderBottom: "1px solid #f0f0f0",
                    position: "sticky", top: 0, background: "#fff", zIndex: 1,
                }}>
                    <span style={{ fontWeight: 700, fontSize: 17, color: "#111827" }}>{title}</span>
                    <button onClick={onClose} style={{
                        border: "none", background: "#f3f4f6", cursor: "pointer",
                        width: 32, height: 32, borderRadius: "50%", fontSize: 18, color: "#6b7280",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>×</button>
                </div>
                <div style={{ padding: "24px" }}>{children}</div>
            </div>
        </div>
    );
}

// ─── Order Form ───────────────────────────────────────────────────────────────

function OrderForm({
    initial, products, onSubmit, onCancel, loading,
}: {
    initial?: SalesOrderDto;
    products: Product[];
    onSubmit: (data: SalesOrderRequest) => void;
    onCancel: () => void;
    loading: boolean;
}) {
    const [form, setForm] = useState<SalesOrderRequest>({
        orderNo: initial?.orderNo ?? "",
        customerName: initial?.customerName ?? "",
        status: initial?.status ?? "Draft",
        note: initial?.note ?? "",
        createdBy: initial?.createdBy ?? 1,
        items: initial?.items.map(i => ({ id: i.id, productId: i.productId, quantity: i.quantity })) ?? [{ productId: 0, quantity: 1 }],
    });
    const [errors, setErrors] = useState<string[]>([]);

    const setField = (k: keyof Omit<SalesOrderRequest, "items">, v: string | number) =>
        setForm(f => ({ ...f, [k]: v }));

    const setItem = (idx: number, k: keyof SalesOrderItemRequest, v: number) =>
        setForm(f => {
            const items = [...f.items];
            items[idx] = { ...items[idx], [k]: v };
            return { ...f, items };
        });

    const addItem = () => setForm(f => ({ ...f, items: [...f.items, { productId: 0, quantity: 1 }] }));

    const removeItem = (idx: number) =>
        setForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));

    const validate = () => {
        const errs: string[] = [];
        if (!form.customerName.trim()) errs.push("Tên khách hàng không được để trống.");
        if (form.items.length === 0) errs.push("Cần ít nhất 1 sản phẩm.");
        form.items.forEach((item, i) => {
            if (!item.productId) errs.push(`Dòng ${i + 1}: chưa chọn sản phẩm.`);
            if (item.quantity <= 0) errs.push(`Dòng ${i + 1}: số lượng phải > 0.`);
        });
        return errs;
    };

    const handleSubmit = () => {
        const errs = validate();
        if (errs.length) { setErrors(errs); return; }
        setErrors([]);
        onSubmit(form);
    };

    const inp: React.CSSProperties = {
        width: "100%", padding: "8px 12px", border: "1px solid #d1d5db",
        borderRadius: 8, fontSize: 14, outline: "none", boxSizing: "border-box",
        transition: "border-color 0.2s",
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Row 1 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                    <label style={labelStyle}>Mã đơn hàng</label>
                    <input style={inp} placeholder="Auto nếu để trống" value={form.orderNo}
                        onChange={e => setField("orderNo", e.target.value)} />
                </div>
                <div>
                    <label style={labelStyle}>Trạng thái</label>
                    <select style={inp} value={form.status} onChange={e => setField("status", e.target.value)}>
                        {Object.keys(STATUS_CONFIG).map(s => <option key={s}>{s}</option>)}
                    </select>
                </div>
            </div>

            {/* Row 2 */}
            <div>
                <label style={labelStyle}>Tên khách hàng <span style={{ color: "#ef4444" }}>*</span></label>
                <input style={inp} placeholder="Nhập tên khách hàng" value={form.customerName}
                    onChange={e => setField("customerName", e.target.value)} />
            </div>

            <div>
                <label style={labelStyle}>Ghi chú</label>
                <textarea style={{ ...inp, resize: "vertical", minHeight: 64 }} placeholder="Ghi chú..."
                    value={form.note} onChange={e => setField("note", e.target.value)} />
            </div>

            {/* Items */}
            <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <label style={{ ...labelStyle, marginBottom: 0 }}>
                        Danh sách sản phẩm <span style={{ color: "#ef4444" }}>*</span>
                    </label>
                    <button onClick={addItem} style={btnOutline}>+ Thêm dòng</button>
                </div>

                <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ background: "#f9fafb" }}>
                                <th style={th}>#</th>
                                <th style={th}>Sản phẩm</th>
                                <th style={{ ...th, width: 120 }}>Số lượng</th>
                                <th style={{ ...th, width: 48 }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {form.items.map((item, idx) => (
                                <tr key={idx} style={{ borderTop: "1px solid #f0f0f0" }}>
                                    <td style={td}>{idx + 1}</td>
                                    <td style={td}>
                                        <select style={{ ...inp, marginBottom: 0 }} value={item.productId}
                                            onChange={e => setItem(idx, "productId", Number(e.target.value))}>
                                            <option value={0} disabled>-- Chọn sản phẩm --</option>
                                            {products.map(p => (
                                                <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                                            ))}
                                        </select>
                                    </td>
                                    <td style={td}>
                                        <input type="number" min={1} style={inp} value={item.quantity}
                                            onChange={e => setItem(idx, "quantity", Number(e.target.value))} />
                                    </td>
                                    <td style={{ ...td, textAlign: "center" }}>
                                        <button onClick={() => removeItem(idx)} style={{
                                            border: "none", background: "transparent", cursor: "pointer",
                                            color: "#ef4444", fontSize: 18, padding: "2px 6px",
                                        }}>×</button>
                                    </td>
                                </tr>
                            ))}
                            {form.items.length === 0 && (
                                <tr><td colSpan={4} style={{ ...td, textAlign: "center", color: "#9ca3af", padding: 20 }}>
                                    Chưa có sản phẩm nào
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Errors */}
            {errors.length > 0 && (
                <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "12px 16px" }}>
                    {errors.map((e, i) => <div key={i} style={{ color: "#dc2626", fontSize: 13 }}>• {e}</div>)}
                </div>
            )}

            {/* Actions */}
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 8 }}>
                <button onClick={onCancel} style={btnOutline}>Huỷ</button>
                <button onClick={handleSubmit} disabled={loading} style={btnPrimary}>
                    {loading ? "Đang lưu..." : initial ? "Cập nhật" : "Tạo đơn"}
                </button>
            </div>
        </div>
    );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────

function OrderDetail({ order, onClose }: { order: SalesOrderDto; onClose: () => void }) {
    return (
        <Modal title={`Chi tiết đơn hàng — ${order.orderNo || "#" + order.id}`} onClose={onClose}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                    {[
                        ["Khách hàng", order.customerName],
                        ["Ngày tạo", fmtDate(order.createdAt)],
                        ["Trạng thái", null],
                    ].map(([label, val], i) => (
                        <div key={i} style={{ background: "#f9fafb", borderRadius: 8, padding: "12px 16px" }}>
                            <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
                            {val !== null ? (
                                <div style={{ fontWeight: 600, color: "#111827" }}>{val || "—"}</div>
                            ) : (
                                <StatusBadge status={order.status} />
                            )}
                        </div>
                    ))}
                </div>

                {order.note && (
                    <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 8, padding: "12px 16px", fontSize: 14, color: "#92400e" }}>
                        📝 {order.note}
                    </div>
                )}

                <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ background: "#f9fafb" }}>
                                <th style={th}>#</th>
                                <th style={th}>Sản phẩm</th>
                                <th style={{ ...th, textAlign: "right" }}>Số lượng</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items.map((item, i) => (
                                <tr key={item.id} style={{ borderTop: "1px solid #f0f0f0" }}>
                                    <td style={{ ...td, color: "#9ca3af" }}>{i + 1}</td>
                                    <td style={td}>{item.productName}</td>
                                    <td style={{ ...td, textAlign: "right", fontWeight: 600 }}>{item.quantity.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </Modal>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const DashboardSale = () => {
    const [orders, setOrders] = useState<SalesOrderDto[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    const [modal, setModal] = useState<null | "create" | "edit" | "detail">(null);
    const [selected, setSelected] = useState<SalesOrderDto | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const fetchOrders = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.getOrders();
            setOrders(res.data);
        } catch {
            setError("Không thể tải danh sách đơn hàng.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
        api.getProducts().then(r => setProducts(r.data)).catch(() => { });
    }, [fetchOrders]);

    const filtered = orders.filter(o => {
        const matchSearch =
            !search ||
            o.orderNo?.toLowerCase().includes(search.toLowerCase()) ||
            o.customerName?.toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === "All" || o.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const handleCreate = async (data: SalesOrderRequest) => {
        try {
            setSaving(true);
            await api.createOrder(data);
            await fetchOrders();
            setModal(null);
        } catch (e: any) {
            setError(e.response?.data ?? "Tạo đơn thất bại.");
        } finally {
            setSaving(false);
        }
    };

    const handleUpdate = async (data: SalesOrderRequest) => {
        if (!selected) return;
        try {
            setSaving(true);
            await api.updateOrder(selected.id, data);
            await fetchOrders();
            setModal(null);
        } catch (e: any) {
            setError(e.response?.data ?? "Cập nhật thất bại.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await api.deleteOrder(deleteId);
            await fetchOrders();
            setDeleteId(null);
        } catch {
            setError("Xoá đơn thất bại.");
        }
    };

    return (
        <div style={{ fontFamily: "'Inter', sans-serif", padding: "28px 32px", minHeight: "100vh", background: "#f8fafc" }}>
            <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        button:hover { opacity: 0.88; }
        input:focus, select:focus, textarea:focus { border-color: #1d4ed8 !important; box-shadow: 0 0 0 3px #1d4ed820; }
        tr:hover td { background: #f0f7ff; }
      `}</style>

            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#0f172a" }}>Sales Orders</h1>
                    <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: 14 }}>
                        {filtered.length} đơn hàng{search || statusFilter !== "All" ? " (đã lọc)" : ""}
                    </p>
                </div>
                <button onClick={() => { setSelected(null); setModal("create"); }} style={btnPrimary}>
                    + Tạo đơn hàng
                </button>
            </div>

            {/* Filters */}
            <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
                <input
                    style={{
                        padding: "9px 14px", border: "1px solid #e2e8f0", borderRadius: 8,
                        fontSize: 14, width: 280, outline: "none",
                    }}
                    placeholder="🔍  Tìm theo mã, khách hàng..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <select
                    style={{
                        padding: "9px 14px", border: "1px solid #e2e8f0", borderRadius: 8,
                        fontSize: 14, outline: "none", background: "#fff",
                    }}
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                >
                    <option value="All">Tất cả trạng thái</option>
                    {Object.keys(STATUS_CONFIG).map(s => <option key={s}>{s}</option>)}
                </select>
            </div>

            {/* Error banner */}
            {error && (
                <div style={{
                    background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8,
                    padding: "12px 16px", marginBottom: 16, color: "#dc2626", fontSize: 14,
                    display: "flex", justifyContent: "space-between",
                }}>
                    {error}
                    <button onClick={() => setError(null)} style={{ border: "none", background: "none", cursor: "pointer", color: "#dc2626", fontWeight: 700 }}>×</button>
                </div>
            )}

            {/* Table */}
            <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                {loading ? <Spinner /> : (
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                                <th style={th}>Mã đơn</th>
                                <th style={th}>Khách hàng</th>
                                <th style={th}>Sản phẩm</th>
                                <th style={th}>Trạng thái</th>
                                <th style={th}>Ngày tạo</th>
                                <th style={{ ...th, textAlign: "right" }}>Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} style={{ textAlign: "center", padding: 48, color: "#94a3b8" }}>
                                        Không có đơn hàng nào
                                    </td>
                                </tr>
                            ) : filtered.map(order => (
                                <tr key={order.id} style={{ borderTop: "1px solid #f1f5f9", cursor: "default", transition: "background 0.15s" }}>
                                    <td style={{ ...td, fontWeight: 600, color: "#1d4ed8" }}>
                                        {order.orderNo || `#${order.id}`}
                                    </td>
                                    <td style={td}>{order.customerName || "—"}</td>
                                    <td style={{ ...td, color: "#64748b" }}>
                                        {order.items.length} sản phẩm
                                    </td>
                                    <td style={td}><StatusBadge status={order.status} /></td>
                                    <td style={{ ...td, color: "#64748b" }}>{fmtDate(order.createdAt)}</td>
                                    <td style={{ ...td, textAlign: "right" }}>
                                        <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                                            <button onClick={() => { setSelected(order); setModal("detail"); }} style={btnSm("#1d4ed8")}>Chi tiết</button>
                                            <button onClick={() => { setSelected(order); setModal("edit"); }} style={btnSm("#059669")}>Sửa</button>
                                            <button onClick={() => setDeleteId(order.id)} style={btnSm("#dc2626")}>Xoá</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Create Modal */}
            {modal === "create" && (
                <Modal title="Tạo đơn hàng mới" onClose={() => setModal(null)}>
                    <OrderForm products={products} onSubmit={handleCreate} onCancel={() => setModal(null)} loading={saving} />
                </Modal>
            )}

            {/* Edit Modal */}
            {modal === "edit" && selected && (
                <Modal title={`Chỉnh sửa — ${selected.orderNo || "#" + selected.id}`} onClose={() => setModal(null)}>
                    <OrderForm initial={selected} products={products} onSubmit={handleUpdate} onCancel={() => setModal(null)} loading={saving} />
                </Modal>
            )}

            {/* Detail Modal */}
            {modal === "detail" && selected && (
                <OrderDetail order={selected} onClose={() => setModal(null)} />
            )}

            {/* Delete Confirm */}
            {deleteId !== null && (
                <div style={{ position: "fixed", inset: 0, zIndex: 1100, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ background: "#fff", borderRadius: 12, padding: 28, width: 360, boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
                        <div style={{ fontSize: 40, textAlign: "center", marginBottom: 12 }}>🗑️</div>
                        <h3 style={{ textAlign: "center", margin: "0 0 8px", color: "#0f172a" }}>Xác nhận xoá</h3>
                        <p style={{ textAlign: "center", color: "#64748b", fontSize: 14, marginBottom: 24 }}>
                            Đơn hàng và toàn bộ sản phẩm trong đơn sẽ bị xoá vĩnh viễn.
                        </p>
                        <div style={{ display: "flex", gap: 10 }}>
                            <button onClick={() => setDeleteId(null)} style={{ ...btnOutline, flex: 1 }}>Huỷ</button>
                            <button onClick={handleDelete} style={{ ...btnPrimary, flex: 1, background: "#dc2626" }}>Xoá</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DashboardSale;

// ─── Styles ───────────────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
    display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6,
};

const th: React.CSSProperties = {
    padding: "12px 16px", textAlign: "left", fontSize: 12,
    fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5,
};

const td: React.CSSProperties = {
    padding: "13px 16px", fontSize: 14, color: "#1e293b", verticalAlign: "middle",
};

const btnPrimary: React.CSSProperties = {
    padding: "9px 20px", background: "#1d4ed8", color: "#fff",
    border: "none", borderRadius: 8, fontWeight: 600, fontSize: 14, cursor: "pointer",
};

const btnOutline: React.CSSProperties = {
    padding: "7px 16px", background: "#fff", color: "#374151",
    border: "1px solid #d1d5db", borderRadius: 8, fontWeight: 500, fontSize: 13, cursor: "pointer",
};

const btnSm = (color: string): React.CSSProperties => ({
    padding: "5px 12px", background: `${color}15`, color: color,
    border: `1px solid ${color}30`, borderRadius: 6, fontWeight: 600,
    fontSize: 12, cursor: "pointer",
});