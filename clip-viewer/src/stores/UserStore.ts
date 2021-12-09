import create from 'zustand';

const useUserStore = create((set) => ({
    currentUser: {},
    setCurrentUser: (user: any) => set({ currentUser: user }),
}));

export default useUserStore;
