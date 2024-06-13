import React, { useState } from 'react';
import { View, Text, TextInput, Button } from "react-native";
import { useSelector } from "react-redux";
import { selectUser } from '../redux/reducers/user';

const FolderForm = () => {
    const user = useSelector(selectUser);
    const [folderName, setFolderName] = useState('');

    const handleFolderNameChange = (text) => {
        setFolderName(text);
    };

    const handleSubmit = () => {
        // Logic to handle form submission goes here
        console.log('Folder Name:', folderName);
        // You can add additional logic such as dispatching an action to Redux to create the folder
        addForm(folderName);
    };

    const addForm = async (folderName): Promise<void> => {
        try {
            const response = await fetch('http://localhost:8000/folders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userEmail: user.email,
                    folderName,
                }),
            });
            const data = await response.json();
            console.log(data);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <View>
            <Text>Create New Folder</Text>
            <TextInput
                style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginBottom: 10 }}
                onChangeText={handleFolderNameChange}
                value={folderName}
                placeholder="Enter folder name"
            />
            <Button title="Create Folder" onPress={handleSubmit} />
        </View>
    );
};

export default FolderForm;
