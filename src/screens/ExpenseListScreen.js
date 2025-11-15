import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, ActivityIndicator, ImageBackground } from 'react-native';
import { Card, Text, Appbar, Chip, IconButton, Dialog, Button, Portal } from 'react-native-paper';
import { expenseAPI } from '../services/api';
import { useFocusEffect } from '@react-navigation/native';

const backgroundImage = require('../assets/images/dashboard.jpeg');

const ExpenseListScreen = ({ navigation }) => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ visible: false, id: null });

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await expenseAPI.getExpenses();
      if (response.success) {
        setExpenses(response.data.expenses || response.data);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchExpenses();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchExpenses();
    }, [])
  );

  const handleDelete = async () => {
    try {
      await expenseAPI.deleteExpense(deleteDialog.id);
      setExpenses(expenses.filter(exp => exp._id !== deleteDialog.id));
      setDeleteDialog({ visible: false, id: null });
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      Food: '#FF6B6B',
      Travel: '#4ECDC4',
      Shopping: '#FFE66D',
      Entertainment: '#A8E6CF',
      Bills: '#FF8B94',
      Health: '#C7CEEA',
      Education: '#FFDAC1',
      Other: '#B4B4B4',
    };
    return colors[category] || '#B4B4B4';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderExpenseItem = ({ item }) => (
    <Card style={styles.expenseCard}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.cardLeft}>
            <Text style={styles.expenseName}>{item.name}</Text>
            <Chip 
              mode="flat" 
              style={[styles.categoryChip, { backgroundColor: getCategoryColor(item.category) }]}
              textStyle={styles.chipText}
            >
              {item.category}
            </Chip>
          </View>
          <View style={styles.cardRight}>
            <Text style={styles.expenseAmount}>₹{item.amount.toFixed(2)}</Text>
            <IconButton
              icon="delete"
              size={20}
              iconColor="#fd2525ff"
              onPress={() => setDeleteDialog({ visible: true, id: item._id })}
            />
          </View>
        </View>
        <View style={styles.cardFooter}>
          <Text style={styles.expenseDate}>{formatDate(item.date)}</Text>
          {item.notes && <Text style={styles.expenseNotes}>{item.notes}</Text>}
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <ImageBackground source={backgroundImage} style={styles.background} resizeMode="cover">
      <View style={styles.overlay}>
        <Appbar.Header style={{ backgroundColor: 'transparent' }}>
          <Appbar.BackAction onPress={() => navigation.goBack()} color="#fff" />
          <Appbar.Content 
            title="All Expenses" 
            titleStyle={{ color: '#fff', fontWeight: 'bold', fontSize: 22 }} 
          />
        </Appbar.Header>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        ) : expenses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyText}>No expenses yet</Text>
            <Text style={styles.emptySubtext}>Start tracking by adding your first expense</Text>
          </View>
        ) : (
          <FlatList
            data={expenses}
            renderItem={renderExpenseItem}
            keyExtractor={(item) => item._id || item.id.toString()}
            contentContainerStyle={styles.listContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <Portal>
          <Dialog 
            visible={deleteDialog.visible} 
            onDismiss={() => setDeleteDialog({ visible: false, id: null })}
          >
            <Dialog.Title>Delete Expense</Dialog.Title>
            <Dialog.Content>
              <Text>Are you sure you want to delete this expense?</Text>
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={() => setDeleteDialog({ visible: false, id: null })}>
                Cancel
              </Button>
              <Button onPress={handleDelete} textColor="#FF5252">
                Delete
              </Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </View>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: { flex: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)' },

  listContent: { padding: 20, paddingBottom: 50 },

  expenseCard: {
    marginBottom: 14,
    borderRadius: 16,
    elevation: 6,
    backgroundColor: '#fbffffee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },

  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 8 
  },

  cardLeft: { flex: 1 },
  cardRight: { flexDirection: 'row', alignItems: 'center' },

  expenseName: { fontSize: 18, fontWeight: '700', color: '#222', marginBottom: 6 },
  categoryChip: { alignSelf: 'flex-start',alignItems: 'center', height: 30, borderRadius: 12, marginBottom: 8,paddingBottom: 2 },
  chipText: { fontSize: 10, color: '#fff', fontWeight: '900' },

  expenseAmount: { fontSize: 20, fontWeight: '900', color: '#181818', marginRight: 8 },

  cardFooter: { marginTop: 8 },
  expenseDate: { fontSize: 13, color: '#777', marginBottom: 4 },
  expenseNotes: { fontSize: 14, color: '#555', fontStyle: 'italic' },

  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIcon: { fontSize: 60, marginBottom: 16 },
  emptyText: { fontSize: 22, fontWeight: '700', color: '#fff', marginBottom: 6 },
  emptySubtext: { fontSize: 14, color: '#ddd', textAlign: 'center' },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});

export default ExpenseListScreen;
