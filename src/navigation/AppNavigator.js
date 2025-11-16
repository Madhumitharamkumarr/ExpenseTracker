// src/navigation/AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// === YOUR EXISTING SCREENS ===
import HomeScreen from '../screens/HomeScreen';
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';
import DashboardScreen from '../screens/DashboardScreen';
import AddExpenseScreen from '../screens/AddExpenseScreen';
import ExpenseListScreen from '../screens/ExpenseListScreen';
import AddIncomeScreen from '../screens/AddIncomeScreen';
import IncomeListScreen from '../screens/IncomeListScreen';

// === LOAN FLOW SCREENS ===
import LoanTypeSelector from '../screens/LoanTypeSelector';
import AddLendingScreen from '../screens/AddLendingScreen';
import AddBorrowingScreen from '../screens/AddBorrowingScreen';
import NotificationScreen from '../screens/NotificationScreen'; // ← ADDED
import NotificationBell from '../components/NotificationBell';


const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="SignIn" component={SignInScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="AddExpense" component={AddExpenseScreen} />
        <Stack.Screen name="ExpenseList" component={ExpenseListScreen} />
        <Stack.Screen name="AddIncome" component={AddIncomeScreen} />
        <Stack.Screen name="IncomeList" component={IncomeListScreen} />

        {/* LOAN FLOW */}
        <Stack.Screen name="LoanTypeSelector" component={LoanTypeSelector} />
        <Stack.Screen name="AddLendingScreen" component={AddLendingScreen} />
        <Stack.Screen name="AddBorrowingScreen" component={AddBorrowingScreen} />
        <Stack.Screen name="NotificationScreen" component={NotificationScreen} />
        
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;