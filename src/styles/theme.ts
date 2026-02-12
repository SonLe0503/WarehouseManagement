import type { ThemeConfig } from "antd";

const theme: ThemeConfig = {
    token: {
        fontFamily: '"Noto Sans KR", sans-serif',
        colorPrimary: '#1677ff', // Màu mặc định của Antd
        borderRadius: 8,
    },
    components: {
        Button: {
            fontWeight: 600,
            controlHeight: 38,
        },
        Input: {
            controlHeight: 38,
        },
        Select: {
            controlHeight: 38,
        },
        Table: {
            headerBg: '#f8fafc',
            headerColor: '#64748b',
        }
    }
};

export default theme;
