import { useState, useEffect} from "react"
import { User, Image } from "lucide-react"

const ProfileModal = ({setShowProfileModal, profileModalRef}) => {
  const [activeTab, setActiveTab] = useState("overview")

  const images = [
    "https://picsum.photos/id/1018/150/150",
    "https://picsum.photos/id/1015/150/150",
    "https://picsum.photos/id/1019/150/150",
    "https://picsum.photos/id/1016/150/150",
    "https://picsum.photos/id/1020/150/150",
    "https://picsum.photos/id/1021/150/150",
    "https://picsum.photos/id/1022/150/150",
    "https://picsum.photos/id/1023/150/150",
    "https://picsum.photos/id/1023/150/150",
    "https://picsum.photos/id/1023/150/150",
    "https://picsum.photos/id/1023/150/150",
    "https://picsum.photos/id/1023/150/150",

  ];


  return (
    <div className="absolute z-20 w-[360px] h-[500px] bg-white rounded-lg shadow-lg flex overflow-hidden"  onClick={(e) => e.stopPropagation()} ref={profileModalRef}>
      {/* Sidebar */}
      <div className="w-[100px] bg-gray-100 p-2 flex flex-col">
        <button
          className={`w-full text-center mb-2 p-2 rounded flex flex-col items-center justify-center ${
            activeTab === "overview" ? "bg-blue-500 text-white" : "hover:bg-gray-200"
          }`}
          onClick={() => setActiveTab("overview")}
        >
          <User className="mb-1" size={24} />
          <span className="text-xs">Overview</span>
        </button>
        <button
          className={`w-full text-center p-2 rounded flex flex-col items-center justify-center ${
            activeTab === "files" ? "bg-blue-500 text-white" : "hover:bg-gray-200"
          }`}
          onClick={() => setActiveTab("files")}
        >
          <Image className="mb-1" size={24} />
          <span className="text-xs">Files</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-4 overflow-y-auto">
        {activeTab === "overview" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">John Doe</h2>
            <p className="mb-2">+1 (123) 456-7890</p>
            <p className="mb-2">john.doe@example.com</p>
            <p>Status: Available</p>
          </div>
        )}
        {activeTab === "files" && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Shared Files</h2>
            <div className="grid grid-cols-2 gap-2 h-full">
              {images.map((image, index) => (
                <div key={index} className="aspect-square">
                  <img
                    src={image || "/placeholder.svg"}
                    alt={`Shared file ${index + 1}`}
                    className="w-full h-full object-cover rounded"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProfileModal;

