// src/screens/AddLendingScreen.js
import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import {
  TextInput,
  Button,
  Appbar,
  Snackbar,
  Text,
  Card,
  Provider as PaperProvider,
} from "react-native-paper";
import { DatePickerModal } from "react-native-paper-dates";
import { loanAPI } from "../services/api";
import ConfettiCannon from "react-native-confetti-cannon";

const backgroundImage = require("../assets/images/dashboard.jpeg");

const AddLendingScreen = ({ navigation }) => {
  const [borrowerName, setBorrowerName] = useState("");
  const [amount, setAmount] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [dueDate, setDueDate] = useState(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [dueDateOpen, setDueDateOpen] = useState(false);
  const confettiRef = React.useRef(null);

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
  };

  const calculateTotal = () => {
    if (!amount || !interestRate || !dueDate) return "0.00";
    const principal = parseFloat(amount);
    const rate = parseFloat(interestRate);
    const start = startDate;
    const due = dueDate;
    const diffTime = Math.abs(due - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const months = Math.max(1, Math.ceil(diffDays / 30));
    const interest = (principal * rate * months) / 100;
    const total = principal + interest;
    return total.toFixed(2);
  };

  const handleSubmit = async () => {
    const lendAmount = parseFloat(amount);

    if (!borrowerName || !amount || !address || !phone || !dueDate) {
      setError("Please fill all required fields.");
      return;
    }

    if (isNaN(lendAmount) || lendAmount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const loanData = {
        type: "lending",
        borrowerName,
        amount: lendAmount,
        interestRate: parseFloat(interestRate) || 0,
        borrowerAddress: address,
        borrowerPhone: phone,
        startDate: formatDate(startDate),
        dueDate: formatDate(dueDate),
        notes,
      };

      const response = await loanAPI.addLoan(loanData);

      if (response.success) {
        // REMOVED: incomeAPI.deductFromIncome(lendAmount)
        setSuccess("Lent successfully!");
        confettiRef.current?.start();
        setTimeout(() => navigation.navigate("Dashboard"), 1800);
      }
    } catch (err) {
      setError("Failed to lend. Try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PaperProvider>
      <ImageBackground source={backgroundImage} style={styles.background} resizeMode="cover">
        <View style={styles.overlay}>
          <Appbar.Header elevated style={{ backgroundColor: "transparent" }}>
            <Appbar.BackAction onPress={() => navigation.goBack()} color="#fff" />
            <Appbar.Content title="I GAVE (Lending)" titleStyle={{ color: "#fff", fontWeight: "bold" }} />
          </Appbar.Header>

          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
            <ScrollView contentContainerStyle={styles.content}>
              <Card style={styles.inputCard}>
                <Text style={styles.subtitle}>Lending money to someone</Text>

                <TextInput
                  label="Borrower Name *"
                  value={borrowerName}
                  onChangeText={setBorrowerName}
                  mode="outlined"
                  style={styles.input}
                  left={<TextInput.Icon icon="account" color="#6200ee" />}
                />

                <TextInput
                  label="Amount (₹) *"
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                  mode="outlined"
                  style={styles.input}
                  left={<TextInput.Icon icon="currency-inr" color="#6200ee" />}
                />

                <TextInput
                  label="Interest Rate (%)"
                  value={interestRate}
                  onChangeText={setInterestRate}
                  keyboardType="decimal-pad"
                  mode="outlined"
                  style={styles.input}
                  left={<TextInput.Icon icon="percent" color="#6200ee" />}
                />

                <TextInput
                  label="Address *"
                  value={address}
                  onChangeText={setAddress}
                  mode="outlined"
                  multiline
                  numberOfLines={2}
                  style={styles.input}
                  left={<TextInput.Icon icon="map-marker" color="#6200ee" />}
                />

                <TextInput
                  label="Phone Number *"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  mode="outlined"
                  style={styles.input}
                  left={<TextInput.Icon icon="phone" color="#6200ee" />}
                />

                <TouchableOpacity onPress={() => setStartDateOpen(true)}>
                  <TextInput
                    label="Start Date *"
                    value={formatDate(startDate)}
                    mode="outlined"
                    editable={false}
                    style={styles.input}
                    left={<TextInput.Icon icon="calendar-start" color="#6200ee" />}
                  />
                </TouchableOpacity>
                <DatePickerModal
                  locale="en"
                  mode="single"
                  visible={startDateOpen}
                  onDismiss={() => setStartDateOpen(false)}
                  date={startDate}
                  onConfirm={(params) => {
                    setStartDate(params.date);
                    setStartDateOpen(false);
                  }}
                />

                <TouchableOpacity onPress={() => setDueDateOpen(true)}>
                  <TextInput
                    label="Due Date *"
                    value={formatDate(dueDate)}
                    mode="outlined"
                    editable={false}
                    style={styles.input}
                    left={<TextInput.Icon icon="calendar-end" color="#6200ee" />}
                  />
                </TouchableOpacity>
                <DatePickerModal
                  locale="en"
                  mode="single"
                  visible={dueDateOpen}
                  onDismiss={() => setDueDateOpen(false)}
                  date={dueDate || new Date()}
                  onConfirm={(params) => {
                    setDueDate(params.date);
                    setDueDateOpen(false);
                  }}
                />

                {amount && interestRate && dueDate && (
                  <Card style={styles.totalCard}>
                    <Text style={styles.calcLabel}>Total Payable</Text>
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
                  left={<TextInput.Icon icon="note-text" color="#6200ee" />}
                />

                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  loading={loading}
                  disabled={loading}
                  style={styles.button}
                  contentStyle={styles.buttonContent}
                  textColor="#fff"
                >
                  Lend Money
                </Button>
              </Card>
            </ScrollView>
          </KeyboardAvoidingView>

          <Snackbar visible={!!error} onDismiss={() => setError("")} duration={3000} style={styles.errorSnackbar}>
            {error}
          </Snackbar>

          <Snackbar visible={!!success} onDismiss={() => setSuccess("")} duration={1800} style={styles.successSnackbar}>
            {success}
          </Snackbar>

          <ConfettiCannon count={70} origin={{ x: -10, y: 0 }} ref={confettiRef} autoStart={false} />
        </View>
      </ImageBackground>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)" },
  keyboardView: { flex: 1 },
  content: { flexGrow: 1, padding: 20, justifyContent: "center" },
  inputCard: { padding: 16, borderRadius: 16, elevation: 6, backgroundColor: "#fff" },
  subtitle: { fontSize: 16, color: "#666", marginBottom: 20, textAlign: "center" },
  input: { marginBottom: 16, backgroundColor: "#fff" },
  totalCard: { backgroundColor: "#EDE7F6", padding: 16, borderRadius: 10, marginBottom: 16, alignItems: "center", elevation: 2 },
  calcLabel: { fontSize: 14, color: "#555", marginBottom: 6 },
  calcAmount: { fontSize: 26, fontWeight: "bold", color: "#6200EE" },
  button: { marginTop: 10, borderRadius: 25, backgroundColor: "#6200EE" },
  buttonContent: { paddingVertical: 10 },
  successSnackbar: { backgroundColor: "#4CAF50" },
  errorSnackbar: { backgroundColor: "#D32F2F" },
});

export default AddLendingScreen;