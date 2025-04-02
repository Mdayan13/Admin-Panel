import React, { useState, useEffect } from 'react';

// Import services
import { getUsers, updateUserBalance, deleteUser } from '../../services/adminServices';

// Import components
import Layout from '../../components/layout/Layout';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Alert from '../../components/common/Alert';
import Modal from '../../components/common/Modal';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [balanceAmount, setBalanceAmount] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  
  useEffect(() => {
    fetchUsers();
  }, []);
  
  useEffect(() => {
    if (searchTerm) {
      setFilteredUsers(
        users.filter(user => 
          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (user.telegramUsername && user.telegramUsername.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      );
    } else {
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const userData = await getUsers();
      setUsers(userData);
      setFilteredUsers(userData);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch users');
      setLoading(false);
    }
  };
  
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setBalanceAmount('');
    setShowEditModal(true);
  };
  
  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };
  
  const handleUpdateBalance = async () => {
    if (!balanceAmount || isNaN(Number(balanceAmount))) {
      setError('Please enter a valid balance amount');
      return;
    }
    
    try {
      await updateUserBalance(selectedUser._id, Number(balanceAmount));
      // Update local state
      const updatedUsers = users.map(user => {
        if (user._id === selectedUser._id) {
          return {
            ...user,
            balance: Number(balanceAmount)
          };
        }
        return user;
      });
      
      setUsers(updatedUsers);
      setShowEditModal(false);
      setSelectedUser(null);
      setBalanceAmount('');
    } catch (err) {
      setError('Failed to update user balance');
    }
  };
  
  const handleConfirmDelete = async () => {
    try {
      await deleteUser(selectedUser._id);
      // Remove from local state
      const updatedUsers = users.filter(user => user._id !== selectedUser._id);
      setUsers(updatedUsers);
      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (err) {
      setError('Failed to delete user');
    }
  };
  
  // Get current users for pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  
  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">User Management</h1>
        
        {error && <Alert type="error" message={error} className="mb-4" />}
        
        <div className="mb-6 flex flex-col md:flex-row justify-between items-center">
          <div className="w-full md:w-1/3 mb-4 md:mb-0">
            <Input
              type="text"
              placeholder="Search by username, email, or telegram"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex space-x-2">
            <Button
              variant="secondary"
              onClick={fetchUsers}
            >
              Refresh
            </Button>
          </div>
        </div>
        
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telegram</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Keys Generated</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentUsers.map((user) => (
                <tr key={user._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.telegramUsername || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{user.balance.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.keysGenerated || 0}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleEditUser(user)}
                      >
                        Edit Balance
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteUser(user)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {currentUsers.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {filteredUsers.length > usersPerPage && (
          <div className="flex justify-center mt-6">
            <nav>
              <ul className="flex space-x-2">
                {Array.from({ length: Math.ceil(filteredUsers.length / usersPerPage) }, (_, i) => (
                  <li key={i}>
                    <Button
                      variant={currentPage === i + 1 ? "primary" : "secondary"}
                      size="sm"
                      onClick={() => paginate(i + 1)}
                    >
                      {i + 1}
                    </Button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        )}
        
        {/* Edit User Modal */}
        {showEditModal && selectedUser && (
          <Modal
            title={`Edit Balance for ${selectedUser.username}`}
            onClose={() => setShowEditModal(false)}
          >
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Balance
              </label>
              <p>₹{selectedUser.balance.toLocaleString()}</p>
            </div>
            
            <div className="mb-4">
              <Input
                label="New Balance Amount"
                type="number"
                value={balanceAmount}
                onChange={(e) => setBalanceAmount(e.target.value)}
                placeholder="Enter new balance amount"
              />
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="secondary"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleUpdateBalance}
              >
                Update Balance
              </Button>
            </div>
          </Modal>
        )}
        
        {/* Delete User Modal */}
        {showDeleteModal && selectedUser && (
          <Modal
            title="Confirm Deletion"
            onClose={() => setShowDeleteModal(false)}
          >
            <p className="mb-4">
              Are you sure you want to delete user <span className="font-bold">{selectedUser.username}</span>? 
              This action cannot be undone.
            </p>
            
            <div className="flex justify-end space-x-2">
              <Button
                variant="secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmDelete}
              >
                Delete User
              </Button>
            </div>
          </Modal>
        )}
      </div>
    </Layout>
  );
};

export default UserManagement;