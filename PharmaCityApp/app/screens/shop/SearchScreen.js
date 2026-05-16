import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import colors from '../../config/colors';
import api from '../../config/api';
import MedicineCard from '../../components/MedicineCard';
import { useCart } from '../../context/CartContext';

const popularKeywords = ['Thuốc hạ sốt', 'Vitamin C', 'Khẩu trang', 'Siro ho'];

export default function SearchScreen({ navigation, route }) {
  const [keyword, setKeyword] = useState(route?.params?.keyword || '');
  const [results, setResults] = useState([]);
  const [history, setHistory] = useState([]);
  const { addToCart } = useCart();

  useEffect(() => {
    if (keyword) handleSearch(keyword);
  }, []);

  const handleSearch = async (kw) => {
    const q = (kw || keyword).trim();
    if (!q) return;
    try {
      const res = await fetch(`${api.MEDICINES}?search=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data || []);
      if (!history.includes(q)) {
        setHistory((prev) => [q, ...prev].slice(0, 10));
      }
      Keyboard.dismiss();
    } catch (e) {
      console.log(e);
    }
  };

  const renderProduct = ({ item }) => (
    <MedicineCard
      item={item}
      onPress={() =>
        navigation.navigate('ProductDetail', { medicineId: item.id })
      }
      onAddToCart={() => addToCart(item)}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <TextInput
          autoFocus
          placeholder="Tìm tên thuốc, bệnh, hoạt chất..."
          style={styles.searchInput}
          value={keyword}
          onChangeText={setKeyword}
          onSubmitEditing={() => handleSearch(keyword)}
        />
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => handleSearch(keyword)}
        >
          <Text style={{ color: 'white', fontWeight: '600' }}>Tìm</Text>
        </TouchableOpacity>
      </View>

      {!keyword && results.length === 0 ? (
        <View style={styles.suggestionContainer}>
          <Text style={styles.sectionTitle}>Từ khóa phổ biến</Text>
          <View style={styles.chipContainer}>
            {popularKeywords.map((k) => (
              <TouchableOpacity
                key={k}
                style={styles.chip}
                onPress={() => {
                  setKeyword(k);
                  handleSearch(k);
                }}
              >
                <Text style={styles.chipText}>{k}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {history.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Lịch sử tìm kiếm</Text>
              {history.map((h) => (
                <TouchableOpacity
                  key={h}
                  onPress={() => {
                    setKeyword(h);
                    handleSearch(h);
                  }}
                >
                  <Text style={styles.historyItem}>{h}</Text>
                </TouchableOpacity>
              ))}
            </>
          )}
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderProduct}
          numColumns={2}
          contentContainerStyle={{ paddingHorizontal: 6, paddingTop: 10 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.secondary },
  searchRow: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: colors.secondary,
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 20,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
  },
  searchButton: {
    backgroundColor: colors.primary,
    borderRadius: 20,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  suggestionContainer: { padding: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '600', marginTop: 12, marginBottom: 6 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: {
    backgroundColor: colors.lightGreen,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: { fontSize: 13, color: 'white' },
  historyItem: { paddingVertical: 6, fontSize: 14 },
});
