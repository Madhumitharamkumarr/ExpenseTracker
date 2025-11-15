import React, { useState, useCallback } from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { Card, Text, Appbar, Chip, IconButton, Dialog, Button, Portal } from 'react-native-paper';
import { incomeAPI } from '../services/api';
import { useFocusEffect } from '@react-navigation/native';

const IncomeListScreen = ({ navigation }) => {
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ visible: false, id: null });

  const fetchIncomes = async () => {
    try {
      setLoading(true);
      const response = await incomeAPI.getIncomes();
      if (response.success) {
        setIncomes(response.data.incomes);
      }
    } catch (error) {
      console.error('Error fetching incomes:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchIncomes();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchIncomes();
    }, [])
  );

  const handleDelete = async () => {
    try {
      await incomeAPI.deleteIncome(deleteDialog.id);
      setIncomes(incomes.filter(inc => inc._id !== deleteDialog.id));
      setDeleteDialog({ visible: false, id: null });
    } catch (error) {
      console.error('Error deleting income:', error);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      Salary: '#4CAF50',
      Freelance: '#2196F3',
      Investment: '#FF9800',
      Business: '#9C27B0',
      Gift: '#E91E63',
      Other: '#607D8B',
      'Home Maker': '#FF5722',
    };
    return colors[category] || '#607D8B';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const renderIncomeItem = ({ item }) => (
    <Card style={styles.incomeCard}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <View style={styles.cardLeft}>
            <Text style={styles.incomeName}>{item.source}</Text>
            <Chip 
              mode="flat" 
              style={[styles.categoryChip, { backgroundColor: getCategoryColor(item.category) }]}
              textStyle={styles.chipText}
            >
              {item.category}
            </Chip>
          </View>
          <View style={styles.cardRight}>
            <Text style={styles.incomeAmount}>+₹{item.amount.toFixed(2)}</Text>
            <IconButton
              icon="delete"
              size={20}
              iconColor="#FF5252"
              onPress={() => setDeleteDialog({ visible: true, id: item._id })}
            />
          </View>
        </View>
        <View style={styles.cardFooter}>
          <Text style={styles.incomeDate}>{formatDate(item.date)}</Text>
          {item.notes && <Text style={styles.incomeNotes}>{item.notes}</Text>}
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="All Income" />
        <Appbar.Action 
          icon="plus" 
          onPress={() => navigation.navigate('AddIncome')} 
        />
      </Appbar.Header>

      {incomes.length === 0 && !loading ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>💰</Text>
          <Text style={styles.emptyText}>No income recorded yet</Text>
          <Text style={styles.emptySubtext}>Start tracking by adding your first income source</Text>
        </View>
      ) : (
        <FlatList
          data={incomes}
          renderItem={renderIncomeItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}

      <Portal>
        <Dialog 
          visible={deleteDialog.visible} 
          onDismiss={() => setDeleteDialog({ visible: false, id: null })}
        >
          <Dialog.Title>Delete Income</Dialog.Title>
          <Dialog.Content>
            <Text>Are you sure you want to delete this income record?</Text>
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
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#4CAF50',
  },
  listContent: {
    padding: 20,
  },
  incomeCard: {
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardLeft: {
    flex: 1,
  },
  cardRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  incomeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  categoryChip: {
    alignSelf: 'flex-start',
    height: 28,
  },
  chipText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  incomeAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginRight: 8,
  },
  cardFooter: {
    marginTop: 8,
  },
  incomeDate: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  incomeNotes: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});

export default IncomeListScreen;