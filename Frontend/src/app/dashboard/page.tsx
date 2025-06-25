'use client';
import React, { useEffect, useState } from 'react';
import Layout from '../../../components/Layout';
import api from '../../../utils/api';
import { useRouter } from 'next/navigation';
import { cookies } from 'next/headers'
import Select from 'react-select';

import {
  Package,
  TrendingUp,
  DollarSign,
  Upload,
  Filter,
  Search,
  AlertTriangle
} from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  categories: { _id: string; name: string }[];
  inventory: { available: number; sold: number };
}

export default function Dashboard() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [showHighStockOnly, setShowHighStockOnly] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [categories, setCategories] = useState<{ _id: string; name: string }[]>([]);
  

  useEffect(() => {
    // const token = Cookies.get('token');
    // if (!token) {
    //   router.replace('/login');
    // }

    setUsername(localStorage.getItem('username'));
    setRole(localStorage.getItem('role'));
    fetchProducts();
  }, []);

  // const fetchProducts = async () => {
  //   try {
  //     const res = await api.get('/products');
  //     setProducts(res.data);
  //     setLoading(false);
  //   } catch {
  //     setLoading(false);
  //     alert('Error fetching products');
  //   }
  // };

  const fetchProducts = async () => {
    try {
      const query: any = {};
      if (selectedCategories.length > 0) {
        query.categoryIds = selectedCategories.join(',');
      }
      if (showHighStockOnly) query.highAvailableOnly = true;
  
      const queryString = new URLSearchParams(query).toString();
      const res = await api.get(`/products?${queryString}`);
      setProducts(res.data);
      setLoading(false);
    } catch {
      setLoading(false);
      alert('Error fetching products');
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategories, showHighStockOnly]);

  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data));
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
  
      localStorage.clear();     // 🧹 Clear client-side storage               // 📦 Close sidebar
      router.push('/login');    // 🔁 Redirect
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleUploadCSV = () => router.push('/upload-csv');

  const allCategories = Array.from(
    new Set(products.flatMap(p => p.categories.map(c => c.name)))
  );

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedCategory === '' ||
      product.categories.some(c => c.name === selectedCategory))
  );

  const categoryOptions = categories.map(c => ({
    value: c._id,
    label: c.name,
  }));



  const totalProducts = products.length;
  const totalValue = products.reduce((acc, p) => acc + p.price * p.stock, 0);
  const totalSold = products.reduce((acc, p) => acc + (p.inventory?.sold || 0), 0);
  const lowStockProducts = products.filter(p => p.stock < 20).length;

  if (loading) return <Layout>Loading...</Layout>;

  return (
    <Layout username={username ?? undefined} role={role ?? undefined} onLogout={handleLogout}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h1>
            <p className="text-gray-600">Manage your products and monitor your business performance</p>
          </div>
          {role === 'master' && (
            <button
              onClick={handleUploadCSV}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Upload className="h-5 w-5" />
              <span className="font-medium">Upload CSV</span>
            </button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            {
              label: 'Total Products',
              value: totalProducts,
              icon: <Package className="h-6 w-6 text-white" />,
              color: 'from-blue-500 to-blue-600',
            },
            {
              label: 'Total Value',
              value: `$${totalValue.toLocaleString()}`,
              icon: <DollarSign className="h-6 w-6 text-white" />,
              color: 'from-emerald-500 to-emerald-600',
            },
            {
              label: 'Total Sold',
              value: totalSold,
              icon: <TrendingUp className="h-6 w-6 text-white" />,
              color: 'from-purple-500 to-purple-600',
            },

          ].map((card, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{card.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                </div>
                <div className={`p-3 bg-gradient-to-r ${card.color} rounded-xl`}>{card.icon}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter Section */}
      <div className="bg-white rounded-2xl p-6 shadow-lg mb-8">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl"
            />
          </div>
          <div className="sm:w-64 relative">
            <Filter className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl appearance-none bg-white"
              title="Filter by category"
            >
              <option value="">All Categories</option>
              {allCategories.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="sm:w-64 relative">
      <Filter className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
      
      <Select
  isMulti
  options={categoryOptions}
  value={categoryOptions.filter(option => selectedCategories.includes(option.value))}
  onChange={selected => setSelectedCategories(selected.map(option => option.value))}
  placeholder="Select categories..."
  className="mb-4"
/>
    </div>

      {/*  HighStock check box */}
      <div className="flex items-center gap-2 mt-4">
        <input
          type="checkbox"
          id="highStock"
          checked={showHighStockOnly}
          onChange={e => setShowHighStockOnly(e.target.checked)}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
        />
        <label htmlFor="highStock" className="text-gray-700 text-sm">
          Show only products with available stock ≥ 100
        </label>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Product', 'Price', 'Stock', 'Categories', 'Sold'].map((h, i) => (
                  <th
                    key={i}
                    className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.map(product => (
                <tr key={product._id} className="hover:bg-blue-50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">{product.description}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">${product.price.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      (product.inventory?.available ?? 0) < 20 ? 'bg-red-100 text-red-800' :
                      (product.inventory?.available ?? 0) < 50 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {product.inventory?.available ?? 0} units
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {product.categories.map(c => (
                      <span key={c._id} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mr-1">
                        {c.name}
                      </span>
                    ))}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{product.inventory?.sold ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Empty State */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
