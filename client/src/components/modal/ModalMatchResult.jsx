import React from 'react';
import { Button } from '../common/Button';

export const ModalMatchResult = ({ onResult, onClose }) => {
  return (
    <div 
      className="modal-overlay" 
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-container">
        <h3 className="modal-title">경기 결과 입력</h3> 

        <div className="flex flex-col gap-3">
          {/* 부모의 handleMatchResult('A')를 실행함 */}
          <Button onClick={() => onResult('A')} size='md' variant="red">
            Team A 승리
          </Button>
          
          <Button onClick={() => onResult('B')} size='md' variant="blue">
            Team B 승리
          </Button>
          
          <Button onClick={() => onResult('cancel')} size='md' variant="gray">
            경기 무효
          </Button>
        </div>

        <div className="mt-4 border-t pt-4">
          <Button onClick={onClose} size='sm' variant="outline">
            취소 (돌아가기)
          </Button>
        </div>
      </div>
    </div>
  );
};