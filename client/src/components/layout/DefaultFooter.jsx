import React from 'react'

export const DefaultFooter = () => {

    return (
        <footer className='relative w-full'>
            <div className="text-center bg-slate-50 border-t p-2">
                <ul className="text-sm text-slate-600 space-y-1">
                    <li className="font-semibold text-slate-900">본 페이지는 로그인 후 이용 가능합니다.</li>
                    <li>회원가입 시 ID/PASSWORD 제한이 없습니다. <br /><span className="text-rose-500 font-bold text-xs">※ 본인의 개인정보를 최소화 하세요.</span></li>
                    <li className='text-xs'>"본 사이트는 비영리로 운영되는 커뮤니티입니다.
                        <br /> 사이트의 정상적인 운영을 방해하거나 악의적인 공격 행위를 할 경우, 법적 조치를 포함한 강력한 제재가 가해질 수 있음을 알려드립니다."
                    </li>
                    <li>문의, 개선/에러 사항은 소통 채널을 이용해 주세요.
                        <ul className="flex flex-wrap gap-2 justify-center text-blue-600">
                            <li><a href="https://open.kakao.com/me/isHyun" target="_blank" rel="noreferrer" className="hover:underline">카카오톡 오픈 챗 문의</a></li>
                            <li><a href="mailto:eventietter@naver.com" className="hover:underline">eventietter@naver.com</a></li>
                        </ul>
                    </li>
                </ul>
            </div>
        </footer>
    );
};