import { Layout } from "antd"
import Sidebar from "../app/components/sidebar";
import HeaderBar from "../app/components/header";
import type { JSX } from "react";

const { Content } = Layout;

interface DefaultLayoutProps {
    children: JSX.Element;
}

const DashboardLayout = ({ children }: DefaultLayoutProps) => {
    return (
        <Layout className="min-h-screen">
            <Sidebar />
            <Layout>
                <HeaderBar />
                <Content className="m-4 p-6 bg-white rounded-xl shadow">
                    {children}
                </Content>
            </Layout>
        </Layout>
    )
}
export default DashboardLayout