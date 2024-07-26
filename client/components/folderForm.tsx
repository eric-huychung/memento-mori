import React, { useState } from 'react';
import { View, Text, TextInput, Button } from "react-native";
import { useSelector } from "react-redux";
import { selectUser } from '../redux/reducers/user';

interface User {
    name: string;
    email: string;
}

const FolderForm = () => {
    const user = useSelector(selectUser) as User;
    const [folderName, setFolderName] = useState<string>('');

    const handleFolderNameChange = (text: string) => {
        setFolderName(text);
    };

    const handleSubmit = () => {
        console.log('Folder Name:', folderName);
        addForm(folderName);
    };

    const addForm = async (folderName: string): Promise<void> => {
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
