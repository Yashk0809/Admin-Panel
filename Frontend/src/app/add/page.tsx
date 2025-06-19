// --- app/(protected)/add.tsx ---
'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '../../../components/Layout';
import api from '../../../utils/api';
import Select from 'react-select';

export default function AddPage() {
  const router = useRouter();

  // Shared Data
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);

  // Product
  const [product, setProduct] = useState({ name: '', description: '', price: '', stock: '', categories: [] as string[] });

  // Category
  const [category, setCategory] = useState({ name: '', description: '', products: [] as string[] });

  // Inventory
  const [inventory, setInventory] = useState({ productId: '', available: '', sold: '' });

  useEffect(() => {
    if (localStorage.getItem('role') !== 'master') router.push('/dashboard');
    api.get('/categories').then(res => setAllCategories(res.data));
    api.get('/products').then(res => setAllProducts(res.data));
  }, [router]);

  const handleAddProduct = async () => {
    try {
        await api.post('/products', {
            name: product.name,
            description: product.description,
            price: parseFloat(product.price),
            stock: parseInt(product.stock),
            categoryIds: product.categories, // ✅ correct field name for backend
          });
      alert('Product added');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error adding product');
    }
  };

  const handleAddCategory = async () => {
    try {
        console.log(category.products);
      await api.post('/categories', {
        name: category.name,
        description: category.description,
        productIds: category.products, // ✅ mapped from multiselect
      });
      alert('Category added');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error adding category');
    }
  };

  const handleAddInventory = async () => {
    if (!inventory.productId) return alert('Please select a product');
  
    const existing = allProducts.find(p => p._id === inventory.productId)?.inventory;
  
    const payload = {
      available: parseInt(inventory.available),
      sold: parseInt(inventory.sold),
    };
  
    try {
      if (existing?._id) {
        // 🔁 Update existing inventory
        await api.put(`/inventories/${existing._id}`, payload);
        alert('Inventory updated');
      } else {
        // ➕ Create new inventory
        await api.post('/inventories', {
          ...payload,
          productId: inventory.productId,
        });
        alert('Inventory created');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Inventory request failed');
    }
  };

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4">
        {/* Product Form */}
        <div className="p-4 bg-white shadow rounded">
          <h2 className="text-lg font-bold mb-2">Add Product</h2>
          <input placeholder="Name" className="w-full border p-2 mb-2" value={product.name} onChange={e => setProduct(p => ({ ...p, name: e.target.value }))} />
          <input placeholder="Description" className="w-full border p-2 mb-2" value={product.description} onChange={e => setProduct(p => ({ ...p, description: e.target.value }))} />
          <input type="number" placeholder="Price" className="w-full border p-2 mb-2" value={product.price} onChange={e => setProduct(p => ({ ...p, price: e.target.value }))} />
          <input type="number" placeholder="Stock" className="w-full border p-2 mb-2" value={product.stock} onChange={e => setProduct(p => ({ ...p, stock: e.target.value }))} />
          <label className="block mb-1">Categories</label>
          <Select
            isMulti
            options={allCategories.map(c => ({ value: c._id, label: c.name }))}
            onChange={(selectedOptions) =>
                setProduct(p => ({ ...p, categories: selectedOptions.map(o => o.value) }))
            }
            className="mb-4"
            />
          <button onClick={handleAddProduct} className="w-full bg-blue-600 text-white py-2 rounded">Add Product</button>
        </div>

        {/* Category Form */}
        <div className="p-4 bg-white shadow rounded">
          <h2 className="text-lg font-bold mb-2">Add Category</h2>
          <input placeholder="Name" className="w-full border p-2 mb-2" value={category.name} onChange={e => setCategory(c => ({ ...c, name: e.target.value }))} />
          <input placeholder="Description" className="w-full border p-2 mb-2" value={category.description} onChange={e => setCategory(c => ({ ...c, description: e.target.value }))} />
          <label className="block mb-1">Products</label>
          <Select
            isMulti
            options={allProducts.map(p => ({ value: p._id, label: p.name }))}
            onChange={(selectedOptions) =>
                setCategory(c => ({
                  ...c,
                  products: selectedOptions ? selectedOptions.map((o: any) => o.value) : [],
                }))
              }
            className="mb-4"
            />
          <button onClick={handleAddCategory} className="w-full bg-blue-600 text-white py-2 rounded">Add Category</button>
        </div>

        {/* Inventory Form */}
        <div className="p-4 bg-white shadow rounded">
          <h2 className="text-lg font-bold mb-2">Add Inventory</h2>
          <label className="block mb-1">Product</label>
          <select className="w-full border p-2 mb-2" value={inventory.productId} onChange={e => setInventory(i => ({ ...i, productId: e.target.value }))}>
            <option value="">-- Select Product --</option>
            {allProducts.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>
          <input type="number" placeholder="Available" className="w-full border p-2 mb-2" value={inventory.available} onChange={e => setInventory(i => ({ ...i, available: e.target.value }))} />
          <input type="number" placeholder="Sold" className="w-full border p-2 mb-4" value={inventory.sold} onChange={e => setInventory(i => ({ ...i, sold: e.target.value }))} />
          <button onClick={handleAddInventory} className="w-full bg-blue-600 text-white py-2 rounded">Add Inventory</button>
        </div>
      </div>
    </Layout>
  );
}
