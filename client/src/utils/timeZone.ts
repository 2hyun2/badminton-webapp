export const timeZone = (time: string | Date) => {
    if (!time) return { date: "기록 없음", minute: "기록 없음" };

    const utcDate = new Date(time);
    if (isNaN(utcDate.getTime())) return { date: "기록 없음", minute: "기록 없음" };

    const kstDate = new Date(utcDate.getTime() + (9 * 60 * 60 * 1000));
    const isoString = kstDate.toISOString(); 

    return {
        date: isoString.slice(0, 10),                     // "2026-07-01"
        minute: isoString.slice(0, 16).replace('T', ' '), // "2026-07-01 09:16"
        timeOnly: isoString.slice(11, 16)                 // "09:16" 시간만 필요할 때
    };
};