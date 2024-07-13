import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./reducers/user";
import folderReducer from "./reducers/folder";

const store = configureStore({
  reducer: {
    user: userReducer,
    folder: folderReducer,
  },
});

export default store;
