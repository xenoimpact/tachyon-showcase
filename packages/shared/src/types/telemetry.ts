/**
 * 스마트 팩토리 2,000대 설비 × 50개 IoT 센서 계측 텔레메트리 데이터 인터페이스
 */
export interface TelemetryEquipmentItem {
    // 1. 설비 식별 (좌측 4열 고정)
    zone: string; // 공장구역 (A동~D동)
    line: string; // 라인코드 (LINE-01~12)
    eqId: string; // 설비번호 (EQ-0001~2000)
    eqName: string; // 설비명 (5축 고속 가공기, CNC 복합 선반 등)

    // 2. 주축 온도 센서 (7열)
    tempMotor: number; // 모터 온도 (°C)
    tempBrg1: number; // 베어링 1 온도 (°C)
    tempBrg2: number; // 베어링 2 온도 (°C)
    tempChamberUpper: number; // 챔버 상부 온도 (°C)
    tempChamberLower: number; // 챔버 하부 온도 (°C)
    tempCoolantIn: number; // 냉각수 유입온도 (°C)
    tempCoolantOut: number; // 냉각수 토출온도 (°C)

    // 3. 압력 & 유량 (6열)
    pressMain: number; // 메인 유압 (bar)
    pressSub: number; // 보조 유압 (bar)
    pressAir: number; // 공압 공급압 (bar)
    flowCoolant: number; // 냉각수 유량 (L/m)
    flowLube: number; // 윤활유 유량 (L/m)
    flowExhaust: number; // 배기 챔버 풍량 (m³/h)

    // 4. 동력 & 회전 (7열)
    rpm: number; // 주축 회전수 (RPM)
    loadRate: number; // 모터 부하율 (%)
    powerKw: number; // 소비 전력 (kW)
    volt: number; // 메인 전압 (V)
    ampere: number; // 작동 전류 (A)
    torque1: number; // 서보 토크 1 (N·m)
    torque2: number; // 서보 토크 2 (N·m)

    // 5. 진동 & 충격 (6열)
    vibX: number; // 주축 X 진동 (mm/s)
    vibY: number; // 주축 Y 진동 (mm/s)
    vibZ: number; // 주축 Z 진동 (mm/s)
    shockPeak: number; // 충격 피크치 (G)
    freqShift: number; // 고주파 변위 (kHz)
    noiseDb: number; // 소음 레벨 (dB)

    // 6. 환경 센서 (5열)
    ambientTemp: number; // 외기 온도 (°C)
    humidity: number; // 챔버 습도 (%)
    co2Ppm: number; // CO2 농도 (ppm)
    vocPpm: number; // VOC 가스 농도 (ppm)
    particleCount: number; // 미세먼지 파티클 (cpm)

    // 7. 생산 & 효율 (9열)
    oeeRate: number; // 가동 효율 OEE (%)
    targetQty: number; // 목표 수량 (개)
    actualQty: number; // 생산 수량 (개)
    achieveRate: number; // 달성률 (%)
    defectQty: number; // 불량 수량 (개)
    defectPpm: number; // 불량률 (PPM)
    cycleTime: number; // 사이클 타임 (sec)
    status: '가동' | '대기' | '점검'; // 가동 상태
    alarmLevel: '정상' | '주의' | '경보'; // 경보 등급

    // 8. 네트워크 & 관제 (6열)
    packetRate: number; // 패킷 주기 (Hz)
    latencyMs: number; // 네트워크 핑 지연 시간 (ms)
    packetLoss: number; // 패킷 손실률 (%)
    firmwareVer: string; // PLC 펌웨어 버전
    maintDday: string; // 정기 점검 D-Day
    updatedAt: string; // 최근 수신 시각 (HH:mm:ss)
}
