import { useMemo } from "react"
import { useParams } from "react-router-dom";

import { useUsers } from "../hooks/useUsers";
import { useDaily } from "../hooks/useDaily";
import { useMatches } from "../hooks/useMatches";

import { Loading } from "../components/common/Loading";

import { InterfaceUser, InterfaceMatch } from "../types/badminton";
import { MatchCard } from "../components/card/MatchCard";

export const UserDailyRecordPage = () => {
    const { me, userList } = useUsers();
    const { matchHistory } = useMatches();
    const { id: paramId } = useParams();

    const targetUser = useMemo<InterfaceUser | undefined | null>(() => {
        if (!paramId) return me;
        return userList.find(user => user.id === Number(paramId));
    }, [paramId, userList, me]);

    const { data: dailyData = [], isLoading } = useDaily(targetUser?.id);

    if (isLoading || !targetUser) return <Loading />;

    return (
        <div className="space-y-4">
            {/* <h2 className='pages-title uppercase'>{targetUser.name} 날짜별 기록</h2> */}

            <p className="text-base text-right"> {dailyData.length}건</p>

            {dailyData.map((record, index) => (

                <details key={index} className="group border border-slate-300 rounded-lg shadow-md p-2 open:bg-slate-50 open:border-blue-500">
                    <summary className="flex justify-between border-b border-slate-300 pb-2 list-none cursor-pointer">
                        <span>{record.date}</span>
                        <span className="material-symbols-outlined [font-variation-settings:'FILL'_0,_'wght'_400,_'GRAD'_0,_'opsz'_2] group-open:[font-variation-settings:'FILL'_1,_'wght'_400,_'GRAD'_0,_'opsz'_2]">
                            folder_open
                        </span>
                    </summary>
                    <div className="space-y-1 mt-2 text-sm text-gray-600">
                        {record.entryTime && <p>{`입장: ${record.entryTime}`}</p>}
                        {record.exitTime && <p>{`퇴장: ${record.exitTime}`}</p>}
                        {record.startRating && <p>{`시작 Rating: ${record.startRating}`}</p>}
                        {record.endRating && <p>{`퇴장 Rating: ${record.endRating}`}</p>}

                        {record.matches && record.matches.length > 0 && (
                            <details className="border-t pt-2 mt-2">
                                <summary className="text-xs text-gray-500 cursor-pointer">경기 기록 보기</summary>
                                <div className="space-y-2 mt-2">
                                    {record.matches.map((match: { matchId: number }) => {
                                        const fullMatchData = (matchHistory as InterfaceMatch[])?.find(
                                            (history) => history.matchId === match.matchId
                                        );
                                        if (!fullMatchData) return null;

                                        return (
                                            <MatchCard
                                                key={match.matchId}
                                                match={fullMatchData}
                                                onOpenModal={false}
                                            />
                                        );
                                    })}
                                </div>
                            </details>
                        )}
                    </div>
                </details>
            ))}
        </div>
    );
};