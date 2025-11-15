// src/screens/AddLoanScreen.js
import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { TextInput, Button, Appbar, Snackbar, Text, Menu, Card } from "react-native-paper";
import { loanAPI } from "../services/api";

const CATEGORIES = ["Bank", "Friends", "Third Party"];

const AddLoanScreen = ({ route, navigation }) => {
  const { loanType } = route.params;

  // Common fields
  const [amount, setAmount] = useState("");
  const [interestRate, setInterestRate] = useState("0");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Lending-specific
  const [borrowerName, setBorrowerName] = useState("");
  const [borrowerAddress, setBorrowerAddress] = useState("");
  const [borrowerPhone, setBorrowerPhone] = useState("");

  // Borrowing-specific
  const [lenderName, setLenderName] = useState("");
  const [category, setCategory] = useState("Bank");
  const [menuVisible, setMenuVisible] = useState(false);

  // Total calculation
  const calculateTotal = () => {
    if (!amount || !interestRate || !startDate || !dueDate) return "0.00";
    const principal = parseFloat(amount);
    const rate = parseFloat(interestRate);
    const start = new Date(startDate);
    const due = new Date(dueDate);
    const diffDays = Math.ceil(Math.abs(due - start) / (1000 * 60 * 60 * 24));
    const months = Math.max(1, Math.ceil(diffDays / 30));
    const interest = (principal * rate * months) / 100;
    return (principal + interest).toFixed(2);
  };

  // Submit
  const handleSubmit = async () => {
    if (!amount || !dueDate) { setError("Please fill required fields."); return; }
    if (loanType === "lending" && (!borrowerName || !borrowerAddress || !borrowerPhone)) {
      setError("Please fill all lending fields."); return;
    }
    if (loanType === "borrowing" && !lenderName) { setError("Enter lender name."); return; }
    if (isNaN(amount) || parseFloat(amount) <= 0) { setError("Enter valid amount."); return; }

    setLoading(true); setError("");

    const loanData = loanType === "lending" ? {
      type: "lending", borrowerName, borrowerAddress, borrowerPhone,
      amount: parseFloat(amount), interestRate: parseFloat(interestRate),
      startDate, dueDate, notes,
    } : {
      type: "borrowing", lenderName, category,
      amount: parseFloat(amount), interestRate: parseFloat(interestRate),
      startDate, dueDate, notes,
    };

    try {
      const response = await loanAPI.addLoan(loanData);
      if (response.success) {
        setSuccess(loanType === "lending" ? "💸 Lending added!" : "💰 Borrowing added!");
        // Refresh Loan List if callback exists
        route.params?.onLoanAdded?.();
        setTimeout(() => navigation.goBack(), 1500);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add loan.");
    } finally { setLoading(false); }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={loanType === "lending" ? "Add Lending" : "Add Borrowing"} />
      </Appbar.Header>

      <KeyboardAvoidingView behavior={Platform.OS==="ios"?"padding":"height"} style={{ flex:1 }}>
        <ScrollView style={styles.scroll}>
          <Text style={styles.subtitle}>
            {loanType==="lending" ? "Lending money 💸" : "Borrowing money 💰"}
          </Text>

          {loanType==="lending" ? (
            <>
              <TextInput label="Borrower Name *" value={borrowerName} onChangeText={setBorrowerName} mode="outlined" style={styles.input} left={<TextInput.Icon icon="account" />} />
              <TextInput label="Address *" value={borrowerAddress} onChangeText={setBorrowerAddress} mode="outlined" multiline style={styles.input} left={<TextInput.Icon icon="map-marker" />} />
              <TextInput label="Phone *" value={borrowerPhone} onChangeText={setBorrowerPhone} mode="outlined" keyboardType="phone-pad" style={styles.input} left={<TextInput.Icon icon="phone" />} />
            </>
          ) : (
            <>
              <TextInput label="Lender Name *" value={lenderName} onChangeText={setLenderName} mode="outlined" style={styles.input} left={<TextInput.Icon icon="account" />} />
              <Menu visible={menuVisible} onDismiss={()=>setMenuVisible(false)}
                anchor={<TextInput label="Category *" value={category} mode="outlined" style={styles.input} editable={false} onPressIn={()=>setMenuVisible(true)} right={<TextInput.Icon icon="chevron-down" />} left={<TextInput.Icon icon="shape" />} />}
              >
                {CATEGORIES.map(cat=><Menu.Item key={cat} title={cat} onPress={()=>{setCategory(cat); setMenuVisible(false)}} />)}
              </Menu>
            </>
          )}

          <TextInput label="Amount (₹) *" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" mode="outlined" style={styles.input} left={<TextInput.Icon icon="currency-inr" />} />
          <TextInput label="Interest Rate (%)" value={interestRate} onChangeText={setInterestRate} keyboardType="decimal-pad" mode="outlined" style={styles.input} left={<TextInput.Icon icon="percent" />} />
          <TextInput label="Start Date *" value={startDate} onChangeText={setStartDate} placeholder="YYYY-MM-DD" mode="outlined" style={styles.input} left={<TextInput.Icon icon="calendar-start" />} />
          <TextInput label="Due Date *" value={dueDate} onChangeText={setDueDate} placeholder="YYYY-MM-DD" mode="outlined" style={styles.input} left={<TextInput.Icon icon="calendar-end" />} />

          {amount && dueDate && (
            <Card style={styles.totalCard}>
              <Text style={styles.calcLabel}>Total (Principal + Interest)</Text>
              <Text style={styles.calcAmount}>₹{calculateTotal()}</Text>
            </Card>
          )}

          <TextInput label="Notes (Optional)" value={notes} onChangeText={setNotes} multiline numberOfLines={3} mode="outlined" style={styles.input} left={<TextInput.Icon icon="note-text" />} />

          <Button mode="contained" onPress={handleSubmit} loading={loading} disabled={loading} style={styles.button}>
            {loanType==="lending" ? "Save Lending" : "Add Borrowing"}
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>

      <Snackbar visible={!!error} onDismiss={()=>setError("")} duration={3000} style={styles.errorSnackbar}>{error}</Snackbar>
      <Snackbar visible={!!success} onDismiss={()=>setSuccess("")} duration={1500} style={styles.successSnackbar}>{success}</Snackbar>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex:1, backgroundColor:"#F8F9FA" },
  header: { backgroundColor:"#6200EE" },
  scroll: { padding:20 },
  subtitle: { fontSize:16, color:"#666", marginBottom:20, textAlign:"center" },
  input: { marginBottom:16, backgroundColor:"#fff" },
  totalCard: { backgroundColor:"#EDE7F6", padding:16, borderRadius:10, marginBottom:16, alignItems:"center", elevation:2 },
  calcLabel: { fontSize:14, color:"#555", marginBottom:6 },
  calcAmount: { fontSize:26, fontWeight:"bold", color:"#6200EE" },
  button: { marginTop:10, borderRadius:8, backgroundColor:"#6200EE" },
  successSnackbar: { backgroundColor:"#4CAF50" },
  errorSnackbar: { backgroundColor:"#D32F2F" },
});

export default AddLoanScreen;
