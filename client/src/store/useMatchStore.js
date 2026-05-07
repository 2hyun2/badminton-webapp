import { create } from 'zustand';
import axios from 'axios';

const HOST = "http://localhost:5000";

const useMatchStore = create((set, get) => ({
  // state
  selectedPlayerIds: [],

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


}));

export default useMatchStore;