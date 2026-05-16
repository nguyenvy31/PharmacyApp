import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import colors from '../../config/colors';
import api from '../../config/adminApi';
import { authFetch } from '../../utils/authFetch';
import { launchImageLibrary } from 'react-native-image-picker';

export default function MedicineFormScreen({ route, navigation }) {
  const { medicineId } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [ingredient, setIngredient] = useState('');
  const [registrationNum, setRegistrationNum] = useState('');
  const [dosageForm, setDosageForm] = useState('');
  const [country, setCountry] = useState('');
  const [origin, setOrigin] = useState('');
  const [packageInfo, setPackageInfo] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [price, setPrice] = useState('');
  const [usageText, setUsageText] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [stock, setStock] = useState('');

  useEffect(() => {
    if (medicineId) loadMedicine(medicineId);
    fetchCategories();
  }, [medicineId]);

  const loadMedicine = async (id) => {
    setLoading(true);
    try {
      const res = await authFetch(
        api.ADMIN_MEDICINE_DETAIL(id),
        {},
        navigation
      );

      const json = await res.json();

      setName(json.name ?? '');
      setBrand(json.brand ?? '');
      setIngredient(json.ingredient ?? '');
      setRegistrationNum(json.registrationNum ?? '');
      setDosageForm(json.dosageForm ?? '');
      setCountry(json.country ?? '');
      setOrigin(json.origin ?? '');
      setPackageInfo(json.packageInfo ?? '');
      setManufacturer(json.manufacturer ?? '');
      setPrice(json.price ? String(json.price) : '');
      setUsageText(json.usageText ?? '');
      setDescription(json.description ?? '');
      setCategoryId(json.categoryId ? String(json.categoryId) : '');
      setImageUri(json.imageUrl ?? null);
      setStock(json.stock ? String(json.stock) : '');

    } catch (e) {
      if (e.message !== 'UNAUTHORIZED') {
        Alert.alert('Lỗi', 'Không tải được thuốc');
      }
    } finally {
      setLoading(false);
    }
  };

 const pickImage = async () => {
   const result = await launchImageLibrary({
     mediaType: 'photo',
     quality: 0.7,
   });

   if (result.didCancel) return;

   if (result.assets && result.assets.length > 0) {
     const uri = result.assets[0].uri;

     setSaving(true); // loading nhỏ

     const url = await uploadToCloudinary(uri);

     setSaving(false);

     if (url) {
       setImageUri(url); // ✅ lưu URL cloud
     }
   }
 };

 const fetchCategories = async () => {
   setLoadingCategories(true);
   try {
     const res = await authFetch(api.ADMIN_CATEGORIES, {}, navigation);
     const data = await res.json();
     setCategories(data || []);
   } catch (e) {
     console.log('Error fetchCategories', e);
   } finally {
     setLoadingCategories(false);
   }
 };

  const handleSave = async () => {
    if (!name.trim() || !price.trim()) {
      Alert.alert('Thiếu thông tin', 'Tên thuốc và giá là bắt buộc');
      return;
    }

    const payload = {
      name,
      brand,
      ingredient,
      registrationNum,
      dosageForm,
      country,
      origin,
      packageInfo,
      manufacturer,
      price: Number(price),
      usageText,
      description,
      categoryId: categoryId ? Number(categoryId) : null,
      imageUrl: imageUri,
      stock: stock ? Number(stock) : 0,
    };

    setSaving(true);
    try {
      const res = await authFetch(
        medicineId
          ? api.ADMIN_UPDATE_MEDICINE(medicineId)
          : api.ADMIN_CREATE_MEDICINE,
        {
          method: medicineId ? 'PUT' : 'POST',
          body: JSON.stringify(payload),
        },
        navigation
      );

      if (!res.ok) throw new Error();

      Alert.alert('Thành công', 'Lưu thuốc thành công', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch {
      Alert.alert('Lỗi', 'Không lưu được thuốc');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const uploadToCloudinary = async (uri) => {
    const data = new FormData();

    data.append('file', {
      uri,
      type: 'image/jpeg',
      name: 'photo.jpg',
    });

    data.append('upload_preset', 'pharmacity_upload');
    data.append('cloud_name', 'dkumfanx2');

    try {
      const res = await fetch(
        'https://api.cloudinary.com/v1_1/dkumfanx2/image/upload',
        {
          method: 'POST',
          body: data,
        }
      );

      const json = await res.json();

      if (!json.secure_url) {
        throw new Error('Upload failed');
      }

      return json.secure_url;

    } catch (err) {
      console.log('Upload error:', err);
      Alert.alert('Lỗi', 'Upload ảnh thất bại');
      return null;
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.card}>

        <Text style={styles.sectionTitle}>Thông tin thuốc</Text>

        <Text style={styles.label}>Tên thuốc *</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} />

        <Text style={styles.label}>Loại thuốc</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={categoryId}
            onValueChange={(itemValue) => setCategoryId(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="-- Chọn loại thuốc --" value="" />
            {categories.map((cat) => (
              <Picker.Item key={cat.id} label={cat.name} value={String(cat.id)} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Thương hiệu</Text>
        <TextInput style={styles.input} value={brand} onChangeText={setBrand} />

        <Text style={styles.label}>Hoạt chất</Text>
        <TextInput style={styles.input} value={ingredient} onChangeText={setIngredient} />

        <Text style={styles.label}>Số đăng ký</Text>
        <TextInput style={styles.input} value={registrationNum} onChangeText={setRegistrationNum} />

        <Text style={styles.label}>Dạng bào chế</Text>
        <TextInput style={styles.input} value={dosageForm} onChangeText={setDosageForm} />

        <Text style={styles.sectionTitle}>Nguồn gốc</Text>

        <Text style={styles.label}>Quốc gia</Text>
        <TextInput style={styles.input} value={country} onChangeText={setCountry} />

        <Text style={styles.label}>Xuất xứ</Text>
        <TextInput style={styles.input} value={origin} onChangeText={setOrigin} />

        <Text style={styles.label}>Nhà sản xuất</Text>
        <TextInput style={styles.input} value={manufacturer} onChangeText={setManufacturer} />

        <Text style={styles.label}>Quy cách đóng gói</Text>
        <TextInput style={styles.input} value={packageInfo} onChangeText={setPackageInfo} />

        <Text style={styles.sectionTitle}>Giá & mô tả</Text>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Giá (VNĐ)</Text>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Tồn kho</Text>
            <TextInput
              style={styles.input}
              value={stock}
              onChangeText={setStock}
              keyboardType="numeric"
            />
          </View>
        </View>
        <Text style={styles.label}>Công dụng</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={usageText}
          onChangeText={setUsageText}
          multiline
        />

        <Text style={styles.label}>Mô tả</Text>
        <TextInput
          style={[styles.input, styles.textAreaLarge]}
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <Text style={styles.sectionTitle}>Hình ảnh</Text>

        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} />
          ) : (
            <Text style={styles.imageText}>Chọn ảnh</Text>
          )}
        </TouchableOpacity>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.btnCancel} onPress={() => navigation.goBack()}>
            <Text style={styles.btnCancelText}>Hủy</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnSave}
            onPress={handleSave}
            disabled={saving}
          >
            <Text style={styles.btnSaveText}>
              {saving ? 'Đang lưu...' : 'Lưu'}
            </Text>
          </TouchableOpacity>
        </View>

      </View>
    </ScrollView>
  );
}

/* ================== STYLE ================== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F8',
  },

  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  card: {
    backgroundColor: '#FFF',
    margin: 16,
    padding: 16,
    borderRadius: 16,
    elevation: 4,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 12,
    marginBottom: 8,
  },

  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginTop: 12,
    marginBottom: 6,
  },

  input: {
    backgroundColor: '#F1F3F6',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#333',
  },

  textArea: {
    height: 90,
    textAlignVertical: 'top',
  },

  textAreaLarge: {
    height: 120,
    textAlignVertical: 'top',
  },

  imagePicker: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: '#F1F3F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#CCC',
    marginTop: 8,
  },

  image: {
    width: 110,
    height: 110,
    borderRadius: 10,
  },

  imageText: {
    color: colors.primary,
    fontWeight: '600',
  },

  actions: {
    flexDirection: 'row',
    marginTop: 20,
  },

  btnCancel: {
    flex: 1,
    backgroundColor: '#E4E6EB',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 8,
  },

  btnCancelText: {
    fontWeight: '600',
    color: '#333',
  },

  btnSave: {
    flex: 1,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginLeft: 8,
  },

  btnSaveText: {
    fontWeight: '700',
    color: '#FFF',
  },

  pickerContainer: {
    backgroundColor: '#F1F3F6',
    borderRadius: 10,
    marginBottom: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
  },
});
