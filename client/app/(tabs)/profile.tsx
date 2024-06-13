import React from 'react';
import { StyleSheet, Text, View, Button, Image } from "react-native";
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';

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
    <User name={name} email={email} picture={picture} />
  );
};


export default Profile;
