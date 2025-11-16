// src/screens/LoanDetailScreen.js
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Card, Text, Appbar, Chip, Button, Divider, Menu, ActivityIndicator } from 'react-native-paper';
import { loanAPI } from '../services/api';

const LoanDetailScreen = ({ route, navigation }) => {
  const { loanId } = route.params;
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    fetchLoanDetail();
  }, [loanId]);

  const fetchLoanDetail = async () => {
    try {
      setLoading(true);
      const response = await loanAPI.getLoanById(loanId);
      console.log('Loan detail response:', response);
      
      if (response.success) {
        setLoan(response.data);
      } else {
        Alert.alert('Error', response.message || 'Failed to fetch loan details');
      }
    } catch (error) {
      console.error('Error fetching loan detail:', error);
      Alert.alert('Error', 'Failed to load loan details');
    } finally {
      setLoading(false);
    }
  };

  const updateLoanStatus = async (newStatus) => {
    try {
      setUpdating(true);
      const response = await loanAPI.updateLoanStatus(loanId, newStatus);
      
      if (response.success) {
        setLoan(prev => ({ ...prev, status: newStatus }));
        Alert.alert('Success', `Loan marked as ${newStatus}`);
      } else {
        Alert.alert('Error', response.message || 'Failed to update status');
      }
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', 'Failed to update loan status');
    } finally {
      setUpdating(false);
      setMenuVisible(false);
    }
  };

  const deleteLoan = async () => {
    Alert.alert(
      'Delete Loan',
      'Are you sure you want to delete this loan?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await loanAPI.deleteLoan(loanId);
              if (response.success) {
                Alert.alert('Success', 'Loan deleted successfully');
                navigation.navigate('LoanList', { refresh: true });
              }
            } catch (error) {
              console.error('Error deleting loan:', error);
              Alert.alert('Error', 'Failed to delete loan');
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', { 
        day: '2-digit',
        month: 'long', 
        year: 'numeric' 
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#FF9800',
      paid: '#4CAF50',
      overdue: '#F44336',
    };
    return colors[status] || '#9E9E9E';
  };

  const calculateTotalPayable = () => {
    if (!loan) return 0;
    
    try {
      // Use backend calculated total if available
      if (loan.totalPayable) {
        return loan.totalPayable;
      }
      
      // Fallback calculation
      const principal = loan.amount || 0;
      const interestRate = loan.interestRate || 0;
      
      if (!loan.startDate || !loan.dueDate) {
        return principal;
      }
      
      const start = new Date(loan.startDate);
      const due = new Date(loan.dueDate);
      const diffTime = Math.abs(due - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      const months = Math.max(1, Math.ceil(diffDays / 30));
      const interest = (principal * interestRate * months) / 100;
      
      return principal + interest;
    } catch (error) {
      return loan.amount || 0;
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Appbar.Header style={styles.header}>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Loan Details" />
        </Appbar.Header>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#1976D2" />
          <Text style={styles.loadingText}>Loading loan details...</Text>
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
        <View style={styles.centerContainer}>
          <Text>No loan details found.</Text>
          <Button 
            mode="contained" 
            onPress={fetchLoanDetail}
            style={styles.retryButton}
          >
            Retry
          </Button>
        </View>
      </View>
    );
  }

  const isBorrowing = loan.type === 'borrowing';
  const totalPayable = calculateTotalPayable();

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Loan Details" />
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Appbar.Action 
              icon="dots-vertical" 
              onPress={() => setMenuVisible(true)} 
            />
          }>
          {loan.status !== 'paid' && (
            <Menu.Item
              title="Mark as Paid"
              onPress={() => updateLoanStatus('paid')}
              leadingIcon="check-circle"
            />
          )}
          {loan.status !== 'pending' && (
            <Menu.Item
              title="Mark as Pending"
              onPress={() => updateLoanStatus('pending')}
              leadingIcon="clock"
            />
          )}
          <Menu.Item
            title="Delete Loan"
            onPress={deleteLoan}
            leadingIcon="delete"
            titleStyle={{ color: '#FF0000' }}
          />
        </Menu>
      </Appbar.Header>

      <ScrollView style={styles.content}>
        {/* Main Loan Card */}
        <Card style={styles.card}>
          <Card.Title 
            title={isBorrowing ? loan.lenderName : loan.borrowerName} 
            subtitle={isBorrowing ? 'Borrowed From' : 'Lent To'} 
            titleStyle={styles.personName}
          />
          <Card.Content>
            <View style={styles.statusRow}>
              <Text style={styles.label}>Status:</Text>
              <Chip 
                textStyle={{ color: '#fff', fontWeight: 'bold' }}
                style={{ backgroundColor: getStatusColor(loan.status) }}
              >
                {loan.status.toUpperCase()}
              </Chip>
            </View>

            <Divider style={styles.divider} />

            <View style={styles.detailRow}>
              <Text style={styles.label}>Type:</Text>
              <Text style={styles.value}>{loan.type.toUpperCase()}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.label}>Principal Amount:</Text>
              <Text style={styles.value}>₹{loan.amount?.toLocaleString()}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.label}>Interest Rate:</Text>
              <Text style={styles.value}>{loan.interestRate || 0}%</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.label}>Total Payable:</Text>
              <Text style={[styles.value, styles.totalAmount]}>₹{totalPayable.toFixed(2)}</Text>
            </View>

            <Divider style={styles.divider} />

            {isBorrowing ? (
              <>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Category:</Text>
                  <Text style={styles.value}>{loan.category || 'Not specified'}</Text>
                </View>
              </>
            ) : (
              <>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Address:</Text>
                  <Text style={styles.value}>{loan.borrowerAddress || 'Not provided'}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.label}>Phone:</Text>
                  <Text style={styles.value}>{loan.borrowerPhone || 'Not provided'}</Text>
                </View>
              </>
            )}

            <Divider style={styles.divider} />

            <View style={styles.detailRow}>
              <Text style={styles.label}>Start Date:</Text>
              <Text style={styles.value}>{formatDate(loan.startDate)}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.label}>Due Date:</Text>
              <Text style={styles.value}>{formatDate(loan.dueDate)}</Text>
            </View>

            {loan.paidDate && (
              <View style={styles.detailRow}>
                <Text style={styles.label}>Paid Date:</Text>
                <Text style={styles.value}>{formatDate(loan.paidDate)}</Text>
              </View>
            )}

            <Divider style={styles.divider} />

            <View style={styles.notesSection}>
              <Text style={styles.label}>Notes:</Text>
              <Text style={styles.notesText}>{loan.notes || 'No notes added'}</Text>
            </View>
          </Card.Content>
        </Card>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            style={styles.button}
            onPress={() => navigation.navigate('LoanList', { refresh: true })}
          >
            Back to List
          </Button>
          
          {loan.status !== 'paid' && (
            <Button
              mode="contained"
              style={styles.button}
              loading={updating}
              onPress={() => updateLoanStatus('paid')}
            >
              Mark as Paid
            </Button>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { backgroundColor: '#1976D2' },
  content: { padding: 16 },
  centerContainer: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 20 
  },
  loadingText: { marginTop: 10, fontSize: 16 },
  card: { 
    marginBottom: 20, 
    elevation: 4,
    borderRadius: 12 
  },
  personName: { 
    fontSize: 20, 
    fontWeight: 'bold',
    color: '#1976D2' 
  },
  statusRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    marginBottom: 10 
  },
  detailRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6 
  },
  label: { 
    fontWeight: '600', 
    color: '#666',
    fontSize: 14 
  },
  value: { 
    fontSize: 14,
    color: '#333' 
  },
  totalAmount: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#1976D2'
  },
  divider: { 
    marginVertical: 12,
    backgroundColor: '#E0E0E0' 
  },
  notesSection: {
    marginTop: 8
  },
  notesText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    lineHeight: 20
  },
  buttonContainer: {
    gap: 12
  },
  button: {
    borderRadius: 8,
  },
  retryButton: {
    marginTop: 16
  }
});

export default LoanDetailScreen;