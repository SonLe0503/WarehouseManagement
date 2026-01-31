import { Navigate } from "react-router-dom";
import { useAppSelector } from "../store";
import { selectIsLogin } from "../store/authSlide";
import URL from "../constants/url";
import type { ReactNode } from "react";

const PrivateLayout = ({ children }: { children: ReactNode }) => {
    const isLogin = useAppSelector(selectIsLogin);
    return isLogin ? <>{children}</> : <Navigate to={URL.Login} replace />;
};

export default PrivateLayout;
