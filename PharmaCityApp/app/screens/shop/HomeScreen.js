import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Image,
} from 'react-native';
import colors from '../../config/colors';
import Ionicons from 'react-native-vector-icons/Ionicons';
import api from '../../config/api';
import MedicineCard from '../../components/MedicineCard';
import { useCart } from '../../context/CartContext';

export default function HomeScreen({ navigation }) {
  const [searchText, setSearchText] = useState('');
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const { addToCart } = useCart();

  useEffect(() => {
    fetchCategories();
    fetchFeatured(1); // load trang đầu
  }, []);

  // ================== FETCH CATEGORIES ==================
  const fetchCategories = async () => {
    try {
      const res = await fetch(api.CATEGORIES);
      const data = await res.json();
      setCategories(data || []);
    } catch (e) {
      console.log('Error categories', e);
    }
  };

  // ================== FETCH FEATURED MEDICINES ==================
  const fetchFeatured = async (nextPage = 1) => {
    if (!hasMore && nextPage !== 1) return; // hết sản phẩm
    try {
      setLoading(true);
      const res = await fetch(`${api.MEDICINES}?limit=10&page=${nextPage}`);
      const data = await res.json();

      if (!data || data.length === 0) {
        setHasMore(false); // hết sản phẩm
        return;
      }

      if (nextPage === 1) {
        setFeatured(data);
      } else {
        setFeatured((prev) => [...prev, ...data]);
      }

      setPage(nextPage);
      if (data.length < 10) setHasMore(false); // nếu < limit → hết
    } catch (e) {
      console.log('Error featured', e);
    } finally {
      setLoading(false);
    }
  };

  // ================== SEARCH ==================
  const handleSearchSubmit = () => {
    const q = searchText.trim();
    if (!q) return;
    navigation.navigate('Search', { keyword: q });
  };

  // ================== RENDER CATEGORY ==================
  const renderCategory = ({ item, index }) => {
    // Màu sắc cho các icon (đổi thành các tông xanh dương)
    const iconColors = [
      '#3498db', '#5dade2', '#85c1e9', '#2e86c1', '#5499c7',
      '#2980b9', '#7fb3d5', '#1f618d', '#5dade2', '#3498db'
    ];


    const categoryIcons = ['💊', '🩺', '🧴', '🧬', '🩹', '🌡️', '🦠', '❤️', '👶', '🧴'];

    const iconColor = iconColors[index % iconColors.length];
    const iconEmoji = categoryIcons[index % categoryIcons.length] || '💊';

    return (
      <TouchableOpacity
        style={styles.categoryItem}
        activeOpacity={0.7}
        onPress={() =>
          navigation.navigate('ProductList', {
            categoryId: item.id,
            categoryName: item.name,
          })
        }
      >
        <View style={[styles.categoryIcon, { backgroundColor: iconColor }]}>
          <View style={styles.iconWrapper}>
            <Text style={styles.iconText}>{iconEmoji}</Text>
          </View>
        </View>
        <Text numberOfLines={2} style={styles.categoryName}>
          {item.name}
        </Text>
      </TouchableOpacity>
    );
  };

  // ================== RENDER PRODUCT ==================
  const renderProduct = ({ item }) => (
    <MedicineCard
      item={item}
      onPress={() =>
        navigation.navigate('ProductDetail', {
          medicineId: item.id,
        })
      }
      onAddToCart={() => addToCart(item)}
    />
  );

  // ================== FOOTER LOAD MORE ==================
  const renderFooter = () => {
    if (!hasMore) return null;
    return (
      <TouchableOpacity
        style={styles.loadMoreBtn}
        onPress={() => fetchFeatured(page + 1)}
      >
        <Text style={{ color: 'white', fontWeight: 'bold' }}>
          {loading ? 'Đang tải...' : 'Xem thêm'}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Thanh tìm kiếm */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Tìm tên thuốc, bệnh, hoạt chất..."
          placeholderTextColor="#888"
          style={styles.searchInput}
          value={searchText}
          onChangeText={setSearchText}
          onSubmitEditing={handleSearchSubmit}
        />
      </View>

      {/* Banner khuyến mãi */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.bannerContainer}
        pagingEnabled
      >
        {[1, 2, 3].map((id) => (
          <View key={id} style={styles.bannerItem}>
            <Image
              source={require('../../assets/banner-placeholder.png')}
              style={styles.bannerImage}
            />
          </View>
        ))}
      </ScrollView>

      {/* Danh mục */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Danh mục sản phẩm</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Categories')}
          style={{ padding: 4 }}
        >
          <Text style={styles.sectionLink}>Xem tất cả →</Text>
        </TouchableOpacity>
      </View>
      <View style={{ backgroundColor: 'white', paddingVertical: 8 }}>
        <FlatList
          data={categories}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          renderItem={renderCategory}
          contentContainerStyle={{
            paddingHorizontal: 10,
            paddingBottom: 4,
          }}
          decelerationRate="fast"
          snapToInterval={96} // width + margin
        />
      </View>

      {/* Sản phẩm nổi bật */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Tất cả sản phẩm</Text>
      </View>
      <FlatList
        data={featured}
        numColumns={2}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderProduct}
        scrollEnabled={false}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          !loading && (
            <Text style={{ textAlign: 'center', marginVertical: 10 }}>
              Chưa có sản phẩm.
            </Text>
          )
        }
        contentContainerStyle={{ paddingHorizontal: 6, paddingBottom: 20 }}
      />

      {/* Góc sức khỏe */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Góc sức khỏe</Text>
      </View>
      <View style={styles.articleCard}>
        <Text style={styles.articleTitle}>5 lưu ý khi dùng thuốc hạ sốt</Text>
        <Text style={styles.articleText} numberOfLines={2}>
          Không nên tự ý kết hợp nhiều loại thuốc hạ sốt, cần uống đúng liều và
          đúng khoảng cách giữa các lần dùng...
        </Text>
      </View>
      <TouchableOpacity
        style={styles.chatButton}
        onPress={() => navigation.navigate('ChatBot')}
      >
        <Text style={{ fontSize: 26, color: "white" }}>💬</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.secondary },
  searchContainer: { padding: 12, paddingTop: 16 },
  searchInput: {
    backgroundColor: 'white',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 14,
  },
  bannerContainer: { height: 120 },

  bannerItem: {
    width: 320,
    marginHorizontal: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },

  bannerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  },

   sectionHeaderRow: {
     marginTop: 20,
     paddingHorizontal: 16,
     paddingVertical: 8,
     flexDirection: 'row',
     justifyContent: 'space-between',
     alignItems: 'center',
     backgroundColor: 'white',
   },
   sectionTitle: {
     fontSize: 18,
     fontWeight: '700',
     color: colors.primary,
     letterSpacing: -0.3,
   },
   sectionLink: {
     fontSize: 14,
     color: '#3498db', // Đổi từ colors.accent thành xanh dương
     fontWeight: '500',
   },
   categoryItem: {
     width: 85,
     alignItems: 'center',
     marginVertical: 8,
     marginHorizontal: 6,
   },
   categoryIcon: {
     width: 68,
     height: 68,
     borderRadius: 16,
     backgroundColor: colors.primary,
     justifyContent: 'center',
     alignItems: 'center',
     marginBottom: 8,
     elevation: 3,
     shadowColor: '#000',
     shadowOffset: { width: 0, height: 2 },
     shadowOpacity: 0.15,
     shadowRadius: 4,
     borderWidth: 3,
     borderColor: 'white',
   },
   iconWrapper: {
     width: 44,
     height: 44,
     borderRadius: 12,
     backgroundColor: 'rgba(255, 255, 255, 0.9)',
     justifyContent: 'center',
     alignItems: 'center',
   },
   iconText: {
     fontSize: 22,
   },
   categoryName: {
     fontSize: 12,
     textAlign: 'center',
     color: '#2D3748',
     fontWeight: '500',
     lineHeight: 16,
   },
  articleCard: {
    backgroundColor: 'white',
    marginHorizontal: 12,
    marginTop: 8,
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  articleTitle: { fontSize: 15, fontWeight: '600', marginBottom: 4 },
  articleText: { fontSize: 13, color: '#555' },
  loadMoreBtn: {
    backgroundColor: '#3498db', // Đổi từ colors.accent thành xanh dương
    marginHorizontal: 12,
    marginVertical: 10,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  chatButton: {
    position: "absolute",
    bottom: 25,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#3498db", // Đổi từ #4f46e5 thành xanh dương
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});