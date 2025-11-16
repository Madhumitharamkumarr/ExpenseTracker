// src/screens/LoanTypeSelector.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ArrowLeft } from "lucide-react-native";

export default function LoanTypeSelector({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
      >
        <ArrowLeft size={28} color="#333" />
      </TouchableOpacity>

      <Text style={styles.title}>Add New Loan</Text>

      {/* I GAVE → Lending */}
      <TouchableOpacity
        style={[styles.btn, styles.lendingBtn]}
        onPress={() => navigation.replace("AddLendingScreen")}
      >
        <Text style={styles.btnText}>I GAVE</Text>
      </TouchableOpacity>

      {/* I TOOK → Borrowing */}
      <TouchableOpacity
        style={[styles.btn, styles.borrowBtn]}
        onPress={() => navigation.replace("AddBorrowingScreen")}
      >
        <Text style={styles.btnText}>I TOOK</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  backBtn: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 50,
    color: "#1f2937",
  },
  btn: {
    paddingVertical: 18,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
  },
  lendingBtn: { backgroundColor: "#2563eb" },
  borrowBtn: { backgroundColor: "#16a34a" },
  btnText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
  },
});
