import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../store/userStore";

const Intropage = () => {
  const navigate = useNavigate();
  const setName = useUserStore((state) => state.setName);
  const [localName, setLocalName] = useState("");

  const handleContinue = () => {
    if (!localName.trim()) return;
    setName(localName);
    navigate('/avatar'); 
  };
  

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Enter Your Name</h1>
      <input
        type="text"
        value={localName}
        onChange={(e) => setLocalName(e.target.value)}
        placeholder="Your Name"
        className="mb-6 p-3 rounded border w-64 text-lg"
      />
      <button
        onClick={handleContinue}
        disabled={!localName.trim()}
        className={`px-6 py-3 rounded text-white font-semibold ${
          localName.trim() ? "bg-blue-500 hover:bg-blue-600" : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        Continue
      </button>
    </div>
  );
};

export default Intropage;
