import React from 'react';
import { View, StyleSheet } from 'react-native';
import Contact from '../(modals)/contact';
import { LinearGradient } from 'expo-linear-gradient';
import Colors from '@/constants/Colors';


const Friend = () => {
    return (
        <LinearGradient
            colors={['#2C3137', '#17191D']}
            style={styles.container}
        >
            <View style={styles.container}>
                <Contact />
            </View>
        </LinearGradient>
        
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
});

export default Friend;
