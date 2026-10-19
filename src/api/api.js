const envApiUrl = import.meta.env.VITE_API_URL || '';
const isDev = import.meta.env.DEV;
export const SERVER_URL = envApiUrl || (isDev ? '' : 'http://localhost:5000');
export const BASE_URL = isDev && !envApiUrl ? '/api' : `${SERVER_URL || 'http://localhost:5000'}/api`;

/**
 * Get image full URL pointing to backend or full URL
 */
export function getImageUrl(path) {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) return path;
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${SERVER_URL || 'http://localhost:5000'}${clean}`;
}

/**
 * Get current admin auth token from localStorage
 */
export function getToken() {
  return localStorage.getItem('adminToken') || '';
}

/**
 * Save token and user details to localStorage
 */
export function setAuthData(token, adminData) {
  if (token) localStorage.setItem('adminToken', token);
  if (adminData) localStorage.setItem('adminUser', JSON.stringify(adminData));
}

/**
 * Clear auth data
 */
export function clearAuthData() {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
}

/**
 * 1. AUTH API
 */
export async function loginAdmin(username = 'admin', password = 'adminxon77') {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || data.error || 'Kirishda xatolik yuz berdi. Email yoki parol noto\'g\'ri');
  }

  const token = data.token;
  const admin = data.admin || { username: data.username || username, id: data.id || 'admin-1' };
  setAuthData(token, admin);

  return { token, admin };
}

/**
 * Helper to fetch with automatic Bearer token injection and auto-login retry on 401
 */
export async function fetchWithAuth(url, options = {}, isJson = true) {
  let token = getToken();
  if (!token) {
    try {
      const loginRes = await loginAdmin();
      token = loginRes.token;
    } catch (e) {
      console.warn('Auto auth warning:', e);
    }
  }

  const headers = {
    ...(options.headers || {}),
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
  if (isJson && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  let res = await fetch(url, { ...options, headers });

  // If 401 Unauthorized, automatically refresh token with admin credentials and retry once
  if (res.status === 401) {
    try {
      const freshLogin = await loginAdmin();
      const retryHeaders = {
        ...(options.headers || {}),
        'Authorization': `Bearer ${freshLogin.token}`
      };
      if (isJson && !retryHeaders['Content-Type']) {
        retryHeaders['Content-Type'] = 'application/json';
      }
      res = await fetch(url, { ...options, headers: retryHeaders });
    } catch (reAuthErr) {
      console.error('Re-authentication failed:', reAuthErr);
    }
  }

  return res;
}

/**
 * 2. PRODUCTS API
 */
export async function getProducts(params = {}) {
  const query = new URLSearchParams();
  if (params.category && params.category !== 'Barchasi') query.append('category', params.category);
  if (params.search) query.append('search', params.search);
  if (params.brand && params.brand !== 'Barchasi') query.append('brand', params.brand);
  if (params.page) query.append('page', params.page);
  if (params.limit) query.append('limit', params.limit || 20);
  query.append('all', 'true'); // Show all products for admin

  const url = `${BASE_URL}/products?${query.toString()}`;
  const res = await fetchWithAuth(url, { method: 'GET' }, false);

  if (!res.ok) {
    throw new Error('Mahsulotlarni yuklashda xatolik yuz berdi');
  }
  return await res.json();
}

export async function createProduct(formData) {
  const res = await fetchWithAuth(`${BASE_URL}/products`, {
    method: 'POST',
    body: formData
  }, false);

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Mahsulot yaratishda xatolik yuz berdi');
  }
  return data;
}

export async function updateProduct(id, formDataOrJson) {
  const isFormData = formDataOrJson instanceof FormData;
  const res = await fetchWithAuth(`${BASE_URL}/products/${id}`, {
    method: 'PUT',
    body: isFormData ? formDataOrJson : JSON.stringify(formDataOrJson)
  }, !isFormData);

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Mahsulotni tahrirlashda xatolik yuz berdi');
  }
  return data;
}

export async function deleteProduct(id) {
  const res = await fetchWithAuth(`${BASE_URL}/products/${id}`, {
    method: 'DELETE'
  }, false);

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Mahsulotni o\'chirishda xatolik yuz berdi');
  }
  return data;
}

/**
 * 3. ORDERS API
 */
export async function getOrders(params = {}) {
  const query = new URLSearchParams();
  if (params.status && params.status !== 'all') query.append('status', params.status);
  if (params.page) query.append('page', params.page);
  if (params.limit) query.append('limit', params.limit || 20);

  const res = await fetchWithAuth(`${BASE_URL}/orders?${query.toString()}`, {
    method: 'GET'
  }, false);

  if (!res.ok) {
    throw new Error('Buyurtmalarni yuklashda xatolik yuz berdi');
  }
  return await res.json();
}

export async function updateOrderStatus(id, status) {
  const res = await fetchWithAuth(`${BASE_URL}/orders/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  }, true);

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || 'Buyurtma statusini o\'zgartirishda xatolik');
  }
  return data;
}

export async function getOrderReceiptBlob(id) {
  const res = await fetchWithAuth(`${BASE_URL}/orders/${id}/receipt`, {
    method: 'GET'
  }, false);

  if (!res.ok) {
    throw new Error('Chek rasmini yuklab bo\'lmadi');
  }
  const blob = await res.blob();
  return URL.createObjectURL(blob);
}

/**
 * 4. USERS API
 */
export async function getUsers() {
  const res = await fetchWithAuth(`${BASE_URL}/users`, {
    method: 'GET'
  }, false);

  if (!res.ok) {
    throw new Error('Foydalanuvchilarni yuklashda xatolik');
  }
  return await res.json();
}

/**
 * 5. SITE CONTENT / CMS API
 */
export async function getSiteContent() {
  const res = await fetch(`${BASE_URL}/site-content`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' }
  });
  if (!res.ok) {
    throw new Error('Sayt ma\'lumotlarini yuklashda xatolik yuz berdi');
  }
  return await res.json();
}

export async function updateSiteContent(data) {
  // 1. Backend API (MongoDB) ga saqlash
  const res = await fetchWithAuth(`${BASE_URL}/site-content`, {
    method: 'PUT',
    body: JSON.stringify(data)
  }, true);

  const resData = await res.json();
  if (!res.ok) {
    throw new Error(resData.message || 'Sayt ma\'lumotlarini saqlashda xatolik');
  }

  // 2. Lokal muhitda Full repo git push ni ishga tushirish (Vercel avto-deploy uchun)
  if (isDev) {
    try {
      await fetch('/api/local-git-push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: resData.content || data })
      });
    } catch (e) {
      console.warn('Local git push sync info:', e);
    }
  }

  return resData;
}

