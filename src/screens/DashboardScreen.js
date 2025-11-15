import React, { useState, useCallback, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  ImageBackground,
} from "react-native";
import { Card, Text, Button, Avatar, Chip } from "react-native-paper";
import { LineChart } from "react-native-chart-kit";
import ConfettiCannon from "react-native-confetti-cannon";
import { analyticsAPI } from "../services/api";
import storage from "../utils/storage";
import { useFocusEffect } from "@react-navigation/native";

const backgroundImage = require("../assets/images/dashboardd.jpeg");

const DashboardScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [suggestions, setSuggestions] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [chartPeriod, setChartPeriod] = useState("week");
  const confettiRef = useRef(null);

  const loadUserData = async () => {
    const userData = await storage.getUser();
    setUser(userData);
  };

  const fetchAnalytics = async () => {
    try {
      const [dashboardRes, chartRes, suggestionsRes] = await Promise.all([
        analyticsAPI.getDashboard(),
        analyticsAPI.getChartData(chartPeriod),
        analyticsAPI.getSuggestions(),
      ]);

      if (dashboardRes.success) setAnalytics(dashboardRes.data);
      if (chartRes.success) setChartData(chartRes.data);
      if (suggestionsRes.success) setSuggestions(suggestionsRes.data);
    } catch (error) {
      console.error("Error fetching analytics:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadUserData();
      fetchAnalytics();
    }, [chartPeriod])
  );

  const handleLogout = async () => {
    await storage.clearAll();
    navigation.replace("Home");
  };

  const goToExpenses = () => {
    navigation.navigate("ExpenseList");
  };

  const handleAddExpense = () => {
    navigation.navigate("AddExpense", {
      onSaveSuccess: () => {
        confettiRef.current?.start();
        fetchAnalytics();
      },
    });
  };

  const handleAddIncome = () => {
    navigation.navigate("AddIncome", {
      onSaveSuccess: () => {
        confettiRef.current?.start();
        fetchAnalytics();
      },
    });
  };

  return (
    <ImageBackground
      source={backgroundImage}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <ScrollView
          style={styles.scroll}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {/* Premium Welcome Section */}
          <View style={styles.welcomeSection}>
            <Avatar.Text
              size={70}
              label={user?.name?.charAt(0).toUpperCase() || "U"}
              style={styles.avatar}
            />
            <Text style={styles.helloUserText}>
              Hello,{" "}
              <Text style={styles.userNameInline}>{user?.name || "User"}</Text>
            </Text>
            <Button
              onPress={handleLogout}
              mode="outlined"
              compact
              textColor="#fff"
              style={styles.logoutBtn}
            >
              Logout
            </Button>
          </View>

          {/* Balance Card */}
          {analytics && (
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.cardTitle}>Current Balance</Text>
                <Text
                  style={[
                    styles.balance,
                    analytics.balance < 0 && styles.negative,
                  ]}
                >
                  ₹{analytics.balance.toFixed(2)}
                </Text>
                <View style={styles.balanceRow}>
                  <View style={styles.balanceCol}>
                    <Text style={styles.subLabel}>Income</Text>
                    <Text style={styles.income}>
                      +₹{analytics.totalIncome.toFixed(2)}
                    </Text>
                  </View>
                  <View style={styles.balanceCol}>
                    <Text style={styles.subLabel}>Expenses</Text>
                    <Text style={styles.expense}>
                      -₹{analytics.totalExpenses.toFixed(2)}
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          )}

          {/* Quick Actions */}
          <View style={styles.actions}>
            <Button
              icon="format-list-bulleted"
              mode="contained"
              onPress={goToExpenses}
              style={styles.actionBtn}
              buttonColor="#e5e3e9ff"
            >
              Expenses
            </Button>

            <Button
              icon="plus"
              mode="contained"
              onPress={handleAddExpense}
              style={styles.actionBtn}
              buttonColor="#e5e3e9ff"
            >
              Expense
            </Button>

            <Button
              icon="cash-plus"
              mode="contained"
              onPress={handleAddIncome}
              style={styles.actionBtn}
              buttonColor="#4CAF50"
            >
              Income
            </Button>
          </View>

          {/* Chart */}
          {chartData && (
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.chartHeader}>
                  <Text style={styles.cardTitle}>Income vs Expenses</Text>
                  <View style={styles.periodToggle}>
                    <Chip
                      selected={chartPeriod === "week"}
                      onPress={() => setChartPeriod("week")}
                      style={[
                        styles.chip,
                        chartPeriod === "week" && styles.chipSelected,
                      ]}
                    >
                      Week
                    </Chip>
                    <Chip
                      selected={chartPeriod === "month"}
                      onPress={() => setChartPeriod("month")}
                      style={[
                        styles.chip,
                        chartPeriod === "month" && styles.chipSelected,
                      ]}
                    >
                      Month
                    </Chip>
                  </View>
                </View>
                <LineChart
                  data={{
                    labels: chartData.labels,
                    datasets: [
                      {
                        data: chartData.income,
                        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                        strokeWidth: 2,
                      },
                      {
                        data: chartData.expenses,
                        color: (opacity = 1) =>
                          `rgba(255, 107, 107, ${opacity})`,
                        strokeWidth: 2,
                      },
                    ],
                    legend: ["Income", "Expenses"],
                  }}
                  width={Dimensions.get("window").width - 40}
                  height={220}
                  chartConfig={{
                    backgroundGradientFrom: "#fff",
                    backgroundGradientTo: "#fff",
                    color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
                    decimalPlaces: 0,
                    style: { borderRadius: 16 },
                  }}
                  bezier
                  style={{ marginVertical: 8, borderRadius: 16 }}
                />
              </Card.Content>
            </Card>
          )}

          {/* Suggestions */}
          {suggestions?.suggestions?.length > 0 && (
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.cardTitle}>Pocket picks💡</Text>
                {suggestions.suggestions.map((s, i) => (
                  <View
                    key={i}
                    style={[
                      styles.suggestionRow,
                      s.type === "warning" && styles.warning,
                      s.type === "success" && styles.success,
                      s.type === "tip" && styles.tip,
                      s.type === "reminder" && styles.reminder,
                    ]}
                  >
                    <Text style={styles.suggestionIcon}>
                      {s.type === "warning"
                        ? "⚠️"
                        : s.type === "success"
                        ? "✅"
                        : s.type === "tip"
                        ? "💡"
                        : "⏰"}
                    </Text>
                    <Text style={styles.suggestionText}>{s.message}</Text>
                  </View>
                ))}
              </Card.Content>
            </Card>
          )}
        </ScrollView>

        <ConfettiCannon
          count={50}
          origin={{ x: Dimensions.get("window").width / 2, y: 0 }}
          autoStart={false}
          ref={confettiRef}
        />
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  overlay: { flex: 1, backgroundColor: "rgba(155, 153, 147, 0.95)" },
  scroll: { flex: 1, padding: 20 },
  welcomeSection: { alignItems: "center", marginBottom: 20 },
  avatar: { backgroundColor: "#7c51b8ff", marginBottom: 10 },
  helloUserText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#f3f2ecff",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },

  userNameInline: {
    fontWeight: "900",
    color: "#f3f2ecff",
  },

  logoutBtn: {
    borderColor: "#fff",
    borderWidth: 1,
    borderRadius: 20,
    marginTop: 15,
    paddingHorizontal: 16,
  },
  card: {
    marginBottom: 20,
    borderRadius: 12,
    elevation: 4,
    backgroundColor: "#fff",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#333",
    textAlign: "center",
  },
  balance: { fontSize: 34, fontWeight: "bold", color: "#333" },
  negative: { color: "#FF6B6B" },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  balanceCol: { alignItems: "center" },
  subLabel: { fontSize: 14, color: "#777" },
  income: { color: "#4CAF50", fontWeight: "600" },
  expense: { color: "#FF6B6B", fontWeight: "600" },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  actionBtn: { flex: 1, borderRadius: 25, marginRight: 8 },
  chartHeader: {
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 8,
  },
  periodToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  chip: {
    height: 32,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
    backgroundColor: "#f0f0f0",
    marginRight: 8,
  },
  chipSelected: { backgroundColor: "#6200ee" },
  suggestionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
    flexWrap: "wrap",
  },
  suggestionIcon: { marginRight: 8, fontSize: 16, lineHeight: 20 },
  suggestionText: { fontSize: 14, color: "#333", flexShrink: 1 },
  warning: { backgroundColor: "#FFF3CD" },
  success: { backgroundColor: "#D4EDDA" },
  tip: { backgroundColor: "#E0F7FA" },
  reminder: { backgroundColor: "#FFF0F5" },
});

export default DashboardScreen;
