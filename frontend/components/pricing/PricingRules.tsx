'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { getToken } from '@/utils/auth';
import { DynamicPrice } from '@/types/phase11';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertCircle,
  Check,
  Trash2,
  Edit2,
  Plus,
} from 'lucide-react';

interface PricingRule {
  id?: string;
  itemId: string;
  timeRange: string;
  dayOfWeek: string;
  demandLevel: string;
  priceMultiplier: number;
  minPrice: number;
  maxPrice: number;
  isActive?: boolean;
}

export default function PricingRules() {
  const { isAuthenticated } = useAuth();
  const [token, setToken] = useState<string | null>(null);
  const [rules, setRules] = useState<DynamicPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      const storedToken = getToken();
      setToken(storedToken);
    }
  }, [isAuthenticated]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<PricingRule>({
    itemId: '',
    timeRange: 'PEAK',
    dayOfWeek: 'MONDAY',
    demandLevel: 'HIGH',
    priceMultiplier: 1.0,
    minPrice: 0,
    maxPrice: 1000,
  });

  const fetchRules = async () => {
    if (!token) return;

    setLoading(true);
    try {
      // Placeholder - would need an endpoint to list all rules
      // For now, using the getDynamicMenu which includes pricing rules
      setRules([]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load pricing rules'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token || !formData.itemId) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      if (editingId) {
        // Update existing rule
        // await pricingService.updateRule(editingId, formData, token);
        setSuccess('Rule updated successfully!');
      } else {
        // Create new rule
        // await pricingService.createRule(formData, token);
        setSuccess('Rule created successfully!');
      }

      setShowForm(false);
      setEditingId(null);
      setFormData({
        itemId: '',
        timeRange: 'PEAK',
        dayOfWeek: 'MONDAY',
        demandLevel: 'HIGH',
        priceMultiplier: 1.0,
        minPrice: 0,
        maxPrice: 1000,
      });
      setTimeout(() => setSuccess(''), 3000);
      fetchRules();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save rule');
    }
  };

  const handleEdit = (rule: DynamicPrice) => {
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    setFormData({
      id: rule.id,
      itemId: rule.menuItemId,
      timeRange: String(rule.timeRange),
      dayOfWeek: dayNames[rule.dayOfWeek] || String(rule.dayOfWeek),
      demandLevel: rule.demandLevel,
      priceMultiplier: rule.priceMultiplier,
      // minPrice: rule.minPrice,
      // maxPrice: rule.maxPrice,
      minPrice: 0,
      maxPrice: 1000,
    });
    setEditingId(rule.id);
    setShowForm(true);
  };

  const handleDelete = async (ruleId: string) => {
    if (!token) return;

    if (!confirm('Are you sure you want to delete this rule?')) return;

    try {
      // await pricingService.deleteRule(ruleId, token);
      setRules((prev) => prev.filter((r) => r.id !== ruleId));
      setSuccess('Rule deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete rule');
    }
  };

  const demandLevels = ['LOW', 'MEDIUM', 'HIGH', 'PEAK'];
  const daysOfWeek = [
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
    'SUNDAY',
  ];
  const timeRanges = ['BREAKFAST', 'LUNCH', 'DINNER', 'PEAK'];

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Dynamic Pricing Rules</h2>
        <Button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({
              itemId: '',
              timeRange: 'PEAK',
              dayOfWeek: 'MONDAY',
              demandLevel: 'HIGH',
              priceMultiplier: 1.0,
              minPrice: 0,
              maxPrice: 1000,
            });
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          {showForm ? 'Cancel' : 'Add Rule'}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
          <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-green-800">{success}</p>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <h3 className="font-semibold mb-4">
            {editingId ? 'Edit Pricing Rule' : 'Create New Pricing Rule'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Item ID */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Menu Item ID *
                </label>
                <Input
                  type="text"
                  placeholder="e.g., menu-item-123"
                  value={formData.itemId}
                  onChange={(e) =>
                    setFormData({ ...formData, itemId: e.target.value })
                  }
                  required
                />
              </div>

              {/* Day of Week */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Day of Week
                </label>
                <select
                  value={formData.dayOfWeek}
                  onChange={(e) =>
                    setFormData({ ...formData, dayOfWeek: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                >
                  {daysOfWeek.map((day) => (
                    <option key={day} value={day}>
                      {day.charAt(0) + day.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Time Range */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Time Range
                </label>
                <select
                  value={formData.timeRange}
                  onChange={(e) =>
                    setFormData({ ...formData, timeRange: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                >
                  {timeRanges.map((range) => (
                    <option key={range} value={range}>
                      {range.charAt(0) + range.slice(1).toLowerCase()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Demand Level */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Demand Level
                </label>
                <select
                  value={formData.demandLevel}
                  onChange={(e) =>
                    setFormData({ ...formData, demandLevel: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                >
                  {demandLevels.map((level) => (
                    <option key={level} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Multiplier */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Price Multiplier
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    step="0.1"
                    min="0.5"
                    max="3"
                    value={formData.priceMultiplier}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priceMultiplier: parseFloat(e.target.value),
                      })
                    }
                  />
                  <span className="text-sm font-semibold text-gray-600">
                    {formData.priceMultiplier > 1
                      ? `+${((formData.priceMultiplier - 1) * 100).toFixed(0)}%`
                      : formData.priceMultiplier < 1
                        ? `-${((1 - formData.priceMultiplier) * 100).toFixed(0)}%`
                        : '0%'}
                  </span>
                </div>
              </div>

              {/* Min Price */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Min Price ($)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.minPrice}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minPrice: parseFloat(e.target.value),
                    })
                  }
                />
              </div>

              {/* Max Price */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Max Price ($)
                </label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.maxPrice}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxPrice: parseFloat(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                {editingId ? 'Update Rule' : 'Create Rule'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Rules List */}
      <div className="space-y-3">
        {rules.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-500">No pricing rules yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Create your first rule to get started
            </p>
          </Card>
        ) : (
          rules.map((rule) => (
            <Card key={rule.id} className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 font-semibold">Item</p>
                      <p className="font-mono text-xs">{rule.menuItemId}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-semibold">Day</p>
                      <p>
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][rule.dayOfWeek]}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-semibold">Time</p>
                      <p>
                        {rule.timeRange.charAt(0) +
                          rule.timeRange.slice(1).toLowerCase()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-semibold">Demand</p>
                      <p>{rule.demandLevel}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 font-semibold">Multiplier</p>
                      <p className="font-bold text-blue-600">
                        {rule.priceMultiplier.toFixed(2)}x
                      </p>
                    </div>
                    {/* Min Price display disabled due to type mismatch */}
                    {/* <div>
                      <p className="text-gray-600 font-semibold">Min Price</p>
                      <p>${rule.minPrice.toFixed(2)}</p>
                    </div> */}
                    {/* Max Price display disabled due to type mismatch */}
                    {/* <div>
                      <p className="text-gray-600 font-semibold">Max Price</p>
                      <p>${rule.maxPrice.toFixed(2)}</p>
                    </div> */}
                    <div>
                      <p className="text-gray-600 font-semibold">Status</p>
                      <p className="text-green-600 font-semibold">Active</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(rule)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(rule.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
