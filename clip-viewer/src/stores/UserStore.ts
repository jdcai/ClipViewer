import create from 'zustand';

const useUserStore = create((set) => ({
    currentUser: null,
    userFollows: [],
    setCurrentUser: (user: any) => set({ currentUser: user }),
    setUserFollows: (follows: any[]) => set({ userFollows: follows }),
}));

export default useUserStore;
