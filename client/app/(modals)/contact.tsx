import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TextInput, StyleSheet, Button, TouchableOpacity, Image } from "react-native";
import AwesomeAlert from "react-native-awesome-alerts";
import { useSelector } from "react-redux";
import { selectUser } from '../../redux/reducers/user';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';

const Contact = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [friends, setFriends] = useState([]);
    const [friendToDelete, setFriendToDelete] = useState('');
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    const user = useSelector(selectUser);

    useEffect(() => {
        fetchFriends();
    }, []);

    const fetchFriends = async () => {
        try {
            const response = await fetch(`http://localhost:8000/friends/friends/${user.email}`);
            const data = await response.json();
            if (response.ok) {
                setFriends(data.friends);
                console.log('Friends data:', data.friends); // Check the data structure
            } else {
                setAlertMessage('Failed to fetch friends');
                setShowAlert(true);
            }
        } catch (error) {
            console.error('Error fetching friends:', error);
            setAlertMessage('Error fetching friends');
            setShowAlert(true);
        }
    };

    const handleSearch = (query) => {
        setSearchQuery(query);
    };

    const handleAddFriend = async () => {
        try {
            const emailResponse = await fetch(`http://localhost:8000/checks/email/${searchQuery}`);
            const emailData = await emailResponse.json();

            if (emailData.exists) {
                const friendshipResponse = await fetch(`http://localhost:8000/friends/friendship/${user.email}/${searchQuery}`);
                const friendshipData = await friendshipResponse.json();

                if (friendshipData.exists) {
                    setAlertMessage('Friendship already exists');
                } else {
                    const addFriendResponse = await fetch('http://localhost:8000/friends/add', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            user: user.email,
                            friend: searchQuery,
                        }),
                    });
                    if (addFriendResponse.ok) {
                        setAlertMessage('Friend Added Successfully');
                        fetchFriends();
                    } else {
                        setAlertMessage('Failed to Add Friend');
                    }
                }
            } else {
                setAlertMessage('User Does Not Exist');
            }
        } catch (error) {
            setAlertMessage('Error checking user!');
            console.error('Error:', error);
        }
        setShowAlert(true);
    };

    const handleDeleteFriend = async (friendEmail) => {
        try {
            const deleteResponse = await fetch('http://localhost:8000/friends/delete', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user: user.email,
                    friend: friendEmail,
                }),
            });
            if (deleteResponse.ok) {
                setAlertMessage('Friend deleted successfully');
                fetchFriends();
                setShowDeleteAlert(false);
            } else {
                setAlertMessage('Failed to delete friend');
            }
        } catch (error) {
            setAlertMessage('Error deleting friend');
            console.error('Error:', error);
        }
        setShowAlert(true);
    };

    const confirmDelete = (friendEmail) => {
        setFriendToDelete(friendEmail);
        setAlertMessage(`Are you sure you want to delete ${friendEmail}?`);
        setShowDeleteAlert(true);
    };

    return (
        <LinearGradient
            colors={['#2C3137', '#17191D']}
            style={styles.container}
        >
            <ScrollView style={styles.scrollView}>
                <View style={styles.innerContainer}>
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>Amicis</Text>
                        <View style={styles.underline} />
                    </View>
                    <View style={styles.searchContainer}>
                        <TextInput
                            style={styles.searchBar}
                            placeholder="Search..."
                            placeholderTextColor={Colors.primaryColor}
                            value={searchQuery}
                            onChangeText={handleSearch}
                        />
                        <TouchableOpacity style={styles.addButton} onPress={handleAddFriend}>
                            <Text style={styles.addButtonText}>Add Friends</Text>
                        </TouchableOpacity>
                    </View>
                    {friends.map((friend, index) => (
                        <View key={index} style={styles.friendItem}>
                            <View style={styles.friendDetails}>
                                {friend.picture ? (
                                    <Image
                                        source={{ uri: friend.picture }}
                                        style={styles.avatar}
                                    />
                                ) : (
                                    <View style={styles.placeholderAvatar} />
                                )}
                                <Text style={styles.friendEmail}>{friend.friend_email}</Text>
                            </View>
                            <TouchableOpacity onPress={() => confirmDelete(friend.friend_email)}>
                                <Text style={styles.deleteButton}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                    <AwesomeAlert
                        show={showAlert}
                        showProgress={false}
                        title="Alert"
                        message={alertMessage}
                        closeOnTouchOutside={true}
                        closeOnHardwareBackPress={false}
                        showConfirmButton={true}
                        confirmText="OK"
                        confirmButtonColor="#DD6B55"
                        onConfirmPressed={() => {
                            setShowAlert(false);
                            fetchFriends();
                        }}
                    />

                    <AwesomeAlert
                        show={showDeleteAlert}
                        showProgress={false}
                        title="Confirm Delete"
                        message={alertMessage}
                        closeOnTouchOutside={true}
                        closeOnHardwareBackPress={false}
                        showConfirmButton={true}
                        showCancelButton={true}
                        confirmText="Yes, delete it"
                        cancelText="Cancel"
                        confirmButtonColor="#DD6B55"
                        onCancelPressed={() => setShowDeleteAlert(false)}
                        onConfirmPressed={() => {
                            handleDeleteFriend(friendToDelete);
                            setShowDeleteAlert(false);
                        }}
                    />
                </View>
            </ScrollView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    innerContainer: {
        flex: 1,
        padding: 16,
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
        width: '40%', 
        backgroundColor: Colors.primaryColor,
        marginTop: 2,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    searchBar: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 8,
        paddingLeft: 8,
        color: Colors.primaryColor,
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
    friendItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    friendDetails: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 8,
    },
    placeholderAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 8,
        backgroundColor: 'lightgray',
    },
    friendEmail: {
        color: Colors.primaryColor,
    },
    deleteButton: {
        color: 'red',
    },
});

export default Contact;
