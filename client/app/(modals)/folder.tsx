import React, { useState, useEffect } from 'react';
import { View, Text, Button, TouchableOpacity, StyleSheet } from "react-native";
import { useSelector } from "react-redux";
import { selectUser } from '../../redux/reducers/user';
import FolderForm from "../../components/folderForm";

const Folder = () => {
    const user = useSelector(selectUser);
    const [showFolderForm, setShowFolderForm] = useState(false);
    const [folders, setFolders] = useState([]);

    useEffect(() => {
        if (user) {
            getForms(user.email);
        }
    }, [user]);

    const getForms = async (email) => {
        try {
            const response = await fetch(`http://localhost:8000/folders/getAll/${email}`);
            const data = await response.json();
            setFolders(data); // Set the fetched folders
        } catch (error) {
            console.error(error);
            // Handle error
        }
    };

    const handleAddFolder = () => {
        setShowFolderForm(true); 
    };

    const getFolderId = async (folderName) => {
        try {
            const response = await fetch(`http://localhost:8000/folders/getId/${folderName}`);
            const data = await response.json();
            return data.folder_id;
        } catch (error) {
            console.error(error);
            // Handle error
        }
    }

    const handleDeleteFolder = async (folderName) => {
        try {
            //console.log(folders);
            //console.log("folder name: "+ folderName);
            const folderId = await getFolderId(folderName);
            //console.log("folder id: "+ folderId);
            const response = await fetch(`http://localhost:8000/folders/delete/${folderId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                setFolders(folders.filter(folder => folder.id !== folderId));
            } else {
                console.error('Failed to delete folder');
            }
        } catch (error) {
            console.error(error);
            // Handle error
        }
    };

    return (
        user ? (
            <View>
                <Text>{user.name}</Text>
                <Text>{user.email}</Text>
                <Text>List of Folders</Text>
                {folders.map((folder, index) => (
                    <View key={index} style={styles.folderContainer}>
                        <Text>{folder.folder_name}</Text>
                        <TouchableOpacity onPress={() => handleDeleteFolder(folder.folder_name)}>
                            <Text style={styles.deleteButton}>Delete</Text>
                        </TouchableOpacity>
                    </View>
                ))}
                <Button title="Add Folder" onPress={handleAddFolder} />
                {showFolderForm && <FolderForm />}
            </View>
        ) : (
            <View>
                <Text>No User Found Error...</Text>
            </View>
        )
    );
};

const styles = StyleSheet.create({
    folderContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderColor: '#ccc',
    },
    deleteButton: {
        color: 'red',
    },
});

export default Folder;
