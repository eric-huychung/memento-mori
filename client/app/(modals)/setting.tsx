import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import AwesomeAlert from 'react-native-awesome-alerts';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { selectFolderId, selectFolderName } from '../../redux/reducers/folder';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';

interface Permission {
    user_email: string;
}

const Settings = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const dispatch = useDispatch();

    const folderId = useSelector(selectFolderId);
    const folderName = useSelector(selectFolderName);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [userEmail, setUserEmail] = useState<string>('');
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState<string>('');

    useEffect(() => {
        if (folderId) {
            getPermissions(folderId);
        }
    }, [folderId]);

    const getPermissions = async (folderId: string) => {
        try {
            const response = await fetch(`http://localhost:8000/permissions/get/${folderId}`);
            const data = await response.json();
            if (Array.isArray(data)) {
                setPermissions(data);
            } else {
                setPermissions([]);
            }
        } catch (error) {
            console.error('Error fetching permissions:', error);
            setPermissions([]); // Handle error state
        }
    };

    const handleAddPermission = async () => {
        try {
            // Check if permission already exists
            const checkResponse = await fetch('http://localhost:8000/permissions/check', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    folderId,
                    userEmail,
                }),
            });

            if (checkResponse.status === 409) {
                const { message } = await checkResponse.json();
                setAlertMessage(message);
                setShowAlert(true);
                return;
            }

            // If permission does not exist, add it
            const addResponse = await fetch('http://localhost:8000/permissions/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    folderId,
                    userEmail,
                }),
            });

            if (addResponse.ok) {
                const data = await addResponse.json();
                setPermissions([...permissions, data]);
                setUserEmail('');
            } else {
                console.error('Failed to add permission');
            }
        } catch (error) {
            console.error('Error adding permission:', error);
        }
    };

    const handleDeletePermission = async (userEmail: string) => {
        try {
            const response = await fetch('http://localhost:8000/permissions/delete', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    folderId,
                    userEmail,
                }),
            });
            if (response.ok) {
                setPermissions(permissions.filter(permission => permission.user_email !== userEmail));
            } else {
                console.error('Failed to delete permission');
            }
        } catch (error) {
            console.error('Error deleting permission:', error);
        }
    };

    return (
        <LinearGradient
        colors={['#2C3137', '#17191D']}
        style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollViewContainer}>
                <View style={styles.container}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>Permissions</Text>
                        <View style={styles.underline} />
                    </View>

                    <View style={styles.addContainer}>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter user email..."
                            value={userEmail}
                            onChangeText={setUserEmail}
                        />
                        <TouchableOpacity style={styles.addButton} onPress={handleAddPermission}>
                            <Text style={styles.addButtonText}>Submit</Text>
                        </TouchableOpacity>
                    </View>
                    
                    {permissions.map((permission, index) => (
                        <View key={index} style={styles.permissionContainer}>
                            <Text style={styles.text}>{permission.user_email}</Text>
                            <TouchableOpacity onPress={() => handleDeletePermission(permission.user_email)}>
                                <Text style={styles.deleteButton}>Remove</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                    
                    <AwesomeAlert
                        show={showAlert}
                        showProgress={false}
                        title="Permission Conflict"
                        message={alertMessage}
                        closeOnTouchOutside={true}
                        closeOnHardwareBackPress={false}
                        showConfirmButton={true}
                        confirmText="OK"
                        confirmButtonColor="#DD6B55"
                        onConfirmPressed={() => setShowAlert(false)}
                    />
                </View>
            </ScrollView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    scrollViewContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleContainer: {
        alignItems: 'center',
        marginBottom: 16,
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
    text: {
        color: Colors.primaryColor,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: Colors.primaryColor,
    },
    underline: {
        height: 0.1,  
        width: '120%', 
        backgroundColor: Colors.primaryColor,
        marginTop: 2,
    },
    permissionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        width: '100%',
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 8,
        paddingLeft: 8,
        color: Colors.primaryColor,
    },
    deleteButton: {
        color: 'red',
    },
});

export default Settings;
