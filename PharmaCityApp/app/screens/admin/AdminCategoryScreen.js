import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import colors from '../../config/colors';
import api from '../../config/adminApi';
import { authFetch } from '../../utils/authFetch';

export default function AdminCategoryScreen({ navigation, route }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryName, setCategoryName] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await authFetch(api.ADMIN_CATEGORIES, {}, navigation);
      const data = await res.json();
      setCategories(data || []);
    } catch (e) {
      if (e.message !== 'UNAUTHORIZED') {
        Alert.alert('Lỗi', 'Không thể tải danh sách loại thuốc');
      }
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCategories();
    }, [])
  );

  const openAddModal = () => {
    setEditingCategory(null);
    setCategoryName('');
    setModalVisible(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!categoryName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên loại thuốc');
      return;
    }

    setSaving(true);
    try {
      let res;
      if (editingCategory) {
        // Update
        res = await authFetch(
          api.ADMIN_UPDATE_CATEGORY(editingCategory.id),
          {
            method: 'PUT',
            body: JSON.stringify({ name: categoryName.trim() }),
          },
          navigation
        );
      } else {
        // Create
        res = await authFetch(
          api.ADMIN_CREATE_CATEGORY,
          {
            method: 'POST',
            body: JSON.stringify({ name: categoryName.trim() }),
          },
          navigation
        );
      }

      if (!res.ok) throw new Error();

      Alert.alert('Thành công', editingCategory ? 'Cập nhật thành công' : 'Thêm loại thuốc thành công');
      setModalVisible(false);
      fetchCategories();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lưu loại thuốc');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (category) => {
    Alert.alert(
      'Xóa loại thuốc',
      `Bạn có chắc muốn xóa "${category.name}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              const res = await authFetch(
                api.ADMIN_DELETE_CATEGORY(category.id),
                { method: 'DELETE' },
                navigation
              );
              if (!res.ok) throw new Error();
              Alert.alert('Thành công', 'Đã xóa loại thuốc');
              fetchCategories();
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa loại thuốc');
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }) => (
    <View style={styles.categoryItem}>
      <Text style={styles.categoryName}>{item.name}</Text>
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={[styles.actionBtn, styles.editBtn]}
          onPress={() => openEditModal(item)}
        >
          <Text style={styles.editBtnText}>Sửa</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.deleteBtn]}
          onPress={() => handleDelete(item)}
        >
          <Text style={styles.deleteBtnText}>Xóa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Quay lại</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.addBtn} onPress={openAddModal}>
          <Text style={styles.addBtnText}>+ Thêm loại</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Chưa có loại thuốc nào</Text>
            </View>
          }
        />
      )}

      {/* Modal Add/Edit */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingCategory ? 'Sửa loại thuốc' : 'Thêm loại thuốc mới'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Tên loại thuốc"
              value={categoryName}
              onChangeText={setCategoryName}
              autoFocus
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.cancelModalBtn]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelModalBtnText}>Hủy</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.saveModalBtn]}
                onPress={handleSave}
                disabled={saving}
              >
                <Text style={styles.saveModalBtnText}>
                  {saving ? 'Đang lưu...' : 'Lưu'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backBtn: {
    padding: 8,
  },
  backBtnText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  addBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addBtnText: {
    color: 'white',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  categoryItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 8,
  },
  editBtn: {
    backgroundColor: '#E3F2FD',
  },
  editBtnText: {
    color: '#1976D2',
    fontWeight: '600',
  },
  deleteBtn: {
    backgroundColor: '#FFEBEE',
  },
  deleteBtnText: {
    color: '#D32F2F',
    fontWeight: '600',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '85%',
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelModalBtn: {
    backgroundColor: '#F5F5F5',
  },
  cancelModalBtnText: {
    color: '#666',
    fontWeight: '600',
  },
  saveModalBtn: {
    backgroundColor: colors.primary,
  },
  saveModalBtnText: {
    color: 'white',
    fontWeight: '600',
  },
});