import { useEffect, useState } from "react";
import { StyleSheet, Text, View, Button } from "react-native";
import {router } from "expo-router";
import * as WebBrowser from "expo-web-browser";

// Authenticatio
import * as Google from "expo-auth-session/providers/google";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Navigation
import { useNavigation } from '@react-navigation/native';

// Redux
import { useDispatch } from "react-redux";
import { login } from "../../redux/reducers/user";

// Color
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';

WebBrowser.maybeCompleteAuthSession();

// Define an interface for the user information
interface UserInfo {
  name: string;
  email: string;
}

/**
 * The SignIn component handles user authentication via Google and manages user information.
 */
export default function SignIn() {

  const dispatch = useDispatch();

  const navigation = useNavigation();

  // State variables to hold user information
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [picture, setPicture] = useState("");

  // State variables to hold token and user info
  const [token, setToken] = useState("");
  const [userInfo, setUserInfo] = useState(null);

  // Google authentication setup
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_IOS_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
  });

  // Effect hook to check for token on page load
  useEffect(() => {
    retrieveToken();
  }, []);

  /**
   * Effect hook to handle changes in response or token.
   * 
   * @throws {Error} if an error occurs during user authentication or fetching user info
   */
  useEffect(() => {
    handleEffect();
  }, [response, token]);

  const retrieveToken = async () => {
    try {
      const user = await getLocalUser();
      if (user && user.email) {
        const response = await fetch(`http://localhost:8000/auth/retrieve-token?email=${user.email}`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.token) {
            await getUserInfo(data.token);
          } else {
            console.log('No token found for this email');
          }
        } else {
          console.error('Failed to fetch token from server:', response.statusText);
        }
      } else {
        console.log('No user found in local storage');
      }
    } catch (error) {
      console.error('Error retrieving token:', error);
    }
  };
  

  /**
   * Function to handle side effects related to user authentication.
   * 
   * @throws {Error} if an error occurs while getting local user data or fetching user info
   */
  async function handleEffect() {
    const user = await getLocalUser();
    console.log("user", user);
    
    if (!user) {
      if (response?.type === "success" && response.authentication) {
        // If response from Google authentication is successful, get user info using access token
        getUserInfo(response.authentication.accessToken);
      }
    } else {
      // If user info is available locally, set user info state
      setUserInfo(user);
      setName(user.name);
      setEmail(user.email);
      setPicture(user.picture);
      // add new user here (CreateNewUser) if checkUserExists == false
      const userExists = await checkUserExists(user.email);
      console.log(userExists);
      if (!userExists) {
        console.log("user check information", user);
        createNewUser(user);
        // now route to user profile page to edit personal information
        //console.log("tesing user" + userInfo);
      } // else (user alr exsited)
      // route to folder page and connect friends
      dispatch(login({
        name: user.name,
        email: user.email,
        picture: user.picture,
        loggedIn: true,
      }));
      navigateToProfile();
    }
    
  }

  /**
   * Function to check if a user exists by email.
   * 
   * @param {string} email - The email address to check
   * @returns {boolean} - True if user exists, false otherwise
   * @throws {Error} if an error occurs while checking user existence
   */
  const checkUserExists = async (email: string) => {
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

  /**
   * Function to create a new user.
   * 
   * @param {UserInfo} userInfo - The user information
   * @throws {Error} if an error occurs while creating a new user
   */
  const createNewUser = async (userInfo: UserInfo): Promise<void> => {
    try {
      console.log("Sending request to create new user:", userInfo);
      
      // Convert image to base64
      const base64String = await convertImageToBase64(userInfo.picture);

      const response = await fetch("http://localhost:8000/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: userInfo.name,
          email: userInfo.email,
          picture: base64String, // Include base64-encoded image
        }),
      });

      const data = await response.json();
      console.log("New user created:", data);
    } catch (error) {
      console.error('Error creating new user:', error);
    }
  };

  /**
   * Convert image to base64 format.
   * 
   * @param {string} imageUrl - The URL of the image
   * @returns {Promise<string>} The base64-encoded image
   */
  const convertImageToBase64 = async (imageUri) => {
    return new Promise((resolve, reject) => {
        fetch(imageUri)
            .then((response) => response.blob())
            .then((blob) => {
                const reader = new FileReader();
                reader.onload = () => {
                    resolve(reader.result.split(',')[1]);
                };
                reader.onerror = (error) => reject(error);
                reader.readAsDataURL(blob);
            })
            .catch((error) => reject(error));
    });
  };


   /**
   * Function to get user info from local storage.
   * 
   * @returns {Object|null} - The user information or null if not found
   * @throws {Error} if an error occurs while getting user info from local storage
   */
  const getLocalUser = async () => {
    const data = await AsyncStorage.getItem("@user");
    if (!data) return null;
    return JSON.parse(data);
  };
  

  /**
   * Function to get user info from Google API.
   * 
   * @param {string} token - The access token from Google authentication
   * @throws {Error} if an error occurs while fetching user info from Google API
   */
  const getUserInfo = async (token: string) => {
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

      // Store token in Redis
      await storeTokenInRedis(token, user.email);

      setUserInfo(user);
      dispatch(login({
        name: user.name,
        email: user.email,
        picture: user.picture,
        loggedIn: true,
      }));
      navigateToProfile();
    } catch (error) {
      // Add your own error handler here
    }
  };

  const storeTokenInRedis = async (token: string, email: string) => {
    try {
      await fetch("http://localhost:8000/auth/store-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, email }),
      });
    } catch (error) {
      console.error('Error storing token in Redis:', error);
    }
  };

  /**
   * Function to navigate to the profile page.
   */
  const navigateToProfile = () => {
    router.push('/profile');
  };

  return (
    <LinearGradient
      colors={['#2C3137', '#17191D']}
      style={styles.container}
    >
      {!userInfo ? (
        <Button 
          title="Log In With Google"
          disabled={!request}
          onPress={() => {
            promptAsync();
          }}
          color={Colors.secondaryColor}
        />
      ) : (
        <Button
          title="Go to profile"
          onPress={() => navigateToProfile()}
          color={Colors.secondaryColor}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
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