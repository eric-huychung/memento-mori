import { View, Text } from 'react-native'
import React from 'react'
import { Tabs } from 'expo-router'

import { Ionicons } from '@expo/vector-icons';

const Layout = () => {
  return (
    <Tabs
        screenOptions={{
            tabBarLabelStyle: {
                fontFamily: 'mon-sb',
            },
        }}
    >
        <Tabs.Screen 
            name = "profile"
            options={{
                tabBarLabel: "Profile",
                tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={24} color="black" />,
                href: {
                    pathname: "/profile",
                },
            }}  
        />
        <Tabs.Screen 
            name = "home"
            options={{
                tabBarLabel: "Home",
                tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={24} color="black" />
            }}            
        />
    </Tabs>
  )
}

export default Layout