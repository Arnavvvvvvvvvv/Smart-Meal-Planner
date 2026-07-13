import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, X, Check, Trash2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import api from '../services/api.js'

const CATEGORIES = ['Vegetables', 'Fruits', 'Dairy', 'Meat', 'Beverages', 'Pantry', 'Grains', 'Spices', 'Other'];
const commonItems = [
  // Dairy
  { ingredient_name: "Milk", quantity: 1, unit: "l", category: "Dairy" },
  { ingredient_name: "Paneer", quantity: 250, unit: "g", category: "Dairy" },
  { ingredient_name: "Cheese", quantity: 200, unit: "g", category: "Dairy" },
  { ingredient_name: "Butter", quantity: 100, unit: "g", category: "Dairy" },
  { ingredient_name: "Curd", quantity: 500, unit: "g", category: "Dairy" },
  { ingredient_name: "Eggs", quantity: 12, unit: "pieces", category: "Dairy" },

  // Vegetables
  { ingredient_name: "Onion", quantity: 1, unit: "kg", category: "Vegetables" },
  { ingredient_name: "Tomato", quantity: 1, unit: "kg", category: "Vegetables" },
  { ingredient_name: "Potato", quantity: 1, unit: "kg", category: "Vegetables" },
  { ingredient_name: "Garlic", quantity: 250, unit: "g", category: "Vegetables" },
  { ingredient_name: "Ginger", quantity: 250, unit: "g", category: "Vegetables" },

  // Fruits
  { ingredient_name: "Apple", quantity: 1, unit: "kg", category: "Fruits" },
  { ingredient_name: "Banana", quantity: 12, unit: "pieces", category: "Fruits" },
  { ingredient_name: "Orange", quantity: 1, unit: "kg", category: "Fruits" },

  // Meat
  { ingredient_name: "Chicken", quantity: 1, unit: "kg", category: "Meat" },
  { ingredient_name: "Fish", quantity: 500, unit: "g", category: "Meat" },

  // Beverages
  { ingredient_name: "Tea", quantity: 250, unit: "g", category: "Beverages" },
  { ingredient_name: "Coffee", quantity: 200, unit: "g", category: "Beverages" },

  // Pantry
  { ingredient_name: "Sugar", quantity: 1, unit: "kg", category: "Pantry" },
  { ingredient_name: "Salt", quantity: 1, unit: "kg", category: "Pantry" },
  { ingredient_name: "Cooking Oil", quantity: 1, unit: "l", category: "Pantry" },

  // Grains
  { ingredient_name: "Rice", quantity: 1, unit: "kg", category: "Grains" },
  { ingredient_name: "Wheat Flour", quantity: 5, unit: "kg", category: "Grains" },
  { ingredient_name: "Bread", quantity: 1, unit: "p", category: "Grains" },

  // Spices
  { ingredient_name: "Turmeric Powder", quantity: 100, unit: "g", category: "Spices" },
  { ingredient_name: "Red Chilli Powder", quantity: 100, unit: "g", category: "Spices" },
  { ingredient_name: "Garam Masala", quantity: 100, unit: "g", category: "Spices" },
  { ingredient_name: "Black Pepper", quantity: 100, unit: "g", category: "Spices" }
];

