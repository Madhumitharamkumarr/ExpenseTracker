import React from 'react';
import { View, StyleSheet, ImageBackground } from 'react-native';
import { Text, Button } from 'react-native-paper';

const backgroundImage = require('../assets/images/bg.jpeg'); // Local image

const HomeScreen = ({ navigation }) => {
  return (
    <ImageBackground
      source={backgroundImage}
      style={styles.container}
      resizeMode="cover"
    >
      {/* Overlay for dimming the background more */}
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>ExpenseZen</Text>
          <Text style={styles.subtitle}>Track Your Expenses Mindfully</Text>

          <View style={styles.iconContainer}>
            <Text style={styles.icon}>💰</Text>
          </View>

          <Text style={styles.description}>
            Manage your daily expenses with ease. Track, analyze, and control your spending habits.
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('SignIn')}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Sign In
          </Button>

          <Button
            mode="outlined"
            onPress={() => navigation.navigate('SignUp')}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Sign Up
          </Button>
        </View>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: { 
    flex: 1, 
    backgroundColor: 'rgba(0,0,0,0.6)', // More dim background
    justifyContent: 'space-between',
  },
  content: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingHorizontal: 30 
  },
  title: { 
    fontSize: 46, 
    fontWeight: '900', // Bolder text
    color: '#fff', 
    marginBottom: 10, 
    textShadowColor: '#000', 
    textShadowOffset: { width: 2, height: 2 }, 
    textShadowRadius: 6, 
  },
  subtitle: { 
    fontSize: 20, 
    fontWeight: '700', // Bold
    color: '#fff', 
    marginBottom: 40,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  iconContainer: { 
    width: 120, 
    height: 120, 
    borderRadius: 60, 
    backgroundColor: 'rgba(255,255,255,0.9)', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 30, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 8, 
    elevation: 5 
  },
  icon: { fontSize: 60 },
  description: { 
    fontSize: 18, 
    fontWeight: '600', // Bold description
    color: '#fff', 
    textAlign: 'center', 
    lineHeight: 26,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  buttonContainer: { 
    paddingHorizontal: 30, 
    paddingBottom: 40, 
    gap: 15 
  },
  button: { borderRadius: 8 },
  buttonContent: { paddingVertical: 8 },
});

export default HomeScreen;
