import React from 'react';
import { StyleSheet, Text, View, Button, Image } from "react-native";
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

import User from "../(modals)/user";

// Define the interface for the route parameters
interface ProfileRouteParams {
  name: string;
  email: string;
  picture: string;
}

// Define the type for the route prop
type ProfileRouteProp = RouteProp<{ Profile: ProfileRouteParams }, 'Profile'>;

const Profile = () => {
  const route = useRoute<ProfileRouteProp>();
  const { name, email, picture } = route.params || {};

  return (
    <LinearGradient
      colors={['#2C3137', '#17191D']}
      style={styles.container}
    >
      <User name={name} email={email} picture={picture} />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});

export default Profile;
