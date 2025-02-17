import { ArrowLeft, Users } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';

const AddUserModel = ({ isModalOpen, setIsModalOpen }) => {
  const {
    searchUserThroughPhoneNumber,
    searchedUser,
    isUsersLoading
  } = useChatStore();
  const { addContactInUser } = useAuthStore();

  const [phone, setPhone] = useState('');
  const [isGroupMode, setIsGroupMode] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);

  function handleSearchUser(e) {
    console.log(phone);
    searchUserThroughPhoneNumber(phone);
    setPhone("");
  }

  function handleAddContact(userId) {
    if (!userId) return;
    addContactInUser(userId);
    setIsModalOpen(false);
  }

  const handleSelectUser = (user) => {
    if (selectedUsers.includes(user.fullName)) {
      setSelectedUsers(selectedUsers.filter((name) => name !== user.fullName));
    } else {
      setSelectedUsers([...selectedUsers, user.fullName]);
    }
  };  
  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-20">
        <div className="bg-neutral p-6 rounded-md w-96">
          <h2 className="text-xl font-semibold mb-4">
            {isGroupMode && (
              <button onClick={() => { setIsGroupMode(false); setPhone(""); setSelectedUsers([]); }} className="mr-2">
                <ArrowLeft />
              </button>
            )}
            {isGroupMode ? "Create New Group" : "New Chat"}
          </h2>

          {isGroupMode && selectedUsers.length > 0 && (
            <div className="flex gap-2 flex-wrap mb-2">
              {selectedUsers.map((user, index) => (
                <span key={index} className="bg-blue-500 text-white px-2 py-1 rounded-full text-sm">{user}</span>
              ))}
            </div>
          )}


          <input
            type="text"
            placeholder="Enter phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full border p-2 rounded-md bg-neutral"
          />
          <button onClick={handleSearchUser} className=" bg-primary text-neutral p-2 rounded-md mt-3 w-full hover:opacity-70">
            Search
          </button>

          {isUsersLoading && <p className="text-center mt-3">Searching...</p>}

          {searchedUser && (
            <div className="mt-4 flex items-center gap-3">
              <img src={searchedUser.profilePic || "/avatar.jpg"} alt={searchedUser.fullName} className="size-12 rounded-full" />
              <div>
                <p className="font-medium">{searchedUser.fullName}</p>
                {isGroupMode ? (
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(searchedUser.fullName)}
                    onChange={() => handleSelectUser(searchedUser)}
                  />
                ) : (
                  <button onClick={() => handleAddContact(searchedUser._id)} className="bg-green-500 text-white p-2 rounded-md mt-2">
                    Add Contact
                  </button>
                )}
              </div>
            </div>
          )}

          {!searchedUser && <p className="text-center mt-3 ">Add now to chat with your friends...</p>}

          {!isGroupMode ? (
            <button onClick={() => { setIsGroupMode(true); setPhone(""); }} className="w-full flex items-center gap-2 p-2 mt-3 text-gray-700 hover:bg-gray-100 rounded-md">
              <Users size={18} />
              New Group
            </button>
          ) : (
            <button
              onClick={() => isModalOpen(true)}
              disabled={selectedUsers.length < 3}
              className={`w-full mt-3 py-2 rounded-md text-white ${selectedUsers.length < 3 ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
            >
              Create Group
            </button>
          )}

          <button onClick={() => setIsModalOpen(false)} className="bg-secondary text-neutral hover:opacity-70 mt-4 text-center py-2  w-full rounded-md">
            Close
          </button>
        </div>
      </div>
    </>
  );
};

export default AddUserModel;
