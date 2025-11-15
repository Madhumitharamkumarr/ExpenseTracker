// src/screens/AddBorrowing.js
import React, { useState } from "react";
import { View, StyleSheet, ScrollView, Alert } from "react-native";
import { TextInput, Button, Text, Appbar, HelperText } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import { loanAPI } from "../services/api";

const AddBorrowing = ({ navigation }) => {
  const [formData, setFormData] = useState({
    lenderName: "",
    category: "",
    amount: "",
    interest: "",
    dueDate: new Date(),
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (key, value) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData({ ...formData, dueDate: selectedDate });
    }
  };

  const handleSubmit = async () => {
    const { lenderName, category, amount, interest } = formData;
    if (!lenderName || !category || !amount || !interest) {
      Alert.alert("Validation Error", "Please fill all the fields");
      return;
    }

    try {
      setLoading(true);
      const totalPayable =
        parseFloat(amount) + (parseFloat(amount) * parseFloat(interest)) / 100;

      await loanAPI.addLoan({
        ...formData,
        type: "borrowing",
        totalPayable,
      });

      Alert.alert("Success", "Borrowing record added successfully!");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Failed to add borrowing record");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Add Borrowing" />
      </Appbar.Header>

      <ScrollView style={styles.form}>
        <Text style={styles.title}>Borrowing Details 💰</Text>

        <TextInput
          label="Lender Name"
          value={formData.lenderName}
          onChangeText={(text) => handleInputChange("lenderName", text)}
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Category (Bank, Friend, etc)"
          value={formData.category}
          onChangeText={(text) => handleInputChange("category", text)}
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Amount (₹)"
          keyboardType="numeric"
          value={formData.amount}
          onChangeText={(text) => handleInputChange("amount", text)}
          mode="outlined"
          style={styles.input}
        />
        <TextInput
          label="Interest (%)"
          keyboardType="numeric"
          value={formData.interest}
          onChangeText={(text) => handleInputChange("interest", text)}
          mode="outlined"
          style={styles.input}
        />

        <Button
          mode="outlined"
          onPress={() => setShowDatePicker(true)}
          style={styles.dateBtn}
        >
          Select Due Date: {formData.dueDate.toDateString()}
        </Button>

        {showDatePicker && (
          <DateTimePicker
            value={formData.dueDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}

        <Button
          mode="contained"
          onPress={handleSubmit}
          loading={loading}
          style={styles.submitBtn}
        >
          Save Borrowing
        </Button>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  form: { padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20, color: "#333" },
  input: { marginBottom: 15, backgroundColor: "#fff" },
  dateBtn: {
    marginBottom: 20,
    borderColor: "#6200EE",
    borderWidth: 1,
  },
  submitBtn: {
    backgroundColor: "#6200EE",
    borderRadius: 8,
    paddingVertical: 5,
  },
});

export default AddBorrowing;
