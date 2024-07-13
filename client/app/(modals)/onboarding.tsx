import { View, Text, Button, StyleSheet, Image } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { RootStackNavigationProp } from "../_layout";
import Colors from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';
import logo from '../../assets/images/onboarding.png';

const onboarding = () => {
    const navigation = useNavigation<RootStackNavigationProp>();

    return (
        <LinearGradient
            colors={['#2C3137', '#17191D']}
            style={styles.container}
        >
           <View style={styles.contentContainer}>
                <View style={styles.headerContainer}>
                    <Text style={styles.title}>Welcome to</Text>
                    <Image source={logo} style={styles.logo} />
                </View>
                <Text style={styles.appName}>Memento Mori</Text>
                <Text style={styles.description}>
                    The app designed to help you cherish and share precious photo memories with friends and family, all while ensuring your privacy. Our focus on interactivity makes reminiscing more engaging and meaningful. Embrace the essence of "memento mori" and celebrate life's fleeting moments with Memento.
                </Text>
                <View style={styles.buttonContainer}>
                    <Button
                        title="Get Started"
                        onPress={() => navigation.navigate('(modals)/login')}
                        color={Colors.secondaryColor}
                    />
                </View>
            </View>
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
    logo: {
        width: 175, 
        height: 60, 
    },
    contentContainer: {
        padding: 20,
        borderRadius: 10, 
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between', 
        alignItems: 'center', 
        width: '100%', 
    },
    textContainer: {
        alignSelf: 'flex-start',
    },
    buttonContainer: {
        alignSelf: 'flex-end',
    },
    title: {
        color: Colors.primaryColor,
        fontSize: 22,
        marginBottom: 10,
    },
    appName: {
        color: Colors.primaryColor,
        fontSize: 35,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    description: {
        color: Colors.primaryColor,
        fontSize: 14,
        textAlign: 'left',
        marginBottom: 30,
    },
});

export default onboarding;
