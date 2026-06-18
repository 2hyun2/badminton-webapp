import { Button } from '../common/Button';

export const ModalMatchResult = ({ onResult, onClose }) => {

    const handleMatchResult = (result) => {
        if (!result) return;

        const resultText = {
            'A': 'Team A 승리',
            'B': 'Team B 승리',
            'VOID': '경기 무효'
        };

        if (confirm(`${resultText[result]} 를 선택하시겠습니까?`)) {
            onResult(result);
            onClose();
        }
    }

    return (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="modal-container">
                <div className="space-y-8">
                    <h3 className="modal-title">경기 결과 입력</h3>
                    <div className="flex flex-col gap-2">
                        <Button onClick={() => handleMatchResult('A')} size='lg' variant="red">Team A 승리</Button>
                        <Button onClick={() => handleMatchResult('B')} size='lg' variant="blue">Team B 승리</Button>
                        <Button onClick={() => handleMatchResult('VOID')} size='lg' variant="outline">경기 무효</Button>
                    </div>
                    <div className="mt-4 border-t pt-4">
                        <Button onClick={onClose} size='sm' variant="outline">취소 (돌아가기)</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};