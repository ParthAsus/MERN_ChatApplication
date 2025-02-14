import React, { useEffect, useState } from 'react'
import { useChatStore } from '../store/useChatStore'
import { Users } from 'lucide-react';
import SidebarSkeleton from './skeletons/SidebarSkeleton';
import { useAuthStore } from '../store/useAuthStore';

const Sidebar = () => {

  const { users, isUsersLoading, selectedUser, getUsers, setSelectedUser, searchUserThroughPhoneNumber, searchedUser } = useChatStore();
  const { onlineUsers, addContactInUser } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [phone, setPhone] = useState('');

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  function handleSearchUser(e) {
    console.log(phone);
    searchUserThroughPhoneNumber(phone);
    setPhone("");
  }

  function handleAddContact(userId){
    if(!userId) return;
    addContactInUser(userId);
    setIsModalOpen(false);
  }

  if (isUsersLoading) return <SidebarSkeleton />
  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>

        {/* TODO: Online filter toggle */}

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-500 text-white p-2 rounded-md mx-4 my-3"
        >
          + Add Member
        </button>

      </div>

      <div className="overflow-y-auto w-full py-3">
        {users.contacts?.map((user) => (
          <button
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={`
              w-full p-3 flex items-center gap-3
              hover:bg-base-300 transition-colors
              ${selectedUser?._id === user._id ? "bg-base-300 ring-1 ring-base-300" : ""}
            `}
          >
            <div className="relative mx-auto lg:mx-0">
              <img
                src={user.profilePic || "/avatar.jpg"}
                alt={user.name}
                className="size-12 object-cover rounded-full"
              />
              {onlineUsers.includes(user._id) && (
                <span
                  className="absolute bottom-0 right-0 size-3 bg-green-500 
                  rounded-full ring-2 ring-zinc-900"
                />
              )}
            </div>

            {/* User info - only visible on larger screens */}
            <div className="hidden lg:block text-left min-w-0">
              <div className="font-medium truncate">{user.fullName}</div>
              <div className="text-sm text-zinc-400">
                {onlineUsers.includes(user._id) ? "Online" : "Offline"}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Modal for Adding Users */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-md w-96">
            <h2 className="text-xl font-semibold mb-4">Add Member</h2>
            <input
              type="text"
              placeholder="Enter phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full border p-2 rounded-md"
            />
            <button onClick={handleSearchUser} className="bg-blue-500 text-white p-2 rounded-md mt-3 w-full">
              Search
            </button>

            {isUsersLoading && <p className="text-center mt-3">Searching...</p>}

            {searchedUser && (
              <div className="mt-4 flex items-center gap-3">
                <img src={searchedUser.profilePic || "/avatar.jpg"} alt={searchedUser.fullName} className="size-12 rounded-full" />
                <div>
                  <p className="font-medium">{searchedUser.fullName}</p>
                  <button onClick={() => handleAddContact(searchedUser._id)} className="bg-green-500 text-white p-2 rounded-md mt-2">
                    Add Contact
                  </button>
                </div>
              </div>
            )}

            {!searchedUser && <p className="text-center mt-3 text-red-500">User not found</p>}

            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 mt-4 w-full">
              Close
            </button>
          </div>
        </div>
      )}

    </aside>
  )
}

export default Sidebar
