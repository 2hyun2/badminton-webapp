import { create } from 'zustand';
import axios from 'axios';

const HOST = "http://localhost:5000";

const useMatchStore = create((set, get) => ({
  // state
  userList: [],
  selectedPlayerIds: [],
  isLoading: false,

  // get
  getWaitingList: () => get().userList.filter(user => user.status === "대기중"),
  getRestingList: () => get().userList.filter(user => user.status === "휴식중"),
  getPlayingList: () => get().userList.filter(user => user.status === "경기중"),
  getWaitingCategory: () => {
    const waiting = get().userList.filter(u => u.status === "대기중");
    const groups = { "자유": [], "혼복": [], "남복": [], "여복": [] };

    waiting.forEach(user => {
      const pref = (user.preferredMatch === "" || user.preferredMatch === "자유")
        ? "자유"
        : user.preferredMatch;
      if (groups[pref]) groups[pref].push(user);
    });

    return groups;
  },

  // fetch // useEffect
  fetchUsers: async () => {
    set({ isLoading: true });
    try {
      const response = await axios.get(`${HOST}/api/users`);
      set({ userList: response.data });
    } catch (error) {
      console.error("store fetchUser error", error)
    } finally {
      set({ isLoading: false })
    }
  },

  // function 
  // userCard - Click => targerId.status - change
  toggleUserStatus: (targetId) => {
    const { userList } = get();
    const targetUser = userList.find(user => user.id === targetId);

    if (targetUser.status === "대기중") {
      const updated = userList.map(user => {
        // 그룹으로 묶인 user 존재시 같이 휴식중 변환
        if (user.id === targetId || targetUser.groupId && user.groupId === targetUser.groupId) {
          return { ...user, status: "휴식중", groupId: "" };
        }
        return user;
      });
      set({ userList: updated })
    }
  },
  // 경기 시작을 위한 경기 매칭열 유저 넣기
  togglePlayerSelection: (userId) => {
    const { selectedPlayerIds } = get(); // 초기 값 [] Array 불러옴
    if (selectedPlayerIds.includes(userId)) { // 중복 선택시 (토글)
      set({ selectedPlayerIds: selectedPlayerIds.filter(id => id !== userId) }); // selectedPlayerIds[] 에서 제거
    } else if (selectedPlayerIds.length < 4) { // [] 4명 이하일때만 적용 4초과시 조건문에 걸리는게 없어 작동 x
      set({ selectedPlayerIds: [...selectedPlayerIds, userId] });
    }
  },
  // 경기 시작
  startMatch: async (selectedIds = []) => {
    const { selectedPlayerIds } = get();
    const idsToUse = selectedIds.length ? selectedIds : selectedPlayerIds;
    if (idsToUse.length < 4) return false; // 매칭 리스트 인원수 4명 미만일시 false
    try {
      const response = await axios.post(`${HOST}/api/match/start`, {
        selectedIds: idsToUse
      }); // POST selectedIds[] 인원 
      if (response.status === 200) {
        set({ userList: response.data.updatedList, selectedPlayerIds: [] });
        return true;
      }
      return false;
    } catch (error) {
      console.error("startMatch", error);
      return false;
    }
  },
  // 경기 종료
  endMatch: async (matchId, winnerTeam) => {
    try {
      const response = await axios.post(`${HOST}/api/match/end`, {
        matchId, winnerTeam
      });
      if (response.status === 200) {
        set({ userList: response.data.updatedList });
      }
    } catch (error) {
      console.error("endMatch", error);
    }
  },

  // 유저 업데이트 (서버 반영)
  updateUsers: async (updates) => {
    try {
      const response = await axios.post(`${HOST}/api/users/update`, { updates });
      if (response.status === 200) {
        set({ userList: response.data.updatedList });
      }
    } catch (error) {
      console.error("updateUsers", error);
    }
  }

}));

export default useMatchStore;