// src/components/NotificationBell.js
import { useEffect, useState } from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { Bell } from 'lucide-react-native';
import API from '../services/api';

export default function NotificationBell({ navigation }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchCount = async () => {
    try {
      const res = await API.get('/notification?unreadOnly=true');
      setCount(res.data.unreadCount);
    } catch (err) {}
  };

  return (
    <TouchableOpacity onPress={() => navigation.navigate('NotificationScreen')}>
      <View>
        <Bell size={28} color="#fff" />
        {count > 0 && (
          <View style={{
            position: 'absolute', right: -6, top: -3,
            backgroundColor: '#FF3B30', borderRadius: 10,
            minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center'
          }}>
            <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>{count}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}