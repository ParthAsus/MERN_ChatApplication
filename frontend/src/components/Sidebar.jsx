import React, { useEffect, useState } from 'react'
import { useChatStore } from '../store/useChatStore'
import { ArrowLeft, NotebookPen, Search, Users } from 'lucide-react';
import SidebarSkeleton from './skeletons/SidebarSkeleton';
import { useAuthStore } from '../store/useAuthStore';
import AddUserModel from './AddUserModel';

const Sidebar = () => {

  const { users, isUsersLoading, selectedUser, getUsers, setSelectedUser, searchUserThroughPhoneNumber, searchedUser, groups, isGroupsLoading, getGroups, createGroup } = useChatStore();
  const { onlineUsers, addContactInUser, authUser } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [isGroupMode, setIsGroupMode] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [selectedUserNames, setSelectedUserNames] = useState([]);

  const [groupName, setGroupName] = useState('');
  const [groupImage, setGroupImage] = useState('');

  useEffect(() => {
    getUsers();
    getGroups()
  }, [getUsers, getGroups]);

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
    if (selectedUserIds.includes(user._id)) {
      // Remove user ID from selectedUserIds and name from selectedUserNames
      setSelectedUserIds(selectedUserIds.filter((id) => id !== user._id));
      setSelectedUserNames(selectedUserNames.filter((name) => name !== user.fullName));
    } else {
      // Add user ID to selectedUserIds and name to selectedUserNames
      setSelectedUserIds([...selectedUserIds, user._id]);
      setSelectedUserNames([...selectedUserNames, user.fullName]);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async () => {
      const base64Image = reader.result;
      setGroupImage(base64Image);
    };
  }

  const handleCreateGroup = (e) => {
    if (!groupImage || !groupName) return;
    createGroup({
      groupName,
      groupProfilePic: groupImage,
      membersId: selectedUserIds,
    });
  }

  if (isUsersLoading) return <SidebarSkeleton />
  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-5">
        <div className="flex items-center gap-2">
          <Users className="size-6" />
          <span className="font-medium hidden lg:block">Contacts</span>
        </div>


        <button
          onClick={() => setIsModalOpen(true)}
          className=" p-2 rounded-md mx-4 my-3 relative"
        >
          <NotebookPen />
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

        {groups && groups.map((group) => (
          <button
            key={group._id}
            onClick={() => setSelectedUser(group)}
            className={`
              w-full p-3 flex items-center gap-3
              hover:bg-base-300 transition-colors
              ${selectedUser?._id === group._id ? "bg-base-300 ring-1 ring-base-300" : ""}
            `}
          >
            <div className="relative mx-auto lg:mx-0">
              <img
                src={group.profilePic || "/avatar.jpg"}
                alt={group.groupName}
                className="size-12 object-cover rounded-full"
              />
              {onlineUsers.includes(group._id) && (
                <span
                  className="absolute bottom-0 right-0 size-3 bg-green-500 
                  rounded-full ring-2 ring-zinc-900"
                />
              )}
            </div>

            {/* User info - only visible on larger screens */}
            <div className="hidden lg:block text-left min-w-0">
              <div className="font-medium truncate">{group.groupName}</div>
              <div className="text-sm text-zinc-400">
                {onlineUsers.includes(group._id) ? "Online" : "Offline"}
              </div>
            </div>
          </button>
        ))}
      </div>


      {/* {isModalOpen && (
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
      )} */}

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-20">
          <div className="bg-neutral p-6 rounded-md w-96">
            <h2 className="text-xl font-semibold mb-4">
              {isGroupMode && (
                <button
                  onClick={() => {
                    setIsGroupMode(false);
                    setPhone("");
                    setSelectedUsers([]);
                  }}
                  className="mr-2"
                >
                  <ArrowLeft />
                </button>
              )}
              {isGroupMode ? "Create New Group" : "New Chat"}
            </h2>

            {isGroupMode && selectedUserNames.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-2">
                {selectedUserNames.map((name, index) => (
                  <span key={index} className="bg-blue-500 text-white px-2 py-1 rounded-full text-sm">{name}</span>
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
            <button onClick={handleSearchUser} className="bg-primary text-neutral p-2 rounded-md mt-3 w-full hover:opacity-70">
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
                      checked={selectedUserIds.includes(searchedUser._id)} // Check based on _id
                      onChange={() => handleSelectUser(searchedUser)} // Pass the user object containing _id
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
              <>
                <input
                  type="text"
                  placeholder="Group Name"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full border p-2 rounded-md bg-neutral mt-3"
                />
                <input
                  type="file"
                  onChange={handleImageUpload}
                  className="w-full border p-2 rounded-md bg-neutral mt-3"
                />
                <button
                  onClick={() => handleCreateGroup()}
                  disabled={selectedUserNames.length < 3 || !groupName || !groupImage}
                  className={`w-full mt-3 py-2 rounded-md text-white ${selectedUserNames.length < 3 || !groupName || !groupImage ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
                >
                  Create Group
                </button>
              </>
            )}

            <button onClick={() => setIsModalOpen(false)} className="bg-secondary text-neutral hover:opacity-70 mt-4 text-center py-2 w-full rounded-md">
              Close
            </button>
          </div>
        </div>
      )}


    </aside>
  )
}

export default Sidebar
