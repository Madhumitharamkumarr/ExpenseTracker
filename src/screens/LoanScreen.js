// src/screens/LoanScreen.js
import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { Appbar, Button, Menu, Text } from "react-native-paper";

const LoanScreen = ({ navigation }) => {
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Add Loan" />
      </Appbar.Header>

      <View style={styles.content}>
        <Text style={styles.title}>Choose Loan Type</Text>

        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Button
              mode="contained"
              onPress={() => setMenuVisible(true)}
              style={styles.button}
            >
              ➕ Add Loan
            </Button>
          }
        >
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              navigation.navigate("AddLoan", { loanType: "lending" });
            }}
            title="💸 Lending"
          />
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              navigation.navigate("AddLoan", { loanType: "borrowing" });
            }}
            title="💰 Borrowing"
          />
        </Menu>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  header: { backgroundColor: "#6200EE" },
  content: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 30 },
  button: { width: 200, borderRadius: 10, backgroundColor: "#6200EE" },
});

export default LoanScreen;
