// src/screens/LoanDetailScreen.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Appbar, Chip, Button, Divider } from 'react-native-paper';
import { loanAPI } from '../services/api';

const LoanDetailScreen = ({ route, navigation }) => {
  const { loanId } = route.params;
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLoanDetail();
  }, []);

  const fetchLoanDetail = async () => {
    try {
      const response = await loanAPI.getLoanById(loanId);
      if (response.success) {
        setLoan(response.data);
      }
    } catch (error) {
      console.error('Error fetching loan detail:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit',
      month: 'long', 
      year: 'numeric' 
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#FF9800',
      paid: '#4CAF50',
      overdue: '#F44336',
    };
    return colors[status] || '#9E9E9E';
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Appbar.Header style={styles.header}>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Loan Details" />
        </Appbar.Header>
        <View style={styles.loadingContainer}>
          <Text>Loading loan details...</Text>
        </View>
      </View>
    );
  }

  if (!loan) {
    return (
      <View style={styles.container}>
        <Appbar.Header style={styles.header}>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Loan Details" />
        </Appbar.Header>
        <View style={styles.loadingContainer}>
          <Text>No loan details found.</Text>
        </View>
      </View>
    );
  }

  const isBorrowing = loan.type === 'borrowing';

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Loan Details" />
      </Appbar.Header>

      <ScrollView style={styles.content}>

        <Card style={styles.card}>
          <Card.Title 
            title={isBorrowing ? loan.lenderName : loan.borrowerName} 
            subtitle={isBorrowing ? 'Borrowed From' : 'Lent To'} 
          />
          <Card.Content>
            <Text style={styles.label}>Type:</Text>
            <Text>{loan.type.toUpperCase()}</Text>

            <Divider style={styles.divider} />

            <Text style={styles.label}>Amount:</Text>
            <Text>₹{loan.amount}</Text>

            <Text style={styles.label}>Interest Rate:</Text>
            <Text>{loan.interestRate || 0}%</Text>

            {isBorrowing ? (
              <>
                <Text style={styles.label}>Category:</Text>
                <Text>{loan.category || '-'}</Text>
              </>
            ) : (
              <>
                <Text style={styles.label}>Address:</Text>
                <Text>{loan.borrowerAddress || '-'}</Text>

                <Text style={styles.label}>Phone:</Text>
                <Text>{loan.borrowerPhone || '-'}</Text>
              </>
            )}

            <Text style={styles.label}>Start Date:</Text>
            <Text>{formatDate(loan.startDate)}</Text>

            <Text style={styles.label}>Due Date:</Text>
            <Text>{formatDate(loan.dueDate)}</Text>

            <Text style={styles.label}>Total Repayment:</Text>
            <Text>₹{loan.amount + (loan.amount * (loan.interestRate || 0) * Math.max(1, Math.ceil((new Date(loan.dueDate) - new Date(loan.startDate)) / (1000*60*60*24*30)))) / 100}</Text>

            <Text style={styles.label}>Notes:</Text>
            <Text>{loan.notes || '-'}</Text>

            <Text style={styles.label}>Status:</Text>
            <Chip style={{ backgroundColor: getStatusColor(loan.status) }}>
              {loan.status.toUpperCase()}
            </Chip>
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          style={styles.button}
          onPress={() => navigation.navigate('LoanList', { refresh: true })}
        >
          Back to Loan List
        </Button>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { backgroundColor: '#1976D2' },
  content: { padding: 16 },
  card: { marginBottom: 20, elevation: 2 },
  label: { fontWeight: 'bold', marginTop: 10 },
  divider: { marginVertical: 6 },
  button: { marginTop: 10, borderRadius: 8, backgroundColor: '#1976D2' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default LoanDetailScreen;
