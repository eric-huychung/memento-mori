import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import Folder from '../(modals)/folder'
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors'

const Home = () => {
  return (
    <LinearGradient
      colors={['#2C3137', '#17191D']}
      style={styles.container}
    >
      <View>
        <Folder />
      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
      flex: 1,
  },
});


export default Home