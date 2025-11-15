import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  TextInput,
  Button,
  Appbar,
  Snackbar,
  Text,
  Card,
} from "react-native-paper";
import { loanAPI } from "../services/api";

const AddLendingScreen = ({ navigation }) => {
  const [borrowerName, setBorrowerName] = useState("");
  const [amount, setAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // 🧮 Calculate total amount with interest
  const calculateTotal = () => {
    if (!amount || !interestRate || !dueDate) return "0.00";
    const principal = parseFloat(amount);
    const rate = parseFloat(interestRate);
    const start = new Date(startDate);
    const due = new Date(dueDate);

    const diffTime = Math.abs(due - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const months = Math.max(1, Math.ceil(diffDays / 30));

    const interest = (principal * rate * months) / 100;
    const total = principal + interest;
    return total.toFixed(2);
  };

  // 📝 Submit function
  const handleSubmit = async () => {
    if (!borrowerName || !amount || !address || !phone || !dueDate) {
      setError("Please fill all required fields.");
      return;
    }

    if (isNaN(amount) || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    try {
      setLoading(true);
      const loanData = {
        type: "lending",
        borrowerName,
        amount: parseFloat(amount),
        interestRate: parseFloat(interestRate),
        borrowerAddress: address,
        borrowerPhone: phone,
        startDate,
        dueDate,
        notes,
      };

      const response = await loanAPI.addLoan(loanData);

      if (response.success) {
        setSuccess("💸 Lending record added successfully!");
        setTimeout(() => navigation.navigate("Dashboard"), 1500);
      }
    } catch (err) {
      setError("Failed to add lending record. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Add Lending" />
      </Appbar.Header>

      {/* Form */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView style={styles.scroll}>
          <Text style={styles.subtitle}>Lending money to someone 💸</Text>

          {/* Form Inputs */}
          <TextInput
            label="Borrower Name *"
            value={borrowerName}
            onChangeText={setBorrowerName}
            mode="outlined"
            style={styles.input}
            left={<TextInput.Icon icon="account" />}
          />

          <TextInput
            label="Amount (₹) *"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            mode="outlined"
            style={styles.input}
            left={<TextInput.Icon icon="currency-inr" />}
          />

          <TextInput
            label="Interest Rate (%)"
            value={interestRate}
            onChangeText={setInterestRate}
            keyboardType="decimal-pad"
            mode="outlined"
            style={styles.input}
            left={<TextInput.Icon icon="percent" />}
          />

          <TextInput
            label="Address *"
            value={address}
            onChangeText={setAddress}
            mode="outlined"
            multiline
            numberOfLines={2}
            style={styles.input}
            left={<TextInput.Icon icon="map-marker" />}
          />

          <TextInput
            label="Phone Number *"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            mode="outlined"
            style={styles.input}
            left={<TextInput.Icon icon="phone" />}
          />

          <TextInput
            label="Start Date *"
            value={startDate}
            onChangeText={setStartDate}
            mode="outlined"
            placeholder="YYYY-MM-DD"
            style={styles.input}
            left={<TextInput.Icon icon="calendar-start" />}
          />

          <TextInput
            label="Due Date *"
            value={dueDate}
            onChangeText={setDueDate}
            mode="outlined"
            placeholder="YYYY-MM-DD"
            style={styles.input}
            left={<TextInput.Icon icon="calendar-end" />}
          />

          {/* Total Calculation */}
          {amount && interestRate && dueDate && (
            <Card style={styles.totalCard}>
              <Text style={styles.calcLabel}>
                Total Payable (Principal + Interest)
              </Text>
              <Text style={styles.calcAmount}>₹{calculateTotal()}</Text>
            </Card>
          )}

          <TextInput
            label="Notes (Optional)"
            value={notes}
            onChangeText={setNotes}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.input}
            left={<TextInput.Icon icon="note-text" />}
          />

          {/* Submit Button */}
          <Button
            mode="contained"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            Save Lending Record
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Snackbar Messages */}
      <Snackbar
        visible={!!error}
        onDismiss={() => setError("")}
        duration={3000}
        style={styles.errorSnackbar}
      >
        {error}
      </Snackbar>

      <Snackbar
        visible={!!success}
        onDismiss={() => setSuccess("")}
        duration={1500}
        style={styles.successSnackbar}
      >
        {success}
      </Snackbar>
    </View>
  );
};

// ====================
// 💅 Styles
// ====================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    backgroundColor: "#6200EE",
  },
  scroll: {
    padding: 20,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    marginBottom: 16,
    backgroundColor: "#fff",
  },
  totalCard: {
    backgroundColor: "#EDE7F6",
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
    alignItems: "center",
    elevation: 2,
  },
  calcLabel: {
    fontSize: 14,
    color: "#555",
    marginBottom: 6,
  },
  calcAmount: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#6200EE",
  },
  button: {
    marginTop: 10,
    borderRadius: 8,
    backgroundColor: "#6200EE",
  },
  buttonContent: {
    paddingVertical: 8,
  },
  successSnackbar: {
    backgroundColor: "#4CAF50",
  },
  errorSnackbar: {
    backgroundColor: "#D32F2F",
  },
});

export default AddLendingScreen;
