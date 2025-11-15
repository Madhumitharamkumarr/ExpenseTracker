import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ImageBackground, TouchableOpacity } from 'react-native';
import { TextInput, Button, Appbar, Snackbar, Menu, Card, Provider as PaperProvider, Text } from 'react-native-paper';
import { DatePickerModal } from 'react-native-paper-dates';
import { expenseAPI } from '../services/api';

const CATEGORIES = ['Food','Travel','Shopping','Entertainment','Bills','Health','Education','Other'];
const backgroundImage = require('../assets/images/dashboard.jpeg');

const AddExpenseScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Other');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  const handleAddExpense = async () => {
    if (!name || !amount) {
      setError('Please fill in expense name and amount');
      return;
    }
    if (isNaN(amount) || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const expenseData = { 
        name, 
        category, 
        amount: parseFloat(amount), 
        date: formatDate(date), 
        notes 
      };
      const response = await expenseAPI.addExpense(expenseData);
      if (response.success) {
        setSuccess('Expense added successfully!');
        setName(''); setCategory('Other'); setAmount(''); setDate(new Date()); setNotes('');
        setTimeout(() => navigation.goBack(), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getDate().toString().padStart(2,'0')}`;
  }

  return (
    <PaperProvider>
      <ImageBackground source={backgroundImage} style={styles.background} resizeMode="cover">
        <View style={styles.overlay}>
          {/* Appbar */}
          <Appbar.Header elevated style={{ backgroundColor: 'transparent' }}>
            <Appbar.BackAction onPress={() => navigation.goBack()} color="#fff" />
            <Appbar.Content title="Add Expense" titleStyle={{ color: '#fff', fontWeight: 'bold', fontSize: 22 }} />
          </Appbar.Header>

          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
              <Card style={styles.inputCard}>
                <Card.Content>

                  {/* Expense Name */}
                  <TextInput
                    label="Expense Name *"
                    value={name}
                    onChangeText={setName}
                    mode="outlined"
                    placeholder="e.g., Lunch, Groceries"
                    style={styles.input}
                    theme={{ colors: { placeholder: '#666', primary: '#6200ee', background: '#fff' } }}
                    left={<TextInput.Icon icon="tag" color="#6200ee" />}
                    textColor="#000"
                  />

                  {/* Category */}
                  <Menu
                    visible={menuVisible}
                    onDismiss={() => setMenuVisible(false)}
                    anchor={
                      <TouchableOpacity onPress={() => setMenuVisible(true)}>
                        <TextInput
                          label="Category *"
                          value={category}
                          mode="outlined"
                          editable={false}
                          style={styles.input}
                          theme={{ colors: { placeholder: '#666', primary: '#6200ee', background: '#fff' } }}
                          left={<TextInput.Icon icon="shape" color="#6200ee" />}
                          right={<TextInput.Icon icon="chevron-down" color="#6200ee" />}
                          textColor="#000"
                        />
                      </TouchableOpacity>
                    }
                    contentStyle={{ backgroundColor: '#fff' }}
                  >
                    {CATEGORIES.map((cat) => (
                      <Menu.Item
                        key={cat}
                        onPress={() => { setCategory(cat); setMenuVisible(false); }}
                        title={cat}
                        titleStyle={{ color: '#000' }}
                      />
                    ))}
                  </Menu>

                  {/* Amount */}
                  <TextInput
                    label="Amount *"
                    value={amount}
                    onChangeText={setAmount}
                    mode="outlined"
                    keyboardType="decimal-pad"
                    style={styles.input}
                    theme={{ colors: { placeholder: '#666', primary: '#6200ee', background: '#fff' } }}
                    left={<TextInput.Icon icon="currency-inr" color="#6200ee" />}
                    textColor="#000"
                  />

                  {/* Date Picker */}
                  <TouchableOpacity onPress={() => setDatePickerVisible(true)}>
                    <TextInput
                      label="Date"
                      value={formatDate(date)}
                      mode="outlined"
                      style={styles.input}
                      editable={false}
                      theme={{ colors: { placeholder: '#666', primary: '#6200ee', background: '#fff' } }}
                      left={<TextInput.Icon icon="calendar" color="#6200ee" />}
                      textColor="#000"
                    />
                  </TouchableOpacity>
                  <DatePickerModal
                    mode="single"
                    visible={datePickerVisible}
                    onDismiss={() => setDatePickerVisible(false)}
                    date={date}
                    onConfirm={(params) => { 
                      if(params.date) setDate(params.date); 
                      setDatePickerVisible(false); 
                    }}
                  />

                  {/* Notes */}
                  <TextInput
                    label="Notes (Optional)"
                    value={notes}
                    onChangeText={setNotes}
                    mode="outlined"
                    multiline
                    numberOfLines={3}
                    style={styles.input}
                    theme={{ colors: { placeholder: '#666', primary: '#6200ee', background: '#fff' } }}
                    left={<TextInput.Icon icon="note-text" color="#6200ee" />}
                    textColor="#000"
                  />

                  {/* Add Button */}
                  <Button
                    mode="contained"
                    onPress={handleAddExpense}
                    loading={loading}
                    disabled={loading}
                    style={styles.button}
                    contentStyle={styles.buttonContent}
                    textColor="#fff"
                  >
                    Add Expense
                  </Button>
                </Card.Content>
              </Card>
            </ScrollView>
          </KeyboardAvoidingView>

          {/* Snackbar */}
          <Snackbar visible={!!error} onDismiss={() => setError('')} duration={3000} action={{ label: 'OK', onPress: () => setError('') }}>
            {error}
          </Snackbar>
          <Snackbar visible={!!success} onDismiss={() => setSuccess('')} duration={1500} style={styles.successSnackbar}>
            {success}
          </Snackbar>
        </View>
      </ImageBackground>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },
  keyboardView: { flex: 1 },
  content: { flexGrow: 1, padding: 20, justifyContent: 'center' },
  inputCard: { borderRadius: 16, elevation: 8, backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.15, shadowRadius: 8 },
  input: { marginBottom: 16 },
  button: { marginTop: 16, borderRadius: 25, backgroundColor: '#6200ee' },
  buttonContent: { paddingVertical: 12 },
  successSnackbar: { backgroundColor: '#4CAF50' },
});

export default AddExpenseScreen;
