import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
} from "react-native";
import {
  Appbar,
  Card,
  Text,
  ActivityIndicator,
  Searchbar,
  Chip,
} from "react-native-paper";
import { loanAPI } from "../services/api";

const LoanListScreen = ({ navigation }) => {
  const [loans, setLoans] = useState([]);
  const [filteredLoans, setFilteredLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchLoans();
  }, []);

  const fetchLoans = async () => {
    try {
      setLoading(true);
      const response = await loanAPI.getAllLoans();
      if (response.success) {
        setLoans(response.data);
        setFilteredLoans(response.data);
      }
    } catch (err) {
      console.error("Error fetching loans:", err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchLoans().finally(() => setRefreshing(false));
  };

  const handleSearch = (query) => {
    setSearch(query);
    const filtered = loans.filter(
      (loan) =>
        loan.borrowerName?.toLowerCase().includes(query.toLowerCase()) ||
        loan.lenderName?.toLowerCase().includes(query.toLowerCase())
    );
    setFilteredLoans(filtered);
  };

  const renderLoan = ({ item }) => (
    <Card
      style={[
        styles.card,
        { borderLeftColor: item.type === "lending" ? "#6200EE" : "#1976D2" },
      ]}
      onPress={() => navigation.navigate("LoanDetails", { loan: item })}
    >
      <Card.Content>
        <View style={styles.row}>
          <Text style={styles.name}>
            {item.type === "lending"
              ? item.borrowerName
              : item.lenderName}
          </Text>
          <Chip
            style={[
              styles.typeChip,
              { backgroundColor: item.type === "lending" ? "#EDE7F6" : "#E3F2FD" },
            ]}
          >
            {item.type.toUpperCase()}
          </Chip>
        </View>
        <Text>Amount: ₹{item.amount}</Text>
        <Text>Interest: {item.interestRate}%</Text>
        <Text>Due: {item.dueDate}</Text>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="All Loans" />
      </Appbar.Header>

      <Searchbar
        placeholder="Search by name..."
        onChangeText={handleSearch}
        value={search}
        style={styles.searchbar}
      />

      {loading ? (
        <ActivityIndicator
          animating={true}
          size="large"
          style={styles.loader}
        />
      ) : (
        <FlatList
          data={filteredLoans}
          keyExtractor={(item) => item._id}
          renderItem={renderLoan}
          contentContainerStyle={{ padding: 10 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No loans found 😕</Text>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8F9FA" },
  header: { backgroundColor: "#6200EE" },
  loader: { marginTop: 50 },
  searchbar: { margin: 10, borderRadius: 8 },
  card: {
    marginVertical: 6,
    borderRadius: 10,
    borderLeftWidth: 5,
    backgroundColor: "#fff",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  typeChip: { alignSelf: "flex-end" },
  emptyText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    color: "#777",
  },
});

export default LoanListScreen;
