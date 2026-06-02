export const timeAgo = (entryTime) => {
    if (!entryTime) return "기록 없음";

    const now = new Date();
    const userLastEntry = new Date(entryTime);
    const timeDiff = now - userLastEntry;

    const min = 60 * 1000;
    const hour = 60 * min;
    const day = 24 * hour;
    const month = 30 * day;

    if (timeDiff < min) return "방금 전";
    if (timeDiff < hour) return `${Math.floor(timeDiff / min)}분 전`;
    if (timeDiff < day) return `${Math.floor(timeDiff / hour)}시간 전`;
    if (timeDiff < month) return `${Math.floor(timeDiff / day)}일 전`;

    return entryTime.slice(0, 10);
}