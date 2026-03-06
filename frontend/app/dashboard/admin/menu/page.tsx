'use client';

import { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { menuService, MenuItem } from '@/services/menu';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const DEFAULT_CATEGORIES = ['MAIN', 'APPETIZER', 'DESSERT', 'DRINKS'];

export default function AdminMenuPage() {
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    category: 'MAIN',
    imageUrl: '',
    prepTime: '15',
    moodTags: '',
    suitableFor: '',
    customizations: '',
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [csvData, setCsvData] = useState('');
  const [csvSubmitting, setCsvSubmitting] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    imageUrl: '',
    price: '',
    category: 'MAIN',
    prepTime: '15',
    moodTags: '',
    suitableFor: '',
    customizations: '',
  });

  const parseCsv = (value: string) =>
    value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const menuResponse = await menuService.getMenuItems({ limit: 200, offset: 0 });
      setItems(menuResponse.data.items);
      const categorySet = new Set([
        ...DEFAULT_CATEGORIES,
        ...menuResponse.data.items.map((item) => String(item.category || '').toUpperCase()),
      ]);
      const resolvedCategories = Array.from(categorySet).filter(Boolean);
      if (resolvedCategories.length > 0) {
        setCategories(resolvedCategories);
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to load menu items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated && isAdmin) {
      loadData();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading, isAuthenticated, isAdmin]);

  const submitNewItem = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price || !form.category) {
      setError('Name, price, and category are required.');
      return;
    }

    setSubmitting(true);
    setError('');
    setMessage('');
    try {
      const created = await menuService.createMenuItem({
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        category: form.category,
        imageUrl: form.imageUrl.trim(),
        moodTags: parseCsv(form.moodTags),
        suitableFor: parseCsv(form.suitableFor),
        customizations: parseCsv(form.customizations),
        prepTime: Number(form.prepTime) || 15,
      });

      setItems((prev) => [created, ...prev]);
      setMessage('Menu item added successfully.');
      setForm({
        name: '',
        description: '',
        price: '',
        category: form.category,
        imageUrl: '',
        prepTime: '15',
        moodTags: '',
        suitableFor: '',
        customizations: '',
      });
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to add item');
    } finally {
      setSubmitting(false);
    }
  };

  const startEditing = (item: MenuItem) => {
    setEditingId(item.id);
    setEditForm({
      name: item.name || '',
      description: item.description || '',
      imageUrl: item.imageUrl || '',
      price: String(item.price ?? ''),
      category: item.category || 'MAIN',
      prepTime: String(item.prepTime || 15),
      moodTags: (item.moodTags || []).join(', '),
      suitableFor: (item.suitableFor || []).join(', '),
      customizations: (item.customizations || item.suitableFor || []).join(', '),
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditForm({
      name: '',
      description: '',
      imageUrl: '',
      price: '',
      category: 'MAIN',
      prepTime: '15',
      moodTags: '',
      suitableFor: '',
      customizations: '',
    });
  };

  const saveEdit = async (item: MenuItem) => {
    if (!editForm.name.trim()) {
      setError('Item name is required.');
      return;
    }

    setError('');
    setMessage('');
    try {
      const updated = await menuService.updateMenuItem(item.id, {
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        imageUrl: editForm.imageUrl.trim(),
        price: Number(editForm.price),
        category: editForm.category,
        prepTime: Number(editForm.prepTime) || 15,
        moodTags: parseCsv(editForm.moodTags),
        suitableFor: parseCsv(editForm.suitableFor),
        customizations: parseCsv(editForm.customizations),
      });
      setItems((prev) => prev.map((m) => (m.id === item.id ? { ...m, ...updated } : m)));
      setMessage(`"${updated.name}" updated successfully.`);
      cancelEditing();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to update item');
    }
  };

  const toggleAvailability = async (item: MenuItem) => {
    const nextState = !(item.available ?? true);
    setError('');
    setMessage('');
    try {
      await menuService.toggleAvailability(item.id, nextState);
      setItems((prev) =>
        prev.map((m) => (m.id === item.id ? { ...m, available: nextState } : m))
      );
      setMessage(`"${item.name}" marked as ${nextState ? 'available' : 'unavailable'}.`);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to update availability');
    }
  };

  const deleteItem = async (item: MenuItem) => {
    if (!confirm(`Delete "${item.name}"?`)) {
      return;
    }

    setError('');
    setMessage('');
    try {
      await menuService.deleteMenuItem(item.id);
      setItems((prev) => prev.filter((m) => m.id !== item.id));
      setMessage(`"${item.name}" deleted.`);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to delete item');
    }
  };

  const handleCsvFileSelected = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      setCsvData(text);
      setMessage(`Loaded CSV file: ${file.name}`);
      setError('');
    } catch (err: any) {
      setError(err?.message || 'Failed to read CSV file');
    } finally {
      event.target.value = '';
    }
  };

  const submitCsvUpload = async (e: FormEvent) => {
    e.preventDefault();
    if (!csvData.trim()) {
      setError('Paste CSV data or select a CSV file first.');
      return;
    }

    setCsvSubmitting(true);
    setError('');
    setMessage('');
    try {
      const result = await menuService.bulkUploadCsv(csvData);
      const { totalRows, created, updated, skipped } = result.data;
      setMessage(`CSV processed: ${totalRows} rows, ${created} created, ${updated} updated, ${skipped} skipped.`);
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to process CSV upload');
    } finally {
      setCsvSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <Card className="p-8 text-center">
        <p className="text-lg">Loading menu management...</p>
      </Card>
    );
  }

  if (!isAuthenticated) {
    return (
      <Card className="p-8 text-center">
        <p className="text-lg">Please log in to access this page.</p>
      </Card>
    );
  }

  if (!isAdmin) {
    return (
      <Card className="p-8 text-center">
        <p className="text-lg text-red-700">Access denied. Admin only.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Menu Management</h1>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Add Menu Item</h2>
        <form onSubmit={submitNewItem} className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Input
            placeholder="Item name"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          />
          <Input
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
          />
          <Input
            type="number"
            min="0"
            step="0.01"
            placeholder="Price"
            value={form.price}
            onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
          />
          <select
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={form.category}
            onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <Input
            placeholder="Image URL (optional)"
            value={form.imageUrl}
            onChange={(e) => setForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
            className="md:col-span-4"
          />
          <Input
            type="number"
            min="1"
            placeholder="Prep time (minutes)"
            value={form.prepTime}
            onChange={(e) => setForm((prev) => ({ ...prev, prepTime: e.target.value }))}
          />
          <Input
            placeholder="Mood tags (comma separated)"
            value={form.moodTags}
            onChange={(e) => setForm((prev) => ({ ...prev, moodTags: e.target.value }))}
          />
          <Input
            placeholder="Suitable for (comma separated)"
            value={form.suitableFor}
            onChange={(e) => setForm((prev) => ({ ...prev, suitableFor: e.target.value }))}
            className="md:col-span-2"
          />
          <Input
            placeholder="Customizations (comma separated)"
            value={form.customizations}
            onChange={(e) => setForm((prev) => ({ ...prev, customizations: e.target.value }))}
            className="md:col-span-2"
          />
          <div className="md:col-span-4">
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Adding...' : 'Add Item'}
            </Button>
          </div>
        </form>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-2">Bulk Upload from CSV</h2>
        <p className="text-sm text-slate-600 mb-4">
          Required headers: <code>name,price,category</code>. Optional: <code>description,image,prepTime,moodTags,suitableFor</code>.
        </p>
        <form onSubmit={submitCsvUpload} className="space-y-3">
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={handleCsvFileSelected}
            className="block w-full text-sm"
          />
          <textarea
            value={csvData}
            onChange={(e) => setCsvData(e.target.value)}
            rows={8}
            placeholder="name,price,category,description,prepTime&#10;Paneer Tikka,12.5,APPETIZER,Spicy grilled paneer,15"
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <div>
            <Button type="submit" disabled={csvSubmitting}>
              {csvSubmitting ? 'Uploading CSV...' : 'Upload CSV'}
            </Button>
          </div>
        </form>
      </Card>

      {error && (
        <Card className="p-4 border-red-200 bg-red-50">
          <p className="text-red-800">{error}</p>
        </Card>
      )}
      {message && (
        <Card className="p-4 border-green-200 bg-green-50">
          <p className="text-green-800">{message}</p>
        </Card>
      )}

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Current Menu ({items.length})</h2>
          <Button variant="outline" onClick={loadData}>
            Refresh
          </Button>
        </div>

        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
            >
              <div className="flex-1">
                {editingId === item.id ? (
                  <div className="space-y-2">
                    <Input
                      value={editForm.name}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                      placeholder="Item name"
                    />
                    <Input
                      value={editForm.description}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Description"
                    />
                    <Input
                      value={editForm.imageUrl}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
                      placeholder="Image URL"
                    />
                    <Input
                      type="number"
                      min="0"
                      value={editForm.price}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, price: e.target.value }))}
                      placeholder="Price"
                    />
                    <select
                      className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={editForm.category}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, category: e.target.value }))}
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    <Input
                      type="number"
                      min="1"
                      value={editForm.prepTime}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, prepTime: e.target.value }))}
                      placeholder="Prep time (minutes)"
                    />
                    <Input
                      value={editForm.moodTags}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, moodTags: e.target.value }))}
                      placeholder="Mood tags (comma separated)"
                    />
                    <Input
                      value={editForm.suitableFor}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, suitableFor: e.target.value }))}
                      placeholder="Suitable for (comma separated)"
                    />
                    <Input
                      value={editForm.customizations}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, customizations: e.target.value }))}
                      placeholder="Customizations (comma separated)"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => saveEdit(item)}>
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEditing}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-gray-600">{item.description || 'No description'}</p>
                    <p className="text-sm text-gray-700">
                      {item.category} | INR {Number(item.price).toFixed(2)}
                    </p>
                    {item.customizations && item.customizations.length > 0 && (
                      <p className="text-xs text-gray-600 mt-1">
                        Customizations: {item.customizations.join(', ')}
                      </p>
                    )}
                    {item.imageUrl && (
                      <p className="text-xs text-gray-500 mt-1 break-all">{item.imageUrl}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                {editingId !== item.id && (
                  <Button variant="outline" onClick={() => startEditing(item)}>
                    Edit
                  </Button>
                )}
                <Button
                  variant={item.available ? 'secondary' : 'default'}
                  onClick={() => toggleAvailability(item)}
                  disabled={editingId === item.id}
                >
                  {item.available ? 'Set Unavailable' : 'Set Available'}
                </Button>
                <Button
                  variant="outline"
                  className="text-red-700 border-red-200 hover:bg-red-50"
                  onClick={() => deleteItem(item)}
                  disabled={editingId === item.id}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
          {items.length === 0 && <p className="text-gray-600">No items found.</p>}
        </div>
      </Card>
    </div>
  );
}
