import { useEffect, useState } from "react";
import { StyleSheet, Text, View, Button } from "react-native";
import {router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useNavigation } from '@react-navigation/native';
//pages
import Profile from "../(tabs)/profile";

WebBrowser.maybeCompleteAuthSession();

export default function SignIn() {

    const navigation = useNavigation();

  // State variables to hold token and user info
  const [token, setToken] = useState("");
  const [userInfo, setUserInfo] = useState(null);

  // Google authentication setup
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_IOS_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
  });

  // Effect hook to handle changes in response or token
  useEffect(() => {
    handleEffect();
  }, [response, token]);

  // Function to handle side effects
  async function handleEffect() {
    const user = await getLocalUser();
    console.log("user", user);
    if (!user) {
      if (response?.type === "success") {
        // If response from Google authentication is successful,
        // get user info using access token
        getUserInfo(response.authentication.accessToken);
      }
    } else {
      // If user info is available locally, set user info state
      setUserInfo(user);
      // add new user here (CreateNewUser) if checkUserExists == false
      const userExists = await checkUserExists(user.email);
      if (!userExists) {
        console.log("user check information", user);
        createNewUser(user);
        // now route to user profile page to edit personal information
        
        console.log("Test");
        router.push("/profile");
      } // else (user alr exsited)
      // route to folder page and connect friends
      //return <Navigate to="/profile" replace />
      console.log("Testing");
      router.push("/profile");
      
      console.log("loaded locally");
    }

  }

  // Function to check if a user exists by email
  const checkUserExists = async (email) => {
    try {
      const response = await fetch(`http://localhost:8000/checks/email/${email}`);
      const data = await response.json();
      return data.exists;
    } catch (error) {
      console.error(error);
      // Handle error
      return false;
    }
  };

  // Function to create a new user
  const createNewUser = async (userInfo) => {
    try {
      const response = await fetch("http://localhost:8000/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: userInfo.name,
          email: userInfo.email,
        }),
      });
      const data = await response.json();
      console.log("New user created:", data);
    } catch (error) {
      console.error(error);
      // Handle error
    }
  };

  // Function to get user info from local storage
  const getLocalUser = async () => {
    const data = await AsyncStorage.getItem("@user");
    if (!data) return null;
    return JSON.parse(data);
  };
  

  // Function to get user info from Google API
  const getUserInfo = async (token) => {
    if (!token) return;
    try {
      const response = await fetch(
        "https://www.googleapis.com/userinfo/v2/me",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const user = await response.json();
      // Store user info in local storage
      await AsyncStorage.setItem("@user", JSON.stringify(user));
      setUserInfo(user);
    } catch (error) {
      // Add your own error handler here
    }
  };

  return (
    <View style={styles.container}>
      {!userInfo ? (
        <Button 
            class="login-with-google-btn"
            title="Get Started"
            disabled={!request}
            onPress={() => {
            promptAsync();
          }}
        />
      ) : (
        <Profile
          username={userInfo.name}
          email={userInfo.email}
          avatarUrl={userInfo.picture}
          />
      )}
      
      <Button
        title="remove local store"
        onPress={async () => await AsyncStorage.removeItem("@user")}
      />
    </View>
  );
}

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
  card: {
    borderWidth: 1,
    borderRadius: 15,
    padding: 15,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
});