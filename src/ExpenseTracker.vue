<script setup>
import { ref, computed } from 'vue';
import { collection, addDoc, query, orderBy, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import db from './firebase/config'; 

const amountInput = ref('');
const editingIndex = ref(null);
const expenses = ref([]);
const newExpense = ref({
    item: '',
    category: '',
    amount: 0,
});

const fetchExpenses = async () => {
    const q = query(collection(db, 'expenses'), orderBy('dateTime', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        expenses.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    });
};

import { onMounted } from 'vue';
onMounted(fetchExpenses);

const addOrUpdateExpense = async () => {
    if (!newExpense.value.item || !newExpense.value.category || !amountInput.value) {
        alert('Incomplete Information, Please fill all fields');
        return;
    }
    if (isNaN(parseFloat(amountInput.value))) {
        return;
    }
    if (editingIndex.value === null) {
        await addExpense();
    } else {
        await updateExpense();
    }
};

const addExpense = async () => {
    const dateTime = new Date().toLocaleString();
    const expense = { ...newExpense.value, amount: parseFloat(amountInput.value), dateTime };

    try {
        const docRef = await addDoc(collection(db, 'expenses'), expense);
        console.log('Expense added with ID: ', docRef.id);
    } catch (error) {
        console.error('Error adding expense: ', error);
    }

    newExpense.value = {
        item: '',
        category: '',
        amount: 0,
    };
    amountInput.value = '';
};


const updateExpense = async () => {
    const expenseId = expenses.value[editingIndex.value].id;
    const expense = { ...newExpense.value, amount: parseFloat(amountInput.value) };

    try {
        await updateDoc(doc(db, 'expenses', expenseId), expense);
        console.log('Expense updated with ID: ', expenseId);
    } catch (error) {
        console.error('Error updating expense: ', error);
    }

    newExpense.value = {
        item: '',
        category: '',
        amount: 0,
    };
    amountInput.value = '';
    editingIndex.value = null;
};


const deleteExpense = async (id) => {
    try {
        await deleteDoc(doc(db, 'expenses', id));
        console.log('Expense deleted with ID: ', id);
    } catch (error) {
        console.error('Error deleting expense: ', error);
    }
};

const confirmDelete = (id) => {
    if (window.confirm('Make sure you are done paying this expense. if done confirm OK')) {
        deleteExpense(id);
    }
};


const editExpense = (index) => {
    if (editingIndex.value === index) {
        newExpense.value = {
            item: '',
            category: '',
            amount: 0,
        };
        amountInput.value = '';
        editingIndex.value = null;
    } else {
        const expense = expenses.value[index];
        newExpense.value = {
            item: expense.item,
            category: expense.category,
            amount: expense.amount,
        };
        amountInput.value = expense.amount;
        editingIndex.value = index;
    }
};

const totalExpenses = computed(() => {
    return expenses.value.reduce((total, expense) => total + parseFloat(expense.amount), 0);
});
</script>

<template>
  <div class="container mx-auto p-4 relative">
    <h1 class="text-3xl font-bold mb-6 text-center">Expense Tracker</h1>
    <div class="flex">
      <div class="w-1/3 pr-4">
        <h1 class="text-3xl font-bold mb-5 bg-gray-500 text-white text-center px-1 py-1">Add to list</h1>
        <div class="mb-4">
          <label class="block mb-1 text-center font-bold">Item:</label>
          <input type="text" v-model="newExpense.item" placeholder="Item name..." class="border rounded px-2 py-1 w-full shadow-lg">
        </div>
        <div class="mb-4">
          <label class="block mb-1 text-center font-bold">Category:</label>
          <select v-model="newExpense.category" class="border rounded px-2 py-1 w-full shadow-lg">
            <option value="" disabled selected>Select Item Category</option>
            <option value="transportation">Transportation</option>
            <option value="entertainment">Entertainment</option>
            <option value="clothes">Clothes</option>
            <option value="utilities">Utilities</option>
            <option value="electronics">Electronics</option>
            <option value="foods">Foods</option>
          </select>
        </div>
        <div class="mb-4">
          <label class="block mb-1 text-center font-bold">Amount:</label>
          <input type="number" v-model="amountInput" placeholder="₱ 0" class="border rounded px-2 py-1 w-full shadow-lg">
        </div>
        <div>
          <button @click="addOrUpdateExpense" class="bg-blue-500 mt-5 text-white px-4 py-2 rounded-full">{{ editingIndex === null ? 'Add' : 'Update' }}</button>
        </div>
      </div>
      <div class="w-2/3 relative">
        <table class="w-full border-collapse border border-gray-400 shadow-lg">
          <thead>
            <tr class="bg-gray-200">
              <th class="border bg-yellow-600 text-white px-4 py-2">Date & Time</th>
              <th class="border bg-yellow-600 text-white px-4 py-2">Item</th>
              <th class="border bg-yellow-600 text-white px-4 py-2">Category</th>
              <th class="border bg-yellow-600 text-white px-4 py-2">Amount</th>
              <th class="border bg-yellow-600 text-white px-4 py-2">Update/Delete</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(expense, index) in expenses" :key="index" class="bg-white">
              <td class="border px-4 py-2">{{ expense.dateTime }}</td>
              <td class="border px-4 py-2">{{ expense.item }}</td>
              <td class="border px-4 py-2">{{ expense.category }}</td>
              <td class="border px-4 py-2">₱{{ expense.amount }}</td>
              <td class="border px-4 py-2">
                <button @click="editExpense(index)" class="text-blue-500 mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="50" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16">
                          <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/>
                          <path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"/>
                        </svg>
                </button>
                <button @click="confirmDelete(expense.id)" class="text-red-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="50" height="16" fill="currentColor" class="bi bi-trash-fill" viewBox="0 0 16 16">
                          <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0"/>
                        </svg>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="w-1/2 flex justify-end">
      <div class="absolute bottom-50 right-5 bg-white border-t text-green-600 border-gray-300 px-4 py-2 font-bold shadow-lg">Total Expenses: ₱{{ totalExpenses }}</div>
    </div>
  </div>
</template>



  
