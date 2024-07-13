import { View, Text } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'

import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';

const Layout = () => {
  return (
    <Tabs
        screenOptions={{
            tabBarLabelStyle: {
                fontFamily: 'mon-sb',
            },
            tabBarStyle: {
                backgroundColor: Colors.tabBackgroundColor,
                borderTopWidth: 0,
            },
            tabBarActiveTintColor: 'white',
        }}
    >
        <Tabs.Screen 
            name = "profile"
            options={{
                tabBarLabel: "Profile",
                tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={24} color='#8D8D8F' />,
                href: {
                    pathname: "/profile",
                },
                headerShown: false 
            }}  
        />
        <Tabs.Screen 
            name = "friend"
            options={{
                tabBarLabel: "Friends",
                tabBarIcon: ({ color, size }) => <Ionicons name="add-outline" size={30} color='#8D8D8F' />,
                headerShown: false, 
            }}            
        />
        <Tabs.Screen 
            name = "home"
            options={{
                tabBarLabel: "Home",
                tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={24} color='#8D8D8F' />,
                headerShown: false, 
            }}            
        />
    </Tabs>
  )
}

export default Layout