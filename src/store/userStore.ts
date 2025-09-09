import { create } from "zustand";

interface UserProfile {
  name: string;
  avatar: string;
  setName: (name: string) => void;
  setAvatar: (avatar: string) => void;
}

export const useUserStore = create<UserProfile>((set) => ({
  name: "",
  avatar: "",
  setName: (name) => set({ name }),
  setAvatar: (avatar) => set({ avatar }),
}));
