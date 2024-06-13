import { View, Text, Button } from 'react-native'
import React from 'react'

import { useNavigation } from '@react-navigation/native';

import { RootStackNavigationProp } from "../_layout";


const onboarding = () => {

    const navigation = useNavigation<RootStackNavigationProp>();

    return (
        <View>
        <Text>onboarding</Text>
        <Button
            title="Get Started"
            onPress={() => navigation.navigate('(modals)/login')}
        />
        </View>
    )
}

export default onboarding