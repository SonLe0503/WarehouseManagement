import type { IProduct } from "../store/productSlice";
import type { IUnit } from "../store/unitSlide";
import type { IUnitConversion } from "../store/unitConversionSlice";

/**
 * Lấy danh sách các đơn vị khả dụng cho một sản phẩm (đơn vị gốc + các đơn vị đã cấu hình chuyển đổi)
 */
export const getUnitsForProduct = (
    productId: number,
    products: IProduct[],
    allUnits: IUnit[],
    conversions: IUnitConversion[]
) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return [];

    // Chỉ trả về đơn vị gốc và các đơn vị đã có cấu hình chuyển đổi cho sản phẩm này
    return allUnits
        .filter((unit) => {
            const isBase = unit.id === product.baseUnitId;
            const hasConversion = conversions.some(
                (c) => c.productId === productId && c.fromUnitId === unit.id
            );
            return isBase || hasConversion;
        })
        .map((unit) => {
            const isBase = unit.id === product.baseUnitId;
            const conv = conversions.find(
                (c) => c.productId === productId && c.fromUnitId === unit.id
            );

            let label = unit.name;
            if (isBase) {
                label += " (gốc)";
            } else if (conv) {
                label += ` (×${conv.conversionFactor ?? conv.rate} ${product.baseUnitCode})`;
            }

            return {
                value: unit.id,
                label: label,
            };
        });
};
