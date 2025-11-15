import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ImageBackground } from 'react-native';
import { TextInput, Button, Text, Snackbar } from 'react-native-paper';
import { authAPI } from '../services/api';
import storage from '../utils/storage';

// Background image
const backgroundImage = require('../assets/images/auth.jpeg');

const SignUpScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSignUp = async () => {
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await authAPI.signup(name, email, password);
      if (response.success) {
        await storage.saveToken(response.data.token);
        await storage.saveUser(response.data);
        navigation.replace('Dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={backgroundImage}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardContainer}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Sign up to get started</Text>
            </View>

            <View style={styles.form}>
              <TextInput
                label="Full Name"
                value={name}
                onChangeText={setName}
                mode="outlined"
                style={styles.input}
                left={<TextInput.Icon icon="account" color="#fff" />}
                outlineColor="rgba(255,255,255,0.6)"
                activeOutlineColor="#fff"
                textColor="#fff"
                placeholderTextColor="rgba(255,255,255,0.7)"
              />

              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
                left={<TextInput.Icon icon="email" color="#fff" />}
                outlineColor="rgba(255,255,255,0.6)"
                activeOutlineColor="#fff"
                textColor="#fff"
                placeholderTextColor="rgba(255,255,255,0.7)"
              />

              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                secureTextEntry={!showPassword}
                style={styles.input}
                left={<TextInput.Icon icon="lock" color="#fff" />}
                right={
                  <TextInput.Icon
                    icon={showPassword ? "eye-off" : "eye"}
                    onPress={() => setShowPassword(!showPassword)}
                    color="#fff"
                  />
                }
                outlineColor="rgba(255,255,255,0.6)"
                activeOutlineColor="#fff"
                textColor="#fff"
                placeholderTextColor="rgba(255,255,255,0.7)"
              />

              <Button
                mode="contained"
                onPress={handleSignUp}
                loading={loading}
                disabled={loading}
                style={styles.button}
                contentStyle={styles.buttonContent}
              >
                Sign Up
              </Button>

              <Button
                mode="text"
                onPress={() => navigation.navigate('SignIn')}
                style={styles.linkButton}
                textColor="#fff"
              >
                Already have an account? Sign In
              </Button>
            </View>
          </ScrollView>

          <Snackbar
            visible={!!error}
            onDismiss={() => setError('')}
            duration={3000}
            action={{
              label: 'OK',
              onPress: () => setError(''),
            }}
          >
            {error}
          </Snackbar>
        </KeyboardAvoidingView>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)', // dim background
  },
  keyboardContainer: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 20,
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    textShadowColor: '#000',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  form: { width: '100%' },
  input: { marginBottom: 16, backgroundColor: 'rgba(255,255,255,0.1)' },
  button: { marginTop: 8, borderRadius: 8 },
  buttonContent: { paddingVertical: 8 },
  linkButton: { marginTop: 16 },
});

export default SignUpScreen;
