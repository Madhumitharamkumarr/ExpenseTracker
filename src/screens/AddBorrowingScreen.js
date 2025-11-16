// src/screens/AddBorrowingScreen.js
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

const AddBorrowingScreen = ({ navigation }) => {
  const [lenderName, setLenderName] = useState("");
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [interest, setInterest] = useState("");
  const [startDate, setStartDate] = useState(new Date()); // NEW
  const [dueDate, setDueDate] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [startDateOpen, setStartDateOpen] = useState(false); // NEW
  const [dueDateOpen, setDueDateOpen] = useState(false);
  const confettiRef = React.useRef(null);

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
  };

  // FIXED: Calculate interest based on months
  const calculateTotalPayable = () => {
    if (!amount || !interest || !startDate || !dueDate) return "0.00";
    const principal = parseFloat(amount);
    const rate = parseFloat(interest);
    const diffTime = Math.abs(new Date(dueDate) - new Date(startDate));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const months = Math.max(1, Math.ceil(diffDays / 30));
    const interestAmount = (principal * rate * months) / 100;
    const total = principal + interestAmount;
    return total.toFixed(2);
  };

  const handleSubmit = async () => {
    if (!lenderName || !category || !amount || !interest || !dueDate) {
      setError("Please fill all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const loanData = {
        type: "borrowing",
        lenderName,
        category,
        amount: parseFloat(amount),
        interestRate: parseFloat(interest),
        startDate: formatDate(startDate), // NEW
        dueDate: formatDate(dueDate),
      };

      const response = await loanAPI.addLoan(loanData);

      if (response.success) {
        setSuccess("Borrowed successfully!");
        confettiRef.current?.start();
        setTimeout(() => navigation.goBack(), 1800);
      }
    } catch (error) {
      setError("Failed to borrow");
      console.error(error);
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
            <Appbar.Content title="I TOOK (Borrowing)" titleStyle={{ color: "#fff", fontWeight: "bold" }} />
          </Appbar.Header>

          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
            <ScrollView contentContainerStyle={styles.content}>
              <Card style={styles.inputCard}>
                <Text style={styles.title}>Borrowing Details</Text>

                <TextInput
                  label="Lender Name *"
                  value={lenderName}
                  onChangeText={setLenderName}
                  mode="outlined"
                  style={styles.input}
                  left={<TextInput.Icon icon="account" color="#6200ee" />}
                />

                <TextInput
                  label="Category *"
                  value={category}
                  onChangeText={setCategory}
                  mode="outlined"
                  style={styles.input}
                  left={<TextInput.Icon icon="tag" color="#6200ee" />}
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
                  label="Interest (%) *"
                  value={interest}
                  onChangeText={setInterest}
                  keyboardType="decimal-pad"
                  mode="outlined"
                  style={styles.input}
                  left={<TextInput.Icon icon="percent" color="#6200ee" />}
                />

                {/* START DATE */}
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

                {/* DUE DATE */}
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

                {amount && interest && startDate && dueDate && (
                  <Card style={styles.totalCard}>
                    <Text style={styles.calcLabel}>Total Payable</Text>
                    <Text style={styles.calcAmount}>₹{calculateTotalPayable()}</Text>
                  </Card>
                )}

                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  loading={loading}
                  disabled={loading}
                  style={styles.button}
                  contentStyle={styles.buttonContent}
                  textColor="#fff"
                >
                  Borrow Money
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
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20, color: "#333", textAlign: "center" },
  input: { marginBottom: 16, backgroundColor: "#fff" },
  totalCard: { backgroundColor: "#EDE7F6", padding: 16, borderRadius: 10, marginBottom: 16, alignItems: "center", elevation: 2 },
  calcLabel: { fontSize: 14, color: "#555", marginBottom: 6 },
  calcAmount: { fontSize: 26, fontWeight: "bold", color: "#6200EE" },
  button: { marginTop: 10, borderRadius: 25, backgroundColor: "#6200EE" },
  buttonContent: { paddingVertical: 10 },
  successSnackbar: { backgroundColor: "#4CAF50" },
  errorSnackbar: { backgroundColor: "#D32F2F" },
});

export default AddBorrowingScreen;