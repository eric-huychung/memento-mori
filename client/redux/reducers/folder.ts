import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface FolderState {
    folderId: string | null;
    folderName: string | null;
}

const initialState: FolderState = {
    folderId: null,
    folderName: null,
};

export const folderSlice = createSlice({
    name: "folder",
    initialState,
    reducers: {
        setFolderId: (state, action: PayloadAction<string | null>) => {
            state.folderId = action.payload;
        },
        clearFolderId: (state) => {
            state.folderId = null;
        },
        setFolderName: (state, action: PayloadAction<string | null>) => {
            state.folderName = action.payload;
        },
        clearFolderName: (state) => {
            state.folderName = null;
        },
    }
});

export const { setFolderId, clearFolderId } = folderSlice.actions;

export const { setFolderName, clearFolderName } = folderSlice.actions;

export const selectFolderId = (state: { folder: FolderState }) => state.folder.folderId;

export const selectFolderName = (state: { folder: FolderState }) => state.folder.folderName;

export default folderSlice.reducer;
