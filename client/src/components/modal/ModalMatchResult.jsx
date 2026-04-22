import React from 'react'
import { Button } from '../common/Button'

export const ModalMatchResult = ({ onResult, onClose }) => {
        return (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget ? setEndingMatchId(null) : null}>
                        <div className="modal-container">
                                <h3 className="modal-title">경기 결과 입력</h3>

                                <div className="flex flex-col gap-3">
                                        <Button onClick={() => onResult('A')} children={"Team A 승리"} size='md' variant="red" />
                                        <Button onClick={() => onResult('B')} children={"Team B 승리"} size='md' variant="blue" />
                                        <Button onClick={() => onResult('DRAW')} children={"경기 무효"} size='md' variant="gray" />
                                </div>

                                <Button onClick={() => onClose(null)} children={"취소 (돌아가기)"} size='sm' variant="outline" />
                        </div>
                </div>
        )
}
