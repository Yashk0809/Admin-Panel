// --- app/(protected)/add.tsx ---
'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../../../components/Layout';
import api from '../../../utils/api';
import Select from 'react-select';
import {
  Package,
  Tag,
  BarChart3,
  Plus,
  CheckCircle,
  AlertCircle,
  Layers,
  ShoppingCart,
} from 'lucide-react';

export default function AddPage() {
  const router = useRouter();

  // Shared Data
  const [allCategories, setAllCategories] = useState<{ _id: string; name: string }[]>([]);
  const [allProducts, setAllProducts] = useState<{ _id: string; name: string; inventory?: any }[]>([]);

  // Product
  const [product, setProduct] = useState({ name: '', description: '', price: '', stock: '', categories: [] as string[] });

  // Category
  const [category, setCategory] = useState({ name: '', description: '', products: [] as string[] });

  // Inventory
  const [inventory, setInventory] = useState({ productId: '', available: '', sold: '' });

  // Loading and success states
  const [loading, setLoading] = useState({ product: false, category: false, inventory: false });
  const [success, setSuccess] = useState({ product: false, category: false, inventory: false });
  const [error, setError] = useState({ product: '', category: '', inventory: '' });

  useEffect(() => {
    if (localStorage.getItem('role') !== 'master') router.push('/dashboard');
    api.get('/categories').then(res => setAllCategories(res.data));
    api.get('/products').then(res => setAllProducts(res.data));
  }, [router]);

  const handleAddProduct = async () => {
    setLoading(l => ({ ...l, product: true }));
    setSuccess(s => ({ ...s, product: false }));
    setError(e => ({ ...e, product: '' }));
    try {
      await api.post('/products', {
        name: product.name,
        description: product.description,
        price: parseFloat(product.price),
        stock: parseInt(product.stock),
        categoryIds: product.categories,
      });
      setSuccess(s => ({ ...s, product: true }));
      setProduct({ name: '', description: '', price: '', stock: '', categories: [] });
    } catch (err: unknown) {
      setError(e => ({ ...e, product: 'Failed to add product.' }));
    } finally {
      setLoading(l => ({ ...l, product: false }));
    }
  };

  const handleAddCategory = async () => {
    setLoading(l => ({ ...l, category: true }));
    setSuccess(s => ({ ...s, category: false }));
    setError(e => ({ ...e, category: '' }));
    try {
      await api.post('/categories', {
        name: category.name,
        description: category.description,
        productIds: category.products,
      });
      setSuccess(s => ({ ...s, category: true }));
      setCategory({ name: '', description: '', products: [] });
    } catch (err: unknown) {
      setError(e => ({ ...e, category: 'Failed to add category.' }));
    } finally {
      setLoading(l => ({ ...l, category: false }));
    }
  };

  const handleAddInventory = async () => {
    setLoading(l => ({ ...l, inventory: true }));
    setSuccess(s => ({ ...s, inventory: false }));
    setError(e => ({ ...e, inventory: '' }));
    if (!inventory.productId) return alert('Please select a product');
    const existing = allProducts.find(p => p._id === inventory.productId)?.inventory;
    const payload = {
      available: parseInt(inventory.available),
      sold: parseInt(inventory.sold),
    };
    try {
      if (existing?._id) {
        await api.put(`/inventories/${existing._id}`, payload);
      } else {
        await api.post('/inventories', {
          ...payload,
          productId: inventory.productId,
        });
      }
      setSuccess(s => ({ ...s, inventory: true }));
      setInventory({ productId: '', available: '', sold: '' });
    } catch (err: unknown) {
      setError(e => ({ ...e, inventory: 'Failed to update inventory.' }));
    } finally {
      setLoading(l => ({ ...l, inventory: false }));
    }
  };

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <Layers className="h-7 w-7 text-blue-600" /> Add New Items
        </h1>
        <p className="text-gray-600">Create new products, categories, and manage inventory</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Product Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <Package className="h-6 w-6 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">Add Product</h2>
          </div>
          <input placeholder="Name" className="w-full border p-2 mb-2 rounded" value={product.name} onChange={e => setProduct(p => ({ ...p, name: e.target.value }))} />
          <textarea placeholder="Description" className="w-full border p-2 mb-2 rounded" value={product.description} onChange={e => setProduct(p => ({ ...p, description: e.target.value }))} />
          <div className="flex gap-2 mb-2">
            <input type="number" placeholder="Price" className="w-1/2 border p-2 rounded" value={product.price} onChange={e => setProduct(p => ({ ...p, price: e.target.value }))} />
            <input type="number" placeholder="Stock" className="w-1/2 border p-2 rounded" value={product.stock} onChange={e => setProduct(p => ({ ...p, stock: e.target.value }))} />
          </div>
          <label className="block mb-1 font-medium">Categories</label>
          <Select
            isMulti
            options={allCategories.map(c => ({ value: c._id, label: c.name }))}
            value={allCategories.filter(c => product.categories.includes(c._id)).map(c => ({ value: c._id, label: c.name }))}
            onChange={selectedOptions => setProduct(p => ({ ...p, categories: selectedOptions ? selectedOptions.map((o: any) => o.value) : [] }))}
            className="mb-4"
            placeholder="Select categories"
          />
          <button
            onClick={handleAddProduct}
            disabled={loading.product}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition-all duration-200 disabled:opacity-50"
          >
            {loading.product ? <span className="animate-spin h-5 w-5 border-b-2 border-white rounded-full"></span> : <Plus className="h-5 w-5" />}
            Add Product
          </button>
          {success.product && (
            <div className="flex items-center gap-2 mt-3 p-2 bg-green-50 border border-green-200 rounded">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-800 text-sm font-medium">Product added!</span>
            </div>
          )}
          {error.product && (
            <div className="flex items-center gap-2 mt-3 p-2 bg-red-50 border border-red-200 rounded">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-800 text-sm font-medium">{error.product}</span>
            </div>
          )}
        </div>
        {/* Category Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <Tag className="h-6 w-6 text-emerald-600" />
            <h2 className="text-lg font-bold text-gray-900">Add Category</h2>
          </div>
          <input placeholder="Name" className="w-full border p-2 mb-2 rounded" value={category.name} onChange={e => setCategory(c => ({ ...c, name: e.target.value }))} />
          <textarea placeholder="Description" className="w-full border p-2 mb-2 rounded" value={category.description} onChange={e => setCategory(c => ({ ...c, description: e.target.value }))} />
          <label className="block mb-1 font-medium">Products</label>
          <Select
            isMulti
            options={allProducts.map(p => ({ value: p._id, label: p.name }))}
            value={allProducts.filter(p => category.products.includes(p._id)).map(p => ({ value: p._id, label: p.name }))}
            onChange={selectedOptions => setCategory(c => ({ ...c, products: selectedOptions ? selectedOptions.map((o: any) => o.value) : [] }))}
            className="mb-4"
            placeholder="Select products"
          />
          <button
            onClick={handleAddCategory}
            disabled={loading.category}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold transition-all duration-200 disabled:opacity-50"
          >
            {loading.category ? <span className="animate-spin h-5 w-5 border-b-2 border-white rounded-full"></span> : <Plus className="h-5 w-5" />}
            Add Category
          </button>
          {success.category && (
            <div className="flex items-center gap-2 mt-3 p-2 bg-green-50 border border-green-200 rounded">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-800 text-sm font-medium">Category added!</span>
            </div>
          )}
          {error.category && (
            <div className="flex items-center gap-2 mt-3 p-2 bg-red-50 border border-red-200 rounded">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-800 text-sm font-medium">{error.category}</span>
            </div>
          )}
        </div>
        {/* Inventory Form */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="h-6 w-6 text-purple-600" />
            <h2 className="text-lg font-bold text-gray-900">Manage Inventory</h2>
          </div>
          <label className="block mb-1 font-medium">Product</label>
          <select
            className="w-full border p-2 mb-2 rounded"
            value={inventory.productId}
            onChange={e => setInventory(i => ({ ...i, productId: e.target.value }))}
            title="Select product"
          >
            <option value="">-- Select Product --</option>
            {allProducts.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
          <div className="flex gap-2 mb-2">
            <input type="number" placeholder="Available" className="w-1/2 border p-2 rounded" value={inventory.available} onChange={e => setInventory(i => ({ ...i, available: e.target.value }))} />
            <input type="number" placeholder="Sold" className="w-1/2 border p-2 rounded" value={inventory.sold} onChange={e => setInventory(i => ({ ...i, sold: e.target.value }))} />
          </div>
          <button
            onClick={handleAddInventory}
            disabled={loading.inventory}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded font-semibold transition-all duration-200 disabled:opacity-50"
          >
            {loading.inventory ? <span className="animate-spin h-5 w-5 border-b-2 border-white rounded-full"></span> : <ShoppingCart className="h-5 w-5" />}
            Update Inventory
          </button>
          {success.inventory && (
            <div className="flex items-center gap-2 mt-3 p-2 bg-green-50 border border-green-200 rounded">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-green-800 text-sm font-medium">Inventory updated!</span>
            </div>
          )}
          {error.inventory && (
            <div className="flex items-center gap-2 mt-3 p-2 bg-red-50 border border-red-200 rounded">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <span className="text-red-800 text-sm font-medium">{error.inventory}</span>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
