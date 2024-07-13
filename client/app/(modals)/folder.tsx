import React, { useState, useEffect } from 'react';
import { View, Text, Button, TouchableOpacity, StyleSheet, ScrollView, TextInput, Image } from "react-native";
import AwesomeAlert from "react-native-awesome-alerts";
import { useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from "../_layout";
import { useSelector, useDispatch } from "react-redux";
import { selectUser } from '../../redux/reducers/user';
import { setFolderId, setFolderName } from '../../redux/reducers/folder';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';
import logo from '../../assets/images/folder.png';

const Folder = () => {
    const navigation = useNavigation<RootStackNavigationProp>();
    const dispatch = useDispatch();

    const user = useSelector(selectUser);
    const [userFolders, setUserFolders] = useState([]);
    const [sharedFolders, setSharedFolders] = useState([]);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [folderToDelete, setFolderToDelete] = useState('');
    const [newFolderName, setNewFolderName] = useState('');
    const [showNameEmptyAlert, setShowNameEmptyAlert] = useState(false);
    const [filter, setFilter] = useState('yourFolders'); // State for filter

    useEffect(() => {
        if (user) {
            getFolders(user.email);
        }
    }, [user]);

    const getFolders = async (email) => {
        try {
            const response = await fetch(`http://localhost:8000/folders/getAll/${email}`);
            const data = await response.json();
            setUserFolders(data.userFolders);
            setSharedFolders(data.sharedFolders);
        } catch (error) {
            console.error(error);
        }
    };

    const handleAddFolder = async () => {
        try {
            if (!newFolderName.trim()) {
                setShowNameEmptyAlert(true);
                return;
            }

            const response = await fetch('http://localhost:8000/folders/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userEmail: user.email,
                    folderName: newFolderName,
                }),
            });
            if (response.ok) {
                const data = await response.json();
                setUserFolders([...userFolders, data]);
                setNewFolderName('');
            } else {
                console.error('Failed to create folder');
            }
        } catch (error) {
            console.error('Error creating folder:', error);
        }
    };

    const getFolderId = async (folderName) => {
        try {
            const response = await fetch(`http://localhost:8000/folders/getId/${folderName}`);
            const data = await response.json();
            return data.folder_id;
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteFolder = async () => {
        try {
            const folderId = await getFolderId(folderToDelete);
            const response = await fetch(`http://localhost:8000/folders/delete/${folderId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                setUserFolders(userFolders.filter(folder => folder.folder_id !== folderId));
            } else {
                console.error('Failed to delete folder');
            }
            setShowDeleteConfirm(false);
        } catch (error) {
            console.error(error);
        }
    };

    const confirmDeleteFolder = (folderName) => {
        setFolderToDelete(folderName);
        setShowDeleteConfirm(true);
    };

    const handleSelectFolder = async (folderName) => {
        const folderId = await getFolderId(folderName);
        dispatch(setFolderId(folderId));
        dispatch(setFolderName(folderName));
        navigation.navigate('(modals)/wall');
    };

    const handleSettings = async (folderName) => {
        const folderId = await getFolderId(folderName);
        dispatch(setFolderId(folderId));
        dispatch(setFolderName(folderName));
        navigation.navigate('(modals)/setting', { folderId });
    };

    return (
        user ? (
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>Domus</Text>
                    <View style={styles.underline} />
                </View>
                <View style={styles.addContainer}>
                    <TextInput
                        style={styles.folderInput}
                        placeholder="Enter folder name..."
                        placeholderTextColor={Colors.primaryColor}
                        value={newFolderName}
                        onChangeText={text => setNewFolderName(text)}
                    />
                    <TouchableOpacity style={styles.addButton} onPress={handleAddFolder}>
                        <Text style={styles.addButtonText}>Add Folder</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.filterContainer}>
                    <TouchableOpacity
                        style={[styles.filterButton, filter === 'yourFolders' && styles.activeFilterButton]}
                        onPress={() => setFilter('yourFolders')}
                    >
                        <Text style={[styles.filterButtonText, filter === 'yourFolders' && styles.activeFilterButtonText]}>Yours</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterButton, filter === 'sharedFolders' && styles.activeFilterButton]}
                        onPress={() => setFilter('sharedFolders')}
                    >
                        <Text style={[styles.filterButtonText, filter === 'sharedFolders' && styles.activeFilterButtonText]}>Shared</Text>
                    </TouchableOpacity>
                </View>
                
                <ScrollView style={styles.folderListContainer}>
                    <View style={styles.foldersRow}>
                        {filter === 'yourFolders' && userFolders.map((folder, index) => (
                            <View key={index} style={styles.folderContainer}>
                                <Image source={logo} style={styles.folderImage} />
                                <Text onPress={() => handleSelectFolder(folder.folder_name)} style={styles.folderName}>{folder.folder_name}</Text>
                                <View style={styles.actionContainer}>
                                    <TouchableOpacity onPress={() => confirmDeleteFolder(folder.folder_name)}>
                                        <Text style={styles.deleteButton}>Delete</Text>
                                    </TouchableOpacity>
                                    {folder.user_email === user.email && (
                                        <TouchableOpacity onPress={() => handleSettings(folder.folder_name)}>
                                            <Text style={styles.settingsButton}>Setting</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        ))}
                        {filter === 'sharedFolders' && sharedFolders.map((folder, index) => (
                            <View key={index} style={styles.folderContainer}>
                                <Image source={logo} style={styles.folderImage} />
                                <Text onPress={() => handleSelectFolder(folder.folder_name)} style={styles.folderName}>{folder.folder_name}</Text>
                            </View>
                        ))}
                    </View>
                </ScrollView>

                <AwesomeAlert
                    show={showNameEmptyAlert}
                    showProgress={false}
                    title="Empty Folder Name"
                    message="Folder name cannot be empty. Please enter a valid name."
                    closeOnTouchOutside={true}
                    closeOnHardwareBackPress={false}
                    showConfirmButton={true}
                    confirmText="OK"
                    confirmButtonColor="#DD6B55"
                    onConfirmPressed={() => setShowNameEmptyAlert(false)}
                />

                <AwesomeAlert
                    show={showDeleteConfirm}
                    showProgress={false}
                    title="Confirm Delete"
                    message="Are you sure you want to delete this folder?"
                    closeOnTouchOutside={true}
                    closeOnHardwareBackPress={false}
                    showConfirmButton={true}
                    showCancelButton={true}
                    confirmText="Yes, delete it"
                    cancelText="No, keep it"
                    confirmButtonColor="#DD6B55"
                    onConfirmPressed={handleDeleteFolder}
                    onCancelPressed={() => setShowDeleteConfirm(false)}
                />
            </ScrollView>
        ) : (
            <View style={styles.noUserContainer}>
                <Text style={styles.noUserText}>No User Found Error...</Text>
            </View>
        )
    );
};

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    titleContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.primaryColor,
    },
    underline: {
        height: 0.1,  
        width: '150%', 
        backgroundColor: Colors.primaryColor,
        marginTop: 2,
    },
    addContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    addButton: {
        height: 40,
        backgroundColor: Colors.secondaryColor,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 16,
        borderRadius: 8,
        marginLeft: 8,
    },
    addButtonText: {
        color: Colors.primaryColor,
    },
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    filterButton: {
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.primaryColor,
        marginHorizontal: 5,
    },
    activeFilterButton: {
        backgroundColor: '#808080',
    },
    filterButtonText: {
        color: Colors.primaryColor,
        fontSize: 10,
    },
    activeFilterButtonText: {
        color: '#fff',
    },
    actionContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    folderListContainer: {
        maxHeight: 400, // Adjust the height as needed
        marginBottom: 20,
    },
    foldersRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
    },
    folderContainer: {
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        marginTop: 10,
        backgroundColor: 'transparent',
    },
    folderImage: {
        width: 75,
        height: 75,
    },
    folderName: {
        fontSize: 16,
        color: Colors.primaryColor,
    },
    deleteButton: {
        color: '#808080',
    },
    settingsButton: {
        color: '#808080',
        marginLeft: 10,
    },
    folderInput: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 8,
        paddingLeft: 8,
        color: Colors.primaryColor,
    },
    noUserContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    noUserText: {
        color: Colors.primaryColor,
    },
});

export default Folder;