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
  Menu,
  Card,
  Provider as PaperProvider,
} from "react-native-paper";
import { DatePickerModal } from "react-native-paper-dates";
import { incomeAPI } from "../services/api";

const INCOME_CATEGORIES = [
  "Salary",
  "Freelance",
  "Investment",
  "Business",
  "Gift",
  "HomeMaker",
  "Other",
];

const backgroundImage = require("../assets/images/dashboard.jpeg");

const AddIncomeScreen = ({ navigation }) => {
  const [source, setSource] = useState("");
  const [category, setCategory] = useState("Salary");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  const formatDate = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${(d.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
  };

  const handleAddIncome = async () => {
    if (!source || !amount) {
      setError("Please fill in source and amount");
      return;
    }

    if (isNaN(amount) || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const incomeData = {
        source,
        category,
        amount: parseFloat(amount),
        date: formatDate(date),
        notes,
      };

      const response = await incomeAPI.addIncome(incomeData);

      if (response.success) {
        setSuccess("Income added successfully! 💰");
        setSource("");
        setCategory("Salary");
        setAmount("");
        setDate(new Date());
        setNotes("");

        setTimeout(() => {
          navigation.goBack();
        }, 1500);
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to add income. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputTheme = {
    colors: {
      text: "#000", // typed text
      onSurface: "#000", // ensures text is black in Paper TextInput
      placeholder: "#666", // placeholder grey
      primary: "#6200ee",
      background: "#fff",
    },
  };

  return (
    <PaperProvider>
      <ImageBackground
        source={backgroundImage}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <Appbar.Header elevated style={{ backgroundColor: "transparent" }}>
            <Appbar.BackAction
              onPress={() => navigation.goBack()}
              color="#fff"
            />
            <Appbar.Content
              title="Add Income"
              titleStyle={{ color: "#fff", fontWeight: "bold" }}
            />
          </Appbar.Header>

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardView}
          >
            <ScrollView contentContainerStyle={styles.content}>
              <Card style={styles.inputCard}>
                {/* Income Source */}
                <TextInput
                  label="Income Source *"
                  value={source}
                  onChangeText={setSource}
                  mode="outlined"
                  placeholder="e.g., Salary, Freelance"
                  style={styles.input}
                  theme={inputTheme}
                  left={<TextInput.Icon icon="briefcase" color="#6200ee" />}
                />

                {/* Category Dropdown */}
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
                        theme={inputTheme}
                        left={<TextInput.Icon icon="tag" color="#6200ee" />}
                        right={
                          <TextInput.Icon icon="chevron-down" color="#6200ee" />
                        }
                      />
                    </TouchableOpacity>
                  }
                  contentStyle={{ backgroundColor: "#fff" }}
                >
                  {INCOME_CATEGORIES.map((cat) => (
                    <Menu.Item
                      key={cat}
                      onPress={() => {
                        setCategory(cat);
                        setMenuVisible(false);
                      }}
                      title={cat}
                      titleStyle={{ color: "#000" }}
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
                  placeholder="0.00"
                  style={styles.input}
                  theme={inputTheme}
                  left={<TextInput.Icon icon="currency-inr" color="#6200ee" />}
                />

                {/* Date Picker */}
                <TouchableOpacity onPress={() => setDatePickerVisible(true)}>
                  <TextInput
                    label="Date"
                    value={formatDate(date)}
                    mode="outlined"
                    style={styles.input}
                    editable={false}
                    theme={inputTheme}
                    left={<TextInput.Icon icon="calendar" color="#6200ee" />}
                  />
                </TouchableOpacity>

                <DatePickerModal
                  mode="single"
                  visible={datePickerVisible}
                  onDismiss={() => setDatePickerVisible(false)}
                  date={date}
                  onConfirm={(params) => {
                    if (params.date) setDate(params.date);
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
                  theme={inputTheme}
                  left={<TextInput.Icon icon="note-text" color="#6200ee" />}
                />

                {/* Button */}
                <Button
                  mode="contained"
                  onPress={handleAddIncome}
                  loading={loading}
                  disabled={loading}
                  style={styles.button}
                  contentStyle={styles.buttonContent}
                  textColor="#fff"
                >
                  Add Income
                </Button>
              </Card>
            </ScrollView>
          </KeyboardAvoidingView>

          {/* Snackbars */}
          <Snackbar
            visible={!!error}
            onDismiss={() => setError("")}
            duration={3000}
            action={{ label: "OK", onPress: () => setError("") }}
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
      </ImageBackground>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)" },
  keyboardView: { flex: 1 },
  content: { flexGrow: 1, padding: 20, justifyContent: "center" },
  inputCard: {
    padding: 16,
    borderRadius: 16,
    elevation: 6,
    backgroundColor: "#fff",
  },
  input: { marginBottom: 16, backgroundColor: "#fff" },
  button: { marginTop: 12, borderRadius: 25, backgroundColor: "#6200ee" },
  buttonContent: { paddingVertical: 10 },
  successSnackbar: { backgroundColor: "#4CAF50" },
});

export default AddIncomeScreen;
