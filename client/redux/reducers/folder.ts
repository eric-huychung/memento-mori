// redux/reducers/folder.js
import { createSlice } from "@reduxjs/toolkit";

export const folderSlice = createSlice({
    name: "folder",
    initialState: {
        folderId: null,
        folderName: null,
    },
    reducers: {
        setFolderId: (state, action) => {
            state.folderId = action.payload;
        },
        clearFolderId: (state) => {
            state.folderId = null;
        },
        setFolderName: (state, action) => {
            state.folderName = action.payload;
        },
        clearFolderName: (state) => {
            state.folderName = null;
        },
    }
});

export const { setFolderId, clearFolderId } = folderSlice.actions;

export const { setFolderName, clearFolderName } = folderSlice.actions;

export const selectFolderId = (state) => state.folder.folderId;

export const selectFolderName = (state) => state.folder.folderName;

export default folderSlice.reducer;
