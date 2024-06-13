import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Button, Image } from "react-native";
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch, useSelector } from "react-redux";
import { logout, selectUser } from '../../redux/reducers/user';
import { RootStackNavigationProp } from "../_layout";

interface UserProps {
  name: string;
  email: string;
  picture: string;
}

const User: React.FC<UserProps> = ({ name, email, picture }) => {
  const dispatch = useDispatch();
  const navigation = useNavigation<RootStackNavigationProp>();
  const user = useSelector(selectUser);

  // Function to remove user data from local storage
  const removeUserDataFromStorage = async () => {
    try {
      await AsyncStorage.removeItem("@user");
      dispatch(logout());
      navigation.navigate("(modals)/onboarding");
    } catch (error) {
      console.error(error);
      // Handle error
    }
  };

  useEffect(() => {
    if (!user) {
      navigation.navigate("(modals)/onboarding");
    }
  }, [user, navigation]);

  return (
    <View style={styles.container}>
      {user ? (
        <>
          <Image source={{ uri: user.picture }} style={styles.image} alt="User Avatar" />
          <Text>{user.email}</Text>
        </>
      ) : (
        <Text>No User Found Error...</Text>
      )}
      <Button title="Log Out" onPress={removeUserDataFromStorage} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    fontSize: 20,
    fontWeight: "bold",
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
});

export default User;
