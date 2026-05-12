import { create } from 'zustand';
import api from '../hooks/api';

const useMatchStore = create((set, get) => ({
  // state
  userList: [],
  selectedPlayerIds: [],

  // 서버 데이터를 스토어와 동기화
  setUserList: (list) => set({ userList: list }),

  toggleUserStatus: (targetId) => {
    const { userList } = get();
    const targetUser = userList.find(user => user.id === targetId);

    if (targetUser.status === "대기중") {
      const updated = userList.map(user => {
        // 그룹으로 묶인 user 존재시 같이 휴식중 변환
        if (user.id === targetId || targetUser.groupId && user.groupId === targetUser.groupId) {
          return { ...user, status: "휴식중", groupId: null };
        }
        return user;
      });
      set({ userList: updated })
    }
  },
  // 경기 시작을 위한 경기 매칭열 유저 넣기
  togglePlayerSelection: (userId) => {
    const { selectedPlayerIds, userList } = get();
    const targetUser = userList.find(u => u.id === userId);
    if (!targetUser) return;

    // 같은 그룹에 속한 모든 유저 ID 추출 (본인 포함)
    const groupMemberIds = targetUser.groupId 
      ? userList.filter(u => u.groupId === targetUser.groupId).map(u => u.id)
      : [userId];

    const isAlreadySelected = selectedPlayerIds.includes(userId);

    if (isAlreadySelected) {
      // 선택 해제: 그룹 멤버 전체 제거
      set({ selectedPlayerIds: selectedPlayerIds.filter(id => !groupMemberIds.includes(id)) });
    } else {
      // 선택 추가: 4명 초과 여부 확인 후 그룹 멤버 전체 추가
      const nextSelection = Array.from(new Set([...selectedPlayerIds, ...groupMemberIds]));
      if (nextSelection.length <= 4) {
        set({ selectedPlayerIds: nextSelection });
      } else {
        alert("매칭 인원은 4명을 초과할 수 없습니다. (팀 단위로 선택됩니다)");
      }
    }
  },
  resetSelection: () => set({ selectedPlayerIds: [] }),
}));

export default useMatchStore;