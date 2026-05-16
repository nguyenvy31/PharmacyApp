import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import colors from '../../config/colors';
import api from '../../config/api';

export default function CategoriesScreen({ navigation }) {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(api.CATEGORIES);
        const data = await res.json();
        setCategories(data || []);
      } catch (e) {
        console.log(e);
      }
    };
    load();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate('ProductList', {
          categoryId: item.id,
          categoryName: item.name,
        })
      }
    >
     <View style={styles.iconWrap}>
       <Text style={styles.iconText}>
         {item.name.charAt(0).toUpperCase()}
       </Text>
     </View>


      <Text style={styles.name} numberOfLines={2}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Danh mục sản phẩm</Text>

      <FlatList
        data={categories}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        contentContainerStyle={{ padding: 12 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.secondary,
  },

  header: {
    fontSize: 18,
    fontWeight: '700',
    padding: 16,
    color: '#333',
  },

  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,

    // shadow iOS
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },

    // shadow Android
    elevation: 4,
  },

  iconText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
  },


  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
});
