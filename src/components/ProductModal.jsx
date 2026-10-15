import React, { useState, useEffect } from 'react';
import { 
  X, Upload, Image as ImageIcon, Check, Cpu, HardDrive, 
  Smartphone, Monitor, Globe, Palette, Sliders, Flame, Zap, 
  ShieldCheck, Plus, Trash2, Box, Layers
} from 'lucide-react';
import { createProduct, updateProduct, getImageUrl } from '../api/api';

export default function ProductModal({ isOpen, onClose, onRefresh, editingProduct }) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Phones',
    brand: 'Apple',
    customBrand: '',
    price: '',
    oldPrice: '',
    discount: '',
    stock: '',
    description: '',
    imageUrl: '',
    // Phone specs
    ram: '8 GB',
    screenSize: '6.3 dyuym',
    screenDetails: 'Super Retina XDR OLED, 120Hz ProMotion',
    processor: 'Apple A19 Pro (3nm)',
    simType: 'Dual SIM (nano-SIM + eSIM)',
    region: 'LL/A (USA)',
    // Used Phone specs
    batteryHealth: '95%',
    deviceCondition: 'Ideal (A+)',
    boxIncluded: 'Karobka va hujjatlar bor',
    // Electronics specs
    electronicsType: 'Noutbuk',
    electronicsBattery: '18 soatgacha avtonomlik',
  });

  // Home appliances specific state
  const [applianceData, setApplianceData] = useState({
    type: 'Gaz plita',
    customType: '',
    power: '2200 W (A++)',
    capacity: '65 L',
    controlType: 'Mexanik',
    warranty: '3 yil rasmiy kafolat',
    dimensions: '85 x 60 x 60 sm'
  });

  // Accessories specific state
  const [accessoryData, setAccessoryData] = useState({
    type: "G'ilof (Case)",
    customType: '',
    compatibility: 'iPhone 16 / 15 seriyasi',
    connectionType: 'Type-C',
    material: 'Silikon'
  });

  // Dynamic custom specs (Key-value pairs for any category)
  const [customSpecs, setCustomSpecs] = useState([]);
  const [newSpecLabel, setNewSpecLabel] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');

  const [selectedStorage, setSelectedStorage] = useState(['128GB', '256GB']);
  const [selectedColors, setSelectedColors] = useState(['Qora', 'Oq', 'Tabiiy Titan']);
  const [customColorInput, setCustomColorInput] = useState('');

  const [imageFiles, setImageFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Available options helpers
  const storageOptions = ['64GB', '128GB', '256GB', '512GB', '1TB', '2TB'];
  const ramOptions = ['4 GB', '6 GB', '8 GB', '12 GB', '16 GB', '18 GB', '24 GB', '32 GB', '64 GB'];
  const simOptions = [
    'Dual SIM (nano-SIM + eSIM)',
    '2x Physical SIM (Dual nano-SIM)',
    'eSIM + eSIM',
    'Single SIM (nano-SIM)'
  ];
  const regionOptions = [
    'LL/A (USA - faqat eSIM)',
    'KH/A (China/HK - 2x Fizik SIM)',
    'ZA/A (Dubai / Yaqin Sharq)',
    'EU (Yevropa region)',
    'RU/A (Evrosiyo)'
  ];

  const applianceTypeOptions = [
    'Gaz plita',
    'Muzlatgich',
    'Kir yuvish mashinasi',
    'Changyutgich',
    'Konditsioner',
    'Mikroto\'lqinli pech',
    'Dazmol',
    'Elektr choynak',
    'Blender / Mikser',
    'Mini-pech / Duxovka',
    'Idish yuvish mashinasi',
    'Go\'sht maydalagich',
    'Havo tozalagich',
    'Boshqa'
  ];

  const controlTypeOptions = [
    'Mexanik',
    'Elektron',
    'Sensorli (Touch)',
    'Masofaviy (Pult / Wi-Fi Smart)',
    'Kombinatsiyalashgan'
  ];

  const warrantyOptions = [
    '3 yil rasmiy kafolat',
    '2 yil rasmiy kafolat',
    '1 yil rasmiy kafolat',
    '6 oy kafolat',
    'Kafolat yo\'q'
  ];

  const accessoryTypeOptions = [
    'G\'ilof (Case)',
    'Zaryadlash qurilmasi (Adapter)',
    'Kabel (USB / Type-C)',
    'Himoya oynasi (Glass)',
    'Powerbank (Tashqi akkumulyator)',
    'Avtomobil ushlagichi',
    'Simsiz zaryadlash stansiyasi',
    'Quloqchinlar',
    'Boshqa'
  ];

  // Brand options by category
  const getBrandOptions = (cat) => {
    switch (cat) {
      case 'Home appliances':
        return ['Artel', 'Samsung', 'LG', 'Shivaki', 'Midea', 'Bosch', 'Beko', 'Haier', 'Tefal', 'Philips', 'Gorenje', 'Zanussi', 'Boshqa'];
      case 'Aksessuarlar':
        return ['Apple', 'Samsung', 'Anker', 'Baseus', 'Hoco', 'Borofone', 'Remax', 'Xiaomi', 'Joyroom', 'Boshqa'];
      case 'Elektronika':
        return ['Apple', 'Samsung', 'Xiaomi', 'Sony', 'Lenovo', 'Asus', 'HP', 'Dell', 'Boshqa'];
      case 'Phones':
      case 'Used Phones':
      default:
        return ['Apple', 'Samsung', 'Xiaomi', 'Honor', 'Huawei', 'Realme', 'Vivo', 'Google Pixel', 'Boshqa'];
    }
  };

  // Color presets by category
  const getPresetColors = (cat) => {
    if (cat === 'Home appliances') {
      return ['Oq', 'Kumushrang', 'Inox (Zanglamas po\'lat)', 'Qora', 'Kulrang', 'Jigarrang', 'Qizil'];
    }
    if (cat === 'Aksessuarlar') {
      return ['Qora', 'Oq', 'Shaffof', 'Ko\'k', 'Pushti', 'Yashil', 'Binafsha', 'Titan'];
    }
    return ['Qora', 'Oq', 'Tabiiy Titan', 'Ko\'k', 'Yashil', 'Oltin', 'Pushti', 'Kulrang', 'Sariq'];
  };

  useEffect(() => {
    if (editingProduct) {
      const cat = editingProduct.category || 'Phones';
      const availableBrands = getBrandOptions(cat);
      const isKnownBrand = availableBrands.includes(editingProduct.brand);

      setFormData({
        name: editingProduct.name || '',
        category: cat,
        brand: isKnownBrand ? editingProduct.brand : 'Boshqa',
        customBrand: isKnownBrand ? '' : (editingProduct.brand || ''),
        price: editingProduct.price || '',
        oldPrice: editingProduct.oldPrice || '',
        discount: editingProduct.discount || '',
        stock: editingProduct.stock || '',
        description: editingProduct.description || '',
        imageUrl: '',
        ram: editingProduct.ram || '8 GB',
        screenSize: editingProduct.screenSize || '6.3 dyuym',
        screenDetails: editingProduct.screenDetails || 'Super Retina XDR OLED, 120Hz ProMotion',
        processor: editingProduct.processor || 'Apple A19 Pro (3nm)',
        simType: editingProduct.simType || 'Dual SIM (nano-SIM + eSIM)',
        region: editingProduct.region || 'LL/A (USA)',
        batteryHealth: editingProduct.battery ? `${editingProduct.battery}%` : '95%',
        deviceCondition: editingProduct.grade || 'Ideal (A+)',
        boxIncluded: 'Karobka va hujjatlar bor',
        electronicsType: 'Noutbuk',
        electronicsBattery: '18 soatgacha avtonomlik'
      });
      
      const imgs = Array.isArray(editingProduct.images)
        ? editingProduct.images
        : (editingProduct.images ? [editingProduct.images] : []);
      setExistingImages(imgs);

      if (Array.isArray(editingProduct.storage) && editingProduct.storage.length > 0) {
        setSelectedStorage(editingProduct.storage);
      } else {
        setSelectedStorage(cat === 'Home appliances' || cat === 'Aksessuarlar' ? [] : ['128GB', '256GB']);
      }

      if (Array.isArray(editingProduct.colors) && editingProduct.colors.length > 0) {
        setSelectedColors(editingProduct.colors);
      } else {
        setSelectedColors(getPresetColors(cat).slice(0, 3));
      }

      // Parse existing specs if Home appliances
      if (cat === 'Home appliances') {
        const rawLines = (editingProduct.longDescription || editingProduct.description || '').split('\n').map(l => l.trim()).filter(Boolean);
        const parsedApp = {
          type: 'Gaz plita',
          customType: '',
          power: '2200 W (A++)',
          capacity: '65 L',
          controlType: 'Mexanik',
          warranty: '3 yil rasmiy kafolat',
          dimensions: '85 x 60 x 60 sm'
        };
        const parsedCustom = [];

        rawLines.forEach(line => {
          const colonIdx = line.indexOf(':');
          if (colonIdx === -1) return;
          const k = line.substring(0, colonIdx).trim().toLowerCase();
          const v = line.substring(colonIdx + 1).trim();

          if (k.includes('jihoz turi') || k === 'turi') {
            if (applianceTypeOptions.includes(v)) {
              parsedApp.type = v;
            } else {
              parsedApp.type = 'Boshqa';
              parsedApp.customType = v;
            }
          } else if (k.includes('quvvat')) {
            parsedApp.power = v;
          } else if (k.includes("sig'im") || k.includes('hajm')) {
            parsedApp.capacity = v;
          } else if (k.includes('boshqaruv')) {
            parsedApp.controlType = v;
          } else if (k.includes('kafolat')) {
            parsedApp.warranty = v;
          } else if (k.includes("o'lcham") || k.includes('olcham')) {
            parsedApp.dimensions = v;
          } else if (!k.includes('rang')) {
            parsedCustom.push({ label: line.substring(0, colonIdx).trim(), value: v });
          }
        });
        setApplianceData(parsedApp);
        setCustomSpecs(parsedCustom);
      } else {
        setCustomSpecs([]);
      }
    } else {
      // New product defaults
      setFormData({
        name: '',
        category: 'Phones',
        brand: 'Apple',
        customBrand: '',
        price: '',
        oldPrice: '',
        discount: '',
        stock: '',
        description: '',
        imageUrl: '',
        ram: '8 GB',
        screenSize: '6.3 dyuym',
        screenDetails: 'Super Retina XDR OLED, 120Hz ProMotion',
        processor: 'Apple A19 Pro (3nm)',
        simType: 'Dual SIM (nano-SIM + eSIM)',
        region: 'LL/A (USA)',
        batteryHealth: '95%',
        deviceCondition: 'Ideal (A+)',
        boxIncluded: 'Karobka va hujjatlar bor',
        electronicsType: 'Noutbuk',
        electronicsBattery: '18 soatgacha avtonomlik'
      });
      setApplianceData({
        type: 'Gaz plita',
        customType: '',
        power: '2200 W (A++)',
        capacity: '65 L',
        controlType: 'Mexanik',
        warranty: '3 yil rasmiy kafolat',
        dimensions: '85 x 60 x 60 sm'
      });
      setAccessoryData({
        type: "G'ilof (Case)",
        customType: '',
        compatibility: 'iPhone 16 / 15 seriyasi',
        connectionType: 'Type-C',
        material: 'Silikon'
      });
      setCustomSpecs([]);
      setExistingImages([]);
      setSelectedStorage(['128GB', '256GB']);
      setSelectedColors(['Qora', 'Oq', 'Tabiiy Titan']);
    }
    setImageFiles([]);
    setError(null);
  }, [editingProduct, isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      
      // Auto compute discount % if price and oldPrice exist
      if ((name === 'price' || name === 'oldPrice') && updated.price && updated.oldPrice) {
        const p = parseFloat(updated.price);
        const op = parseFloat(updated.oldPrice);
        if (op > p) {
          const calcDiscount = Math.round(((op - p) / op) * 100);
          updated.discount = calcDiscount;
        }
      }
      return updated;
    });
  };

  const handleCategoryChange = (e) => {
    const newCat = e.target.value;
    const brandOpts = getBrandOptions(newCat);
    const newBrand = brandOpts.includes(formData.brand) ? formData.brand : brandOpts[0];

    setFormData(prev => ({
      ...prev,
      category: newCat,
      brand: newBrand,
      customBrand: ''
    }));

    if (newCat === 'Home appliances') {
      setSelectedStorage([]);
      setSelectedColors(['Oq', 'Kumushrang', 'Qora']);
    } else if (newCat === 'Aksessuarlar') {
      setSelectedStorage([]);
      setSelectedColors(['Qora', 'Oq', 'Shaffof']);
    } else if (newCat === 'Phones' || newCat === 'Used Phones') {
      if (selectedStorage.length === 0) setSelectedStorage(['128GB', '256GB']);
      setSelectedColors(['Qora', 'Oq', 'Tabiiy Titan']);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const MAX_SIZE = 10 * 1024 * 1024; // 10MB limit per image
      const oversizedFiles = newFiles.filter(f => f.size > MAX_SIZE);

      if (oversizedFiles.length > 0) {
        setError(`Fayl hajmi 10MB dan oshmasligi kerak! (Ba'zi rasmlar rad etildi)`);
        return;
      }

      setError(null);
      setImageFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeImageFile = (indexToRemove) => {
    setImageFiles(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const removeExistingImage = (indexToRemove) => {
    setExistingImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const toggleStorageOption = (item) => {
    setSelectedStorage(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const toggleColorOption = (color) => {
    setSelectedColors(prev =>
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  const addCustomColor = () => {
    if (customColorInput.trim() && !selectedColors.includes(customColorInput.trim())) {
      setSelectedColors(prev => [...prev, customColorInput.trim()]);
      setCustomColorInput('');
    }
  };

  const addCustomSpec = () => {
    if (newSpecLabel.trim() && newSpecValue.trim()) {
      setCustomSpecs(prev => [...prev, { label: newSpecLabel.trim(), value: newSpecValue.trim() }]);
      setNewSpecLabel('');
      setNewSpecValue('');
    }
  };

  const removeCustomSpec = (idx) => {
    setCustomSpecs(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('category', formData.category);
      data.append('used', (formData.category === 'Used Phones' || formData.category === 'B/U Telefonlar') ? 'true' : 'false');
      
      const finalBrand = (formData.brand === 'Boshqa' && formData.customBrand.trim())
        ? formData.customBrand.trim()
        : formData.brand;
      data.append('brand', finalBrand);

      data.append('price', formData.price);
      if (formData.oldPrice) data.append('oldPrice', formData.oldPrice);
      if (formData.discount) data.append('discount', formData.discount);
      data.append('stock', formData.stock || 0);

      // Build technical specifications summary depending on category
      let specSummary = '';

      if (formData.category === 'Home appliances') {
        const specs = [];
        const applianceTypeVal = (applianceData.type === 'Boshqa' && applianceData.customType?.trim())
          ? applianceData.customType.trim()
          : applianceData.type;

        if (applianceTypeVal) specs.push(`Jihoz turi: ${applianceTypeVal}`);
        if (applianceData.power?.trim()) specs.push(`Quvvati / Energiya: ${applianceData.power.trim()}`);
        if (applianceData.capacity?.trim()) specs.push(`Sig'imi / Hajmi: ${applianceData.capacity.trim()}`);
        if (applianceData.controlType) specs.push(`Boshqaruv turi: ${applianceData.controlType}`);
        if (applianceData.warranty) specs.push(`Kafolat: ${applianceData.warranty}`);
        if (applianceData.dimensions?.trim()) specs.push(`O'lchamlari: ${applianceData.dimensions.trim()}`);
        if (selectedColors.length > 0) specs.push(`Mavjud ranglar: ${selectedColors.join(', ')}`);

        customSpecs.forEach(s => {
          if (s.label?.trim() && s.value?.trim()) specs.push(`${s.label.trim()}: ${s.value.trim()}`);
        });

        specSummary = specs.join('\n');
        data.append('storage', JSON.stringify([]));
      } else if (formData.category === 'Aksessuarlar') {
        const specs = [];
        const accType = (accessoryData.type === 'Boshqa' && accessoryData.customType?.trim())
          ? accessoryData.customType.trim()
          : accessoryData.type;

        if (accType) specs.push(`Aksessuar turi: ${accType}`);
        if (accessoryData.compatibility?.trim()) specs.push(`Mos keluvchi modellar: ${accessoryData.compatibility.trim()}`);
        if (accessoryData.connectionType) specs.push(`Ulanish / Port: ${accessoryData.connectionType}`);
        if (accessoryData.material?.trim()) specs.push(`Material: ${accessoryData.material.trim()}`);
        if (selectedColors.length > 0) specs.push(`Mavjud ranglar: ${selectedColors.join(', ')}`);

        customSpecs.forEach(s => {
          if (s.label?.trim() && s.value?.trim()) specs.push(`${s.label.trim()}: ${s.value.trim()}`);
        });

        specSummary = specs.join('\n');
        data.append('storage', JSON.stringify([]));
      } else if (formData.category === 'Used Phones') {
        const specs = [
          `Operativ xotira (RAM): ${formData.ram}`,
          `Doimiy xotira (ROM): ${selectedStorage.join(', ')}`,
          `Ekran dyuymi: ${formData.screenSize}`,
          `Ekran turi: ${formData.screenDetails}`,
          `Protsessor: ${formData.processor}`,
          `SIM-karta turi: ${formData.simType}`,
          `Region: ${formData.region}`,
          `Batareya holati: ${formData.batteryHealth}`,
          `Tashqi holati: ${formData.deviceCondition}`,
          `Komplekt: ${formData.boxIncluded}`,
          `Mavjud ranglar: ${selectedColors.join(', ')}`
        ];

        customSpecs.forEach(s => {
          if (s.label?.trim() && s.value?.trim()) specs.push(`${s.label.trim()}: ${s.value.trim()}`);
        });

        specSummary = specs.join('\n');
        data.append('storage', JSON.stringify(selectedStorage));
        data.append('battery', parseInt(formData.batteryHealth) || 95);
        data.append('grade', formData.deviceCondition);
      } else if (formData.category === 'Elektronika') {
        const specs = [
          `Qurilma turi: ${formData.electronicsType}`,
          `Operativ xotira (RAM): ${formData.ram}`,
          `Doimiy xotira: ${selectedStorage.join(', ')}`,
          `Ekran: ${formData.screenSize}`,
          `Protsessor: ${formData.processor}`,
          `Avtonomlik: ${formData.electronicsBattery}`,
          `Mavjud ranglar: ${selectedColors.join(', ')}`
        ];

        customSpecs.forEach(s => {
          if (s.label?.trim() && s.value?.trim()) specs.push(`${s.label.trim()}: ${s.value.trim()}`);
        });

        specSummary = specs.join('\n');
        data.append('storage', JSON.stringify(selectedStorage));
      } else {
        // Standard Phones
        const specs = [
          `Operativ xotira (RAM): ${formData.ram}`,
          `Doimiy xotira (ROM): ${selectedStorage.join(', ')}`,
          `Ekran dyuymi: ${formData.screenSize}`,
          `Ekran turi: ${formData.screenDetails}`,
          `Protsessor: ${formData.processor}`,
          `SIM-karta turi: ${formData.simType}`,
          `Region: ${formData.region}`,
          `Mavjud ranglar: ${selectedColors.join(', ')}`
        ];

        customSpecs.forEach(s => {
          if (s.label?.trim() && s.value?.trim()) specs.push(`${s.label.trim()}: ${s.value.trim()}`);
        });

        specSummary = specs.join('\n');
        data.append('storage', JSON.stringify(selectedStorage));
      }

      data.append('colors', JSON.stringify(selectedColors));

      const descText = formData.description
        ? `${formData.description}\n\n${specSummary}`
        : specSummary;

      data.append('description', descText);
      data.append('longDescription', specSummary);

      // Append image files
      if (imageFiles.length > 0) {
        imageFiles.forEach(file => {
          data.append('images', file);
        });
      }

      // Append existing images
      existingImages.forEach(img => {
        data.append('images', img);
      });

      if (formData.imageUrl) {
        data.append('images', formData.imageUrl);
      }

      if (editingProduct?._id) {
        await updateProduct(editingProduct._id, data);
      } else {
        await createProduct(data);
      }

      // Vercel saytidagi keshni avtomatik yangilash (On-demand revalidation)
      try {
        fetch('https://xonbozoruz.vercel.app/api/revalidate', { method: 'POST', mode: 'no-cors' }).catch(() => {});
      } catch (_) {}

      onRefresh();
      onClose();
    } catch (err) {
      setError(err.message || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const currentBrandOptions = getBrandOptions(formData.category);
  const currentPresetColors = getPresetColors(formData.category);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex justify-end animate-fadeIn">
      <div className="w-full max-w-xl bg-white h-full overflow-y-auto shadow-2xl flex flex-col justify-between">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {editingProduct ? 'Mahsulotni tahrirlash' : 'Yangi mahsulot qo\'shish'}
            </h2>
            <p className="text-xs text-slate-400">
              {formData.category === 'Home appliances'
                ? 'Maishiy texnika va uy jihozlari parametrlarini kiritish'
                : 'Katalogga yangi mahsulot parametrlari va texnik xususiyatlarini kiritish'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <form id="productForm" onSubmit={handleSubmit} className="p-6 space-y-6 flex-1">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl font-medium border border-rose-200">
              {error}
            </div>
          )}

          {/* 1. RASM YUKLASH */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-slate-500" />
                <span>1. Rasm yuklash (Cheklovsiz, max 10MB har bir rasm)</span>
              </label>
            </div>
            
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-5 text-center bg-white hover:bg-slate-50 transition-all cursor-pointer relative group">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 shadow-xs mx-auto mb-2 group-hover:scale-105 transition-transform">
                <Upload className="w-5 h-5" />
              </div>
              <div className="text-xs font-bold text-slate-800 mb-1">
                Rasmlarni sudrab tashlang yoki bosing (Nechta rasm bo'lsa ham)
              </div>
              <div className="text-[10px] text-slate-400">
                JPG, PNG, WEBP — Har bir rasm hajm chegarasi: 10MB
              </div>
            </div>

            {/* Selected Images Preview Grid */}
            {(imageFiles.length > 0 || existingImages.length > 0) && (
              <div className="space-y-2 pt-1">
                <div className="text-[11px] font-bold text-slate-700">
                  Tanlangan rasmlar ({imageFiles.length + existingImages.length} ta):
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {existingImages.map((url, idx) => (
                    <div key={`existing-${idx}`} className="relative group w-full aspect-square rounded-xl bg-slate-100 border border-slate-200 overflow-hidden">
                      <img
                        src={getImageUrl(url)}
                        alt="Product"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(idx)}
                        className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full opacity-90 hover:opacity-100 shadow-xs cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {imageFiles.map((file, idx) => (
                    <div key={`file-${idx}`} className="relative group w-full aspect-square rounded-xl bg-slate-100 border border-slate-200 overflow-hidden">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Upload ${idx}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => removeImageFile(idx)}
                        className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-full opacity-90 hover:opacity-100 shadow-xs cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 2. ASOSIY MA'LUMOTLAR */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-1.5">
              <Box className="w-4 h-4 text-slate-500" />
              <span>Asosiy Ma'lumotlar</span>
            </h3>

            {/* Nomi */}
            <div>
              <label className="block text-xs font-bold text-slate-900 mb-1.5">
                Nomi
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder={formData.category === 'Home appliances' ? 'Artel Apetito 00-G GK' : 'iPhone 16 Pro Max 256GB'}
                required
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-black font-semibold"
              />
            </div>

            {/* Kategoriya & Brend */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5">
                  Kategoriya
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleCategoryChange}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-black font-semibold cursor-pointer"
                >
                  <option value="Phones">Phones / Telefonlar</option>
                  <option value="Used Phones">Used Phones (B/U Telefonlar)</option>
                  <option value="Home appliances">Home appliances (Maishiy texnika)</option>
                  <option value="Aksessuarlar">Aksessuarlar</option>
                  <option value="Elektronika">Elektronika</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5">
                  Brend
                </label>
                <select
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-black font-semibold cursor-pointer"
                >
                  {currentBrandOptions.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* If Brand is 'Boshqa', allow typing custom brand name */}
            {formData.brand === 'Boshqa' && (
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Aniq brend nomini kiriting:
                </label>
                <input
                  type="text"
                  name="customBrand"
                  value={formData.customBrand}
                  onChange={handleInputChange}
                  placeholder="masalan: Artel, Dyson, Rowenta, Tefal..."
                  required
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-black font-semibold"
                />
              </div>
            )}

            {/* Narx, Eski narx, Chegirma, Ombor */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5">
                  Narx (so'm)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="2439000"
                  required
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-black font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5">
                  Eski narx (so'm)
                </label>
                <input
                  type="number"
                  name="oldPrice"
                  value={formData.oldPrice}
                  onChange={handleInputChange}
                  placeholder="2539000"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-black font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5">
                  Chegirma %
                </label>
                <input
                  type="number"
                  name="discount"
                  value={formData.discount}
                  onChange={handleInputChange}
                  placeholder="4"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-black font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5">
                  Ombordagi soni
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  placeholder="10"
                  required
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-black font-semibold"
                />
              </div>
            </div>
          </div>

          {/* 3. DYNAMIC TECHNICAL SPECIFICATIONS BY CATEGORY */}

          {/* A) HOME APPLIANCES (MAISHIY TEXNIKA) */}
          {formData.category === 'Home appliances' && (
            <div className="space-y-4 pt-2">
              <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>Maishiy Texnika Parametrlari</span>
                </h3>
                <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                  Uy jihozi
                </span>
              </div>

              {/* Jihoz turi & Boshqaruv turi */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5 flex items-center gap-1">
                    <Box className="w-3.5 h-3.5 text-slate-500" />
                    <span>Jihoz turi</span>
                  </label>
                  <select
                    value={applianceData.type}
                    onChange={(e) => setApplianceData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-black font-semibold cursor-pointer"
                  >
                    {applianceTypeOptions.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5 flex items-center gap-1">
                    <Sliders className="w-3.5 h-3.5 text-slate-500" />
                    <span>Boshqaruv turi</span>
                  </label>
                  <select
                    value={applianceData.controlType}
                    onChange={(e) => setApplianceData(prev => ({ ...prev, controlType: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-black font-semibold cursor-pointer"
                  >
                    {controlTypeOptions.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* If appliance type is 'Boshqa' */}
              {applianceData.type === 'Boshqa' && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Aniq jihoz turini yozing:
                  </label>
                  <input
                    type="text"
                    value={applianceData.customType}
                    onChange={(e) => setApplianceData(prev => ({ ...prev, customType: e.target.value }))}
                    placeholder="masalan: Qahva mashinasi, Sendvich pishirgich..."
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-black font-medium"
                  />
                </div>
              )}

              {/* Quvvat & Sig'im */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-slate-500" />
                    <span>Quvvati / Energiya</span>
                  </label>
                  <input
                    type="text"
                    value={applianceData.power}
                    onChange={(e) => setApplianceData(prev => ({ ...prev, power: e.target.value }))}
                    placeholder="masalan: 2200 W (A++) yoki Gaz"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-black font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-slate-500" />
                    <span>Sig'imi / Hajmi</span>
                  </label>
                  <input
                    type="text"
                    value={applianceData.capacity}
                    onChange={(e) => setApplianceData(prev => ({ ...prev, capacity: e.target.value }))}
                    placeholder="masalan: 65 L, 8 kg, 320 litr..."
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-black font-medium"
                  />
                </div>
              </div>

              {/* Kafolat & O'lchamlari */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                    <span>Kafolat muddati</span>
                  </label>
                  <select
                    value={applianceData.warranty}
                    onChange={(e) => setApplianceData(prev => ({ ...prev, warranty: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-black font-semibold cursor-pointer"
                  >
                    {warrantyOptions.map(w => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5">
                    O'lchamlari (B x K x Ch)
                  </label>
                  <input
                    type="text"
                    value={applianceData.dimensions}
                    onChange={(e) => setApplianceData(prev => ({ ...prev, dimensions: e.target.value }))}
                    placeholder="masalan: 85 x 60 x 60 sm"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-black font-medium"
                  />
                </div>
              </div>

              {/* Ranglar */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5 flex items-center gap-1">
                  <Palette className="w-3.5 h-3.5 text-slate-500" />
                  <span>Mavjud ranglar</span>
                </label>
                
                <div className="flex flex-wrap gap-2 mb-2">
                  {currentPresetColors.map(color => {
                    const isSelected = selectedColors.includes(color);
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => toggleColorOption(color)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {isSelected ? `● ${color}` : color}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customColorInput}
                    onChange={(e) => setCustomColorInput(e.target.value)}
                    placeholder="Boshqa rang nomi (masalan: Metall kulrang)..."
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-black font-medium"
                  />
                  <button
                    type="button"
                    onClick={addCustomColor}
                    className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-all cursor-pointer shrink-0"
                  >
                    + Qo'shish
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* B) AKSESSUARLAR */}
          {formData.category === 'Aksessuarlar' && (
            <div className="space-y-4 pt-2">
              <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-purple-500" />
                  <span>Aksessuar Parametrlari</span>
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5">
                    Aksessuar turi
                  </label>
                  <select
                    value={accessoryData.type}
                    onChange={(e) => setAccessoryData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-black font-semibold cursor-pointer"
                  >
                    {accessoryTypeOptions.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5">
                    Ulanish / Port
                  </label>
                  <input
                    type="text"
                    value={accessoryData.connectionType}
                    onChange={(e) => setAccessoryData(prev => ({ ...prev, connectionType: e.target.value }))}
                    placeholder="masalan: Type-C, MagSafe, Simsiz"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-black font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5">
                    Mos keluvchi modellar
                  </label>
                  <input
                    type="text"
                    value={accessoryData.compatibility}
                    onChange={(e) => setAccessoryData(prev => ({ ...prev, compatibility: e.target.value }))}
                    placeholder="iPhone 16 / 15 seriyasi, Type-C"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-black font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5">
                    Material
                  </label>
                  <input
                    type="text"
                    value={accessoryData.material}
                    onChange={(e) => setAccessoryData(prev => ({ ...prev, material: e.target.value }))}
                    placeholder="Silikon, Charm, Shisha"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-black font-medium"
                  />
                </div>
              </div>

              {/* Ranglar */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5 flex items-center gap-1">
                  <Palette className="w-3.5 h-3.5 text-slate-500" />
                  <span>Mavjud ranglar</span>
                </label>
                
                <div className="flex flex-wrap gap-2 mb-2">
                  {currentPresetColors.map(color => {
                    const isSelected = selectedColors.includes(color);
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => toggleColorOption(color)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {isSelected ? `● ${color}` : color}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customColorInput}
                    onChange={(e) => setCustomColorInput(e.target.value)}
                    placeholder="Boshqa rang..."
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-black font-medium"
                  />
                  <button
                    type="button"
                    onClick={addCustomColor}
                    className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-all cursor-pointer shrink-0"
                  >
                    + Qo'shish
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* C) PHONES & USED PHONES (SMARTFONLAR) */}
          {(formData.category === 'Phones' || formData.category === 'Used Phones') && (
            <div className="space-y-4 pt-2">
              <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-slate-500" />
                  <span>{formData.category === 'Used Phones' ? 'B/U Smartfon Parametrlari' : 'Smartfon Texnik Parametrlari'}</span>
                </h3>
              </div>

              {/* RAM & Region */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5 flex items-center gap-1">
                    <Cpu className="w-3.5 h-3.5 text-slate-500" />
                    <span>Operativ xotira (RAM)</span>
                  </label>
                  <select
                    name="ram"
                    value={formData.ram}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-black font-semibold cursor-pointer"
                  >
                    {ramOptions.map(ram => (
                      <option key={ram} value={ram}>{ram}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-slate-500" />
                    <span>Region (Mamlakat modeli)</span>
                  </label>
                  <select
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-black font-semibold cursor-pointer"
                  >
                    {regionOptions.map(reg => (
                      <option key={reg} value={reg}>{reg}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Doimiy Xotira (ROM / Storage Variantlari) */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5 flex items-center gap-1">
                  <HardDrive className="w-3.5 h-3.5 text-slate-500" />
                  <span>Doimiy xotira variantlari (ROM)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {storageOptions.map(opt => {
                    const isSelected = selectedStorage.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => toggleStorageOption(opt)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-black text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {isSelected ? `✓ ${opt}` : opt}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ekran dyuymi & Ekran turi */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5 flex items-center gap-1">
                    <Monitor className="w-3.5 h-3.5 text-slate-500" />
                    <span>Ekran dyuymi</span>
                  </label>
                  <input
                    type="text"
                    name="screenSize"
                    value={formData.screenSize}
                    onChange={handleInputChange}
                    placeholder="6.3 dyuym"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-black font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5">
                    Ekran turi (Details)
                  </label>
                  <input
                    type="text"
                    name="screenDetails"
                    value={formData.screenDetails}
                    onChange={handleInputChange}
                    placeholder="Super Retina XDR OLED, 120Hz"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-black font-medium"
                  />
                </div>
              </div>

              {/* Protsessor & SIM-karta turi */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5 flex items-center gap-1">
                    <Cpu className="w-3.5 h-3.5 text-slate-500" />
                    <span>Protsessor</span>
                  </label>
                  <input
                    type="text"
                    name="processor"
                    value={formData.processor}
                    onChange={handleInputChange}
                    placeholder="Apple A19 Pro (3nm)"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-black font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5 flex items-center gap-1">
                    <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                    <span>SIM-karta turi</span>
                  </label>
                  <select
                    name="simType"
                    value={formData.simType}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-black font-semibold cursor-pointer"
                  >
                    {simOptions.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Agar Used Phones bo'lsa: Batareya & Holat */}
              {formData.category === 'Used Phones' && (
                <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-2xl space-y-3">
                  <div className="text-xs font-bold text-amber-900">B/U Qurilma holati parametrlari:</div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Batareya holati
                      </label>
                      <input
                        type="text"
                        name="batteryHealth"
                        value={formData.batteryHealth}
                        onChange={handleInputChange}
                        placeholder="88%"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Tashqi holati
                      </label>
                      <input
                        type="text"
                        name="deviceCondition"
                        value={formData.deviceCondition}
                        onChange={handleInputChange}
                        placeholder="Ideal (A+)"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">
                        Komplektatsiyasi
                      </label>
                      <input
                        type="text"
                        name="boxIncluded"
                        value={formData.boxIncluded}
                        onChange={handleInputChange}
                        placeholder="Karobka bor"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Ranglar */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5 flex items-center gap-1">
                  <Palette className="w-3.5 h-3.5 text-slate-500" />
                  <span>Mavjud ranglar</span>
                </label>
                
                <div className="flex flex-wrap gap-2 mb-2">
                  {currentPresetColors.map(color => {
                    const isSelected = selectedColors.includes(color);
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => toggleColorOption(color)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {isSelected ? `● ${color}` : color}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customColorInput}
                    onChange={(e) => setCustomColorInput(e.target.value)}
                    placeholder="Boshqa rang nomi (masalan: Chuh Titan)..."
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-black font-medium"
                  />
                  <button
                    type="button"
                    onClick={addCustomColor}
                    className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-all cursor-pointer shrink-0"
                  >
                    + Qo'shish
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* D) ELEKTRONIKA */}
          {formData.category === 'Elektronika' && (
            <div className="space-y-4 pt-2">
              <div className="border-b border-slate-100 pb-2 flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Monitor className="w-4 h-4 text-blue-500" />
                  <span>Elektronika Parametrlari</span>
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5">
                    Qurilma turi
                  </label>
                  <input
                    type="text"
                    name="electronicsType"
                    value={formData.electronicsType}
                    onChange={handleInputChange}
                    placeholder="Noutbuk, Planshet, Smart soat"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-black font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5">
                    Operativ xotira (RAM)
                  </label>
                  <select
                    name="ram"
                    value={formData.ram}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-black font-semibold cursor-pointer"
                  >
                    {ramOptions.map(ram => (
                      <option key={ram} value={ram}>{ram}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Xotira variantlari */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5">
                  Xotira hajmi (SSD / ROM)
                </label>
                <div className="flex flex-wrap gap-2">
                  {storageOptions.map(opt => {
                    const isSelected = selectedStorage.includes(opt);
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => toggleStorageOption(opt)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-black text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {isSelected ? `✓ ${opt}` : opt}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5">
                    Ekran / Displey
                  </label>
                  <input
                    type="text"
                    name="screenSize"
                    value={formData.screenSize}
                    onChange={handleInputChange}
                    placeholder="14.2 dyuym Liquid Retina XDR"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-black font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-900 mb-1.5">
                    Batareya / Avtonomlik
                  </label>
                  <input
                    type="text"
                    name="electronicsBattery"
                    value={formData.electronicsBattery}
                    onChange={handleInputChange}
                    placeholder="18 soatgacha"
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-black font-medium"
                  />
                </div>
              </div>

              {/* Ranglar */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1.5 flex items-center gap-1">
                  <Palette className="w-3.5 h-3.5 text-slate-500" />
                  <span>Mavjud ranglar</span>
                </label>
                
                <div className="flex flex-wrap gap-2 mb-2">
                  {currentPresetColors.map(color => {
                    const isSelected = selectedColors.includes(color);
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => toggleColorOption(color)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {isSelected ? `● ${color}` : color}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={customColorInput}
                    onChange={(e) => setCustomColorInput(e.target.value)}
                    placeholder="Boshqa rang..."
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-black font-medium"
                  />
                  <button
                    type="button"
                    onClick={addCustomColor}
                    className="px-3.5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-all cursor-pointer shrink-0"
                  >
                    + Qo'shish
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* QO'SHIMCHA XUSUSIYATLAR (UNIVERSAL KEY-VALUE) */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-slate-600" />
                <span>Qo'shimcha xususiyatlar (Ixtiyoriy)</span>
              </label>
              <span className="text-[10px] text-slate-400">
                O'zingiz xohlagan har qanday parametrlarni qo'shing
              </span>
            </div>

            {/* List of custom specs */}
            {customSpecs.length > 0 && (
              <div className="space-y-1.5">
                {customSpecs.map((spec, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-200 text-xs">
                    <div>
                      <span className="font-bold text-slate-800">{spec.label}: </span>
                      <span className="text-slate-600 font-medium">{spec.value}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeCustomSpec(idx)}
                      className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer transition-colors"
                      title="O'chirish"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add custom spec row */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newSpecLabel}
                onChange={(e) => setNewSpecLabel(e.target.value)}
                placeholder="Parametr nomi (masalan: Muzlatish quvvati)..."
                className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-black font-medium"
              />
              <input
                type="text"
                value={newSpecValue}
                onChange={(e) => setNewSpecValue(e.target.value)}
                placeholder="Qiymati (masalan: 12 kg/kun)..."
                className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-black font-medium"
              />
              <button
                type="button"
                onClick={addCustomSpec}
                className="px-3.5 py-2 bg-black hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Qo'shish</span>
              </button>
            </div>
          </div>

          {/* 4. TAVSIF / QO'SHIMCHA IZOH */}
          <div>
            <label className="block text-xs font-bold text-slate-900 mb-1.5">
              Qo'shimcha izoh / Tavsif
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={2}
              placeholder="Mahsulot haqida qo'shimcha umumiy ma'lumotlar..."
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-black font-medium"
            />
          </div>

        </form>

        {/* Modal Footer Actions */}
        <div className="p-5 border-t border-slate-100 bg-white flex items-center justify-end gap-3 sticky bottom-0 z-10">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 border border-slate-200 text-slate-700 hover:bg-slate-100 font-semibold text-xs rounded-xl transition-all cursor-pointer"
          >
            Bekor qilish
          </button>
          <button
            type="submit"
            form="productForm"
            disabled={loading}
            className="px-6 py-2.5 bg-black hover:bg-slate-900 text-white font-semibold text-xs rounded-xl transition-all shadow-sm flex items-center gap-2 disabled:opacity-75 cursor-pointer"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span>Saqlash</span>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
