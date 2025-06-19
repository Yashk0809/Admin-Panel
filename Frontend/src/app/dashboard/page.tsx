'use client';
import React, { useEffect, useState } from 'react';
import Layout from '../../../components/Layout';
import api from '../../../utils/api';
import { useRouter } from 'next/navigation';
import { withAuth } from '../../../utils/withAuth';
import { 
  Package, 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Upload, 
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  BarChart3,
  Users,
  Tag,
  Calendar
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

function Dashboard() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    setUsername(localStorage.getItem('username'));
    setRole(localStorage.getItem('role'));
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data);
      setLoading(false);
    } catch {
      setLoading(false);
      alert('Error fetching products');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/login');
  };

  if (loading) return <Layout><div>Loading...</div></Layout>;

  return (
    <Layout>
      {/* Top Header */}
      <div className="flex justify-between items-center p-4 bg-gray-100 shadow-md mb-4">
        <h1 className="text-xl font-semibold">Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-gray-700">👋 {username}</span>
          <button
            onClick={handleLogout}
            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded"
          >
            Logout
          </button>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4">Products List (Role: {role})</h2>
      {role === 'master' && (
  <div className="mb-4">
    <button
      onClick={() => router.push('/upload-csv')}
      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
    >
      Upload Products CSV
    </button>
  </div>
)}
      <div className="overflow-x-auto">
        <table className="table-auto w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 p-2">Name</th>
              <th className="border border-gray-300 p-2">Description</th>
              <th className="border border-gray-300 p-2">Price</th>
              <th className="border border-gray-300 p-2">Stock</th>
              <th className="border border-gray-300 p-2">Categories</th>
              <th className="border border-gray-300 p-2">Inventory (Available/Sold)</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p._id} className="hover:bg-gray-100">
                <td className="border border-gray-300 p-2">{p.name}</td>
                <td className="border border-gray-300 p-2">{p.description}</td>
                <td className="border border-gray-300 p-2">${p.price.toFixed(2)}</td>
                <td className="border border-gray-300 p-2">{p.stock}</td>
                <td className="border border-gray-300 p-2">
                  {p.categories.map(c => c.name).join(', ')}
                </td>
                <td className="border border-gray-300 p-2">
                  {p.inventory ? `${p.inventory.available} / ${p.inventory.sold}` : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
}

export default withAuth(Dashboard);
