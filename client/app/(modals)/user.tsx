import React, { useEffect } from 'react';
import { StyleSheet, Text, View, Button, Image } from "react-native";
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useDispatch, useSelector } from "react-redux";
import { logout, selectUser } from '../../redux/reducers/user';
import { RootStackNavigationProp } from "../_layout";
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';

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
    <LinearGradient
      colors={['#2C3137', '#17191D']}
      style={styles.container}
    >
      {user ? (
        <>
          <Image source={{ uri: user.picture }} style={styles.image} alt="User Avatar" />
          
        </>
      ) : (
        <Text style={styles.text}>No User Found Error...</Text>
      )}
      <View style={styles.buttonContainer}>
        <Button title="Log Out" onPress={removeUserDataFromStorage} color={Colors.secondaryColor} />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  text: {
    color: Colors.primaryColor,
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 10,
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  buttonContainer: {
    marginTop: 30, // Increased gap between the image and the button
  },
});

export default User;
