// src/screens/NotificationScreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Card, IconButton } from 'react-native-paper';
import API from '../services/api';

export default function NotificationScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await API.get('/api/notifications'); // FIXED
      setNotifications(res.data.data || []); // data.data → from backend
    } catch (err) {
      console.error("Fetch notifications error:", err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await API.patch(`/api/notifications/${id}/read`); // PATCH + /api/notifications
      fetchNotifications();
    } catch (err) {
      console.error("Mark as read error:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const renderItem = ({ item }) => (
    <Card style={[styles.inputCard, !item.isRead && styles.unread]}>
      <Card.Content>
        <View style={styles.row}>
          <Text style={styles.title}>{item.title}</Text>
          {!item.isRead && (
            <TouchableOpacity onPress={() => markAsRead(item._id)}>
              <Text style={styles.readBtn}>Mark as Read</Text>
            </TouchableOpacity>
          )}
        </View>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.date}>
          {new Date(item.createdAt).toLocaleDateString('en-IN')}
        </Text>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.overlay}>
      {/* Premium Header */}
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          size={28}
          onPress={() => navigation.goBack()}
          color="#fff"
          style={styles.backBtn}
        />
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      {loading ? (
        <Text style={styles.loading}>Loading...</Text>
      ) : notifications.length === 0 ? (
        <Text style={styles.empty}>No notifications yet</Text>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 12,
    backgroundColor: "transparent",
    marginTop: 30,
  },
  backBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 30,
  },
  headerTitle: {
    fontSize: 23,
    fontWeight: 'bold',
    color: "#fff",
    letterSpacing: 0.3,
  },
  content: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
  },
  inputCard: {
    padding: 16,
    borderRadius: 16,
    elevation: 6,
    backgroundColor: "#fff",
    marginBottom: 16,
  },
  unread: {
    borderLeftWidth: 5,
    borderLeftColor: "#6200ee",
    backgroundColor: "#f8f5ff",
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  title: {
    fontSize: 16.5,
    fontWeight: '700',
    color: '#1e293b',
    flex: 1,
    marginRight: 8,
  },
  message: {
    fontSize: 14.2,
    color: '#475569',
    lineHeight: 21,
    marginBottom: 6,
  },
  date: {
    fontSize: 12.5,
    color: '#64748b',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  readBtn: {
    color: '#6200ee',
    fontSize: 12.5,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#ede9fe',
    borderRadius: 20,
    overflow: 'hidden',
  },
  loading: {
    textAlign: 'center',
    marginTop: 80,
    fontSize: 17,
    color: '#fff',
    fontWeight: '600',
    fontStyle: 'italic',
  },
  empty: {
    textAlign: 'center',
    marginTop: 100,
    fontSize: 18,
    color: '#fff',
    fontWeight: '600',
    fontStyle: 'italic',
  },
});