const ShoppingList = () => {
    const [items, setItems] = useState([]);
    const [groupedItems, setGroupedItems] = useState({});
    const [showAddModal, setShowAddModal] = useState(false);
    const [showQuickAddDropdown, setShowQuickAddDropdown] = useState(false);
    const [loading, setLoading]= useState(true);

    useEffect(() => {
        fetchShoppingList();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            const dropdown = document.getElementById('quick-add-dropdown');
            const button = document.getElementById('quick-add-button');
            if (!dropdown || !button) return;
            if (dropdown.contains(event.target) || button.contains(event.target)) return;
            setShowQuickAddDropdown(false);
        };

        if (showQuickAddDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showQuickAddDropdown]);

    const fetchShoppingList = async () => {
    try {
        const response = await api.get('/shopping?grouped=true');
        const grouped = response.data.data.items;

        const flatItems = [];
        grouped.forEach((group) => {
            group.items.forEach((item) => {
                flatItems.push({
                    ...item,
                    category: group.category
                });
            });
        });

        setItems(flatItems);
        organizeByCategory(flatItems);

    } catch (error) {
        toast.error('Failed to load shopping list');

    } finally {
        setLoading(false);
    }
};

const handleQuickAdd = async (item) => {
  try {

    const response = await api.post('/shopping', item);

    const newItem = response.data.data.item;

    const updatedItems = [...items, newItem];

    setItems(updatedItems);

    organizeByCategory(updatedItems);

    toast.success(`${item.ingredient_name} added`);

  } catch (error) {
    toast.error('Failed to add item');
  }
};

    const organizeByCategory = (itemsList) => {
        const grouped = {};
        itemsList.forEach(item => {
            const category = item.category || 'Other';
            if (!grouped[category]) {
                grouped[category] = [];
            }
            grouped[category].push(item);
        });
        setGroupedItems(grouped);
    };

    const handleToggleChecked = async (id) => {
    try {
        await api.put(`/shopping/${id}/toggle`);

        const updatedItems = items.map((item) =>item.id === id? { ...item, is_checked: !item.is_checked }: item);

        setItems(updatedItems);
        organizeByCategory(updatedItems);

    } catch (error) {
        toast.error('Failed to update item');
    }
};

    const handleDeleteItem = async(id) => {
        try {
        await api.delete(`/shopping/${id}`);
        const updatedItems = items.filter(
            (item) => item.id !== id
        );

        setItems(updatedItems);
        organizeByCategory(updatedItems);
        toast.success('Item removed');
    } catch (error) {
        toast.success('Item removed. Refresh');
    }
    };

    const handleClearChecked = async () => {
        if (!confirm('Remove all checked items?')) return;
        try{
            await api.delete(`/shopping/clear/checked`);
            const updatedItems = items.filter(item => !item.is_checked);
            setItems(updatedItems);
            organizeByCategory(updatedItems);
            toast.success('Checked items cleared');
        } catch(error){
            toast.error('Failed to clear checked items');
        }
        
    };

    const handleAddToPantry = async() => {
        const checkedCount = items.filter(item => item.is_checked).length;
        if (checkedCount === 0) {
            toast.error('No items checked');
            return;
        }

        if (!confirm(`Add ${checkedCount} checked items to pantry?`)) return;

        try {
        await api.post('/shopping/add-to-pantry');
        const updatedItems = items.filter(
            (item) => !item.is_checked
        );

        setItems(updatedItems);
        organizeByCategory(updatedItems);
        toast.success('Items added to pantry');
        } catch (error) {
            toast.error('Failed to add items to pantry');
        }
    };

     if (loading) {
            return (
                <div className="min-h-screen bg-gray-50">
                    <Navbar />

                    <div className="flex items-center justify-center h-96">
                        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                </div>
            );
        }

    const checkedCount = items.filter(item => item.is_checked).length;
    const totalCount = items.length;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Shopping List</h1>
                    <p className="text-gray-600 mt-1">
                        {totalCount > 0 ? `${checkedCount} of ${totalCount} items checked` : 'Your shopping list is empty'}
                    </p>
                </div>


                <div className="mb-6 flex flex-wrap items-start gap-3 sm:items-center">
                    <div className="relative">
                        <button
                            id="quick-add-button"
                            type="button"
                            onClick={() => setShowQuickAddDropdown((prev) => !prev)}
                            className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Quick Add
                        </button>

                        {showQuickAddDropdown && (
                            <div
                                id="quick-add-dropdown"
                                className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden"
                            >
                                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                                    <p className="text-sm font-semibold text-gray-900">Quick add essentials</p>
                                    <p className="text-xs text-gray-500">Add frequently purchased items in one click.</p>
                                </div>
                                <div className="max-h-72 overflow-y-auto">
                                    {commonItems.map((item) => (
                                        <button
                                            key={item.ingredient_name}
                                            onClick={() => {
                                                handleQuickAdd(item);
                                                setShowQuickAddDropdown(false);
                                            }}
                                            className="w-full text-left px-4 py-3 hover:bg-emerald-50 transition-colors border-b last:border-b-0"
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium text-gray-900">{item.ingredient_name}</span>
                                                <span className="text-xs text-gray-500">{item.quantity} {item.unit}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">{item.category}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {totalCount > 0 && (
                        <>
                        <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Add Item
                    </button>
                            <button
                                onClick={handleAddToPantry}
                                className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
                            >
                                <ShoppingCart className="w-5 h-5" />
                                Add to Pantry ({totalCount})
                            </button>
                            <button
                                onClick={handleClearChecked}
                                className="flex items-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2.5 rounded-lg font-medium transition-colors"
                            >
                                <Trash2 className="w-5 h-5" />
                                Clear Checked
                            </button>
                        </>
                    )}
                </div>


                {totalCount > 0 ? (
                    <div className="space-y-6">
                        {Object.entries(groupedItems).map(([category, categoryItems]) => (
                            <div key={category} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                                <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
                                    <h2 className="font-semibold text-gray-900">{category}</h2>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {categoryItems.map(item => (
                                        <ShoppingListItem
                                            key={item.id}
                                            item={item}
                                            onToggle={handleToggleChecked}
                                            onDelete={handleDeleteItem}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                        <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 mb-4">Your shopping list is empty</p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Add First Item
                        </button>
                    </div>
                )}
            </div>

            
            {showAddModal && (
                <AddItemModal
                    onClose={() => setShowAddModal(false)}
                    onSuccess={(newItem) => {
                        const updatedItems = [...items, newItem];
                        setItems(updatedItems);
                        organizeByCategory(updatedItems);
                        setShowAddModal(false);
                    }}
                />
            )}
        </div>
    );
};

const ShoppingListItem = ({ item, onToggle, onDelete }) => {
    return (
        <div className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors group">
            <button
                onClick={() => onToggle(item.id)}
                className="shrink-0"
            >
                <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${item.is_checked
                    ? 'bg-emerald-500 border-emerald-500'
                    : 'border-gray-300 hover:border-emerald-500'
                    }`}>
                    {item.is_checked && <Check className="w-4 h-4 text-white" />}
                </div>
            </button>

            <div className="flex-1 min-w-0">
                <p className={`font-medium ${item.is_checked ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                    {item.ingredient_name}
                </p>
                <p className={`text-sm ${item.is_checked ? 'text-gray-400' : 'text-gray-600'}`}>
                    {item.quantity} {item.unit}
                    {item.from_meal_plan && (
                        <span className="ml-2 text-xs text-emerald-600">• From meal plan</span>
                    )}
                </p>
            </div>

            <button
                onClick={() => onDelete(item.id)}
                className="shrink-0 p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
            >
                <X className="w-5 h-5" />
            </button>
        </div>
    );
};

const AddItemModal = ({ onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        ingredient_name: '',
        quantity: '',
        unit: 'pieces',
        category: 'Other'
    });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async(e) => {
        e.preventDefault();

        try {
        const res= await api.post('/shopping', {
            ...formData, quantity: parseFloat(formData.quantity)
        });

        toast.success('Item added to shopping list');
        onSuccess(res.data.data.item);
        onClose();
        } catch (error) {
            toast.error('Failed to add item');

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Add Item</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Item Name</label>
                        <input
                            type="text"
                            value={formData.ingredient_name}
                            onChange={(e) => setFormData({ ...formData, ingredient_name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                            <select
                                value={formData.unit}
                                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                            >
                                <option value="pieces">Pieces</option>
                                <option value="kg">Kilograms</option>
                                <option value="g">Grams</option>
                                <option value="p">Pack</option>
                                <option value="l">Liters</option>
                                <option value="ml">Milliliters</option>
                                <option value="cups">Cups</option>
                                <option value="tbsp">Tablespoons</option>
                                <option value="tsp">Teaspoons</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                        <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
                        >
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Adding...' : 'Add Item'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ShoppingList;
