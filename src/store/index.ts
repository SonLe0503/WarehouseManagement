import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";

import authSlide from "./authSlide";
import userSlide from "./userSlide";
import roleSlide from "./roleSlide";
import categorySlide from "./categorySlide";
import unitSlide from "./unitSlide";
import productSlide from "./productSlice";
import inboundRequestSlide from "./inboundRequestSlide";
import outboundRequestSlide from "./outboundRequestSlide";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, type TypedUseSelectorHook } from "react-redux";

const persistConfig = {
  key: "auth",
  storage,
  whitelist: ["infoLogin", "isLogin"],
};

const reducers = {
  auth: persistReducer(persistConfig, authSlide),
  user: userSlide,
  role: roleSlide,
  category: categorySlide,
  unit: unitSlide,
  product: productSlide,
  inboundRequest: inboundRequestSlide,
  outboundRequest: outboundRequestSlide,
}
const rootReducer = combineReducers(reducers);
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;