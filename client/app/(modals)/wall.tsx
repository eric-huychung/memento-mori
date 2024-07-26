import React, { useState, useEffect } from 'react';
import { View, Text, Button, TouchableOpacity, StyleSheet, Image, ScrollView, TextInput } from "react-native";
import AwesomeAlert from "react-native-awesome-alerts";
import { useSelector } from "react-redux";
import { selectFolderId, selectFolderName } from '../../redux/reducers/folder';
import { launchImageLibrary } from 'react-native-image-picker';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';

interface Bubble {
    image: string;
    description: string;
}

const Wall = () => {
    const folderId = useSelector(selectFolderId) || '';
    const folderName = useSelector(selectFolderName);

    const [bubbles, setBubbles] = useState<Bubble[]>([]);
    const [description, setDescription] = useState<string>('');
    const [showAlert, setShowAlert] = useState<boolean>(false); // State to manage alert visibility
    const [alertMessage, setAlertMessage] = useState<string>(''); // State to manage alert message
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);  // State to manage delete confirmation alert
    const [descriptionToDelete, setDescriptionToDelete] = useState<string>('');  // State to store description to delete

    useEffect(() => {
        getBubbles(folderId);
    }, [folderId]);

    const getBubbles = async (folderId: string) => {
        try {
            const response = await fetch(`http://localhost:8000/bubbles/getBubbles/${folderId}`);
            const data = await response.json();
            if (Array.isArray(data)) {
                setBubbles(data);
                console.log(data);
            } else {
                console.error('Expected an array of bubbles');
            }
        } catch (error) {
            console.error('Error fetching bubbles:', error);
        }
    }

    const handleAddPicture = () => {
        checkDescriptionUnique(description).then(isUnique => {
            if (isUnique) {
                launchImageLibrary({ mediaType: 'photo', quality: 1 }, async (response) => {
                    if (response.didCancel) {
                        console.log('User cancelled image picker');
                    } else if (response.errorCode) {
                        console.log('ImagePicker Error: ', response.errorCode);
                        console.log('Error Message: ', response.errorMessage);
                    } else if (response.assets && response.assets.length > 0) {
                        const image = response.assets[0];
                        try {
                            if (image.uri) {  // Check if uri is defined
                                try {
                                    const base64String = await convertImageToBase64(image.uri);
                                    const requestData = {
                                        picture: base64String,
                                        id: folderId,
                                        description: description,
                                    };
        
                                    const res = await axios.post('http://localhost:8000/bubbles/upload', requestData);
                                    console.log('Image uploaded successfully', res.data);
                                    getBubbles(folderId); // Refresh the list of bubbles
                                    setDescription(''); // Clear input field after upload
                                } catch (error) {
                                    console.error('Error uploading image:', error);
                                }
                            } else {
                                console.log('Image URI is undefined');
                            }
                        } catch (error) {
                            console.error('Error uploading image:', error);
                        }
                    } else {
                        console.log('No assets found in response');
                    }
                });
            } else {
                setAlertMessage('Description is not unique!');  // Set the alert message
                setShowAlert(true);  // Show the alert
            }
        });
    };

    const checkDescriptionUnique = async (description: string) => {
        try {
            const response = await axios.post('http://localhost:8000/bubbles/check-description', { description });
            return response.data.unique;
        } catch (error) {
            console.error('Error checking description:', error);
            return false;
        }
    };

    const convertImageToBase64 = async (imageUri: string) => {
        return new Promise((resolve, reject) => {
            fetch(imageUri)
                .then((response) => response.blob())
                .then((blob) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                        if (reader.result) {
                            resolve((reader.result as string).split(',')[1]);
                        } else {
                            reject(new Error('Failed to read file'));
                        }
                    };
                    reader.onerror = (error) => reject(error);
                    reader.readAsDataURL(blob);
                })
                .catch((error) => reject(error));
        });
    };

    const handleDeleteBubble = async (description: string) => {
        try {
            const res = await axios.delete('http://localhost:8000/bubbles/delete-by-description', { data: { description } });
            console.log(res.data.message);
            getBubbles(folderId); // Refresh the list of bubbles
        } catch (error) {
            console.error('Error deleting bubble:', error);
        }
    };

    const confirmDeleteBubble = (description: string) => {
        setDescriptionToDelete(description);
        setShowDeleteConfirm(true);  // Show the confirmation alert
    };

    const handleConfirmDelete = () => {
        handleDeleteBubble(descriptionToDelete);
        setShowDeleteConfirm(false);  // Hide the confirmation alert
    };

    return (
        <LinearGradient
        colors={['#2C3137', '#17191D']}
        style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollViewContainer}>
                <View style={styles.container}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>{folderName}</Text>
                        <View style={styles.underline} />
                    </View>

                    <View style={styles.addContainer}>
                        <TextInput
                            style={styles.descriptionInput}
                            placeholder="Enter description..."
                            value={description}
                            onChangeText={text => setDescription(text)}
                        />

                        <TouchableOpacity style={styles.addButton} onPress={handleAddPicture}>
                            <Text style={styles.addButtonText}>Add Pictures</Text>
                        </TouchableOpacity>
                    </View>
                        
                    {bubbles.map((bubble, index) => (
                        <View key={index} style={styles.imageContainer}>
                            <Image
                                source={{ uri: bubble.image }}
                                style={styles.image}
                            />
                            <Text style={styles.text}>{bubble.description}</Text>

                            <TouchableOpacity onPress={() => confirmDeleteBubble(bubble.description)}>
                                <Text style={styles.deleteButton}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    ))}

                    
                    
                    <AwesomeAlert
                        show={showAlert}
                        showProgress={false}
                        title="Error"
                        message={alertMessage}  // Use the state variable for the message
                        closeOnTouchOutside={true}
                        closeOnHardwareBackPress={false}
                        showConfirmButton={true}
                        confirmText="OK"
                        confirmButtonColor="#DD6B55"
                        onConfirmPressed={() => setShowAlert(false)}
                    />

                    <AwesomeAlert
                        show={showDeleteConfirm}
                        showProgress={false}
                        title="Confirm Delete"
                        message="Are you sure you want to delete this bubble?"
                        closeOnTouchOutside={true}
                        closeOnHardwareBackPress={false}
                        showConfirmButton={true}
                        showCancelButton={true}
                        confirmText="Yes, delete it"
                        cancelText="No, keep it"
                        confirmButtonColor="#DD6B55"
                        onConfirmPressed={handleConfirmDelete}
                        onCancelPressed={() => setShowDeleteConfirm(false)}
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
        width: '120%', 
        backgroundColor: Colors.primaryColor,
        marginTop: 2,
    },
    text: {
        color: Colors.primaryColor,
        fontSize: 12,
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
    addContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    imageContainer: {
        marginBottom: 20,
        alignItems: 'center',
    },
    image: {
        width: 200,
        height: 200,
        marginBottom: 10,
        borderRadius: 8,
        //boxShadow: 'rgba(0, 0, 0, 0.25) 0px 14px 28px, rgba(0, 0, 0, 0.22) 0px 10px 10px',
        //borderWidth: 1,
        //borderColor: 'red',
    },
    deleteButton: {
        color: 'red',
    },
    descriptionInput: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 8,
        paddingLeft: 8,
        color: Colors.primaryColor,
    },
});

export default Wall;