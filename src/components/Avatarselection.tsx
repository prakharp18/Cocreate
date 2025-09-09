import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../store/userStore";

const avatars = [
  "https://api.dicebear.com/9.x/micah/svg?seed=Adrian",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Oliver",
  "https://api.dicebear.com/9.x/adventurer/svg?seed=Maria",
  "https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=Liam",
  "https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=Oliver",
  "https://api.dicebear.com/9.x/adventurer-neutral/svg?seed=Adrian",
  "https://api.dicebear.com/9.x/big-ears-neutral/svg?seed=Liam",
];

const AvatarSelection = () => {
  const navigate = useNavigate();
  const setAvatar = useUserStore((state) => state.setAvatar);
  const name = useUserStore((state) => state.name);

  const [selected, setSelected] = useState(avatars[0]);

  const handleContinue = () => {
    setAvatar(selected);
    navigate('/uuid'); 
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6">Select Your Avatar</h1>
      <p className="mb-4 text-lg">Hello, {name || "User"}!</p>
      <div className="flex gap-4 flex-wrap justify-center mb-6">
        {avatars.map((avatar) => (
          <img
            key={avatar}
            src={avatar}
            alt="avatar"
            className={`w-16 h-16 rounded-full cursor-pointer border-4 ${
              selected === avatar ? "border-blue-500" : "border-transparent"
            }`}
            onClick={() => setSelected(avatar)}
          />
        ))}
      </div>
      <div className="flex flex-col items-center mb-6">
        <p className="mb-2 text-lg font-medium">{name}</p>
        <img src={selected} alt="Selected Avatar" className="w-24 h-24 rounded-full border-2 border-gray-400" />
      </div>
      <button
        onClick={handleContinue}
        className="px-6 py-3 rounded bg-blue-500 hover:bg-blue-600 text-white font-semibold"
      >
        Continue
      </button>
    </div>
  );
};

export default AvatarSelection;
