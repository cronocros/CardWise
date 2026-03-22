# CardWise 비기능 요구사항 명세 (DOC-01-02)

> **상태**: v3.7 현행화 완료 (성능 지표 및 보안 표준 강화)

본 문서는 CardWise 시스템의 품질 특성(Quality Attributes)과 운영 제약 사항을 정의합니다.

---

## 1. 성능 지표 (Performance - PERF-xx)

| 코드 | 항목 | 목표치 (SLO) | 비고 |
|:---:|:---:|:---|:---|
| **P-01** | **일반 API 응답** | < 200ms (p95) | CRUD 엔드포인트 기준 |
| **P-02** | **검색 API 응답** | < 500ms (p95) | 가맹점/혜택 검색 (Fuzzy match 포함) |
| **P-03** | **AI 추천 응답** | < 3s (p95) | LLM 호출 포함, 캐시 hit 시 < 100ms |
| **P-04** | **대시보드 로딩** | < 1s (첫 렌더) | SSR + 데이터 병렬 로드 적용 |
| **P-05** | **DB 쿼리 성능** | < 50ms (p95) | 인덱스 최적화 및 N+1 문제 방지 |

---

## 2. 가용성 및 확장성 (Availability & Scalability - SCAL-xx)

| 코드 | 항목 | 기준 | 비고 |
|:---:|:---:|:---|:---|
| **A-01** | **서비스 가용성** | 99.5% 이상 | Managed Service (Vercel, Supabase) 기반 |
| **A-02** | **장애 복구 (RTO)** | < 30분 이내 | 서버리스 자동 복구 및 롤백 프로세스 |
| **S-01** | **동시 접속자** | 1,000명 (Growth) | Stateless BE + Redis 확장 가용성 확보 |
| **S-02** | **MSA 준비도** | High | 헥사고날 구조를 통한 모듈별 마이크로서비스 전환 용이 |

---

## 3. 보안 및 데이터 보호 (Security - SEC-xx)

| 코드 | 항목 | 상세 기준 |
|:---:|:---:|:---|
| **S-01** | **인증/인가** | Supabase JWT 기반, httpOnly 쿠키 사용, [DOC-03-05](../03-architecture/auth-design.md) 참조 |
| **S-02** | **데이터 격리** | PostgreSQL RLS(Row Level Security) 정책 100% 적용 |
| **S-03** | **API 보안** | Rate Limiting (Redis Sliding Window), OWASP Top 10 대응 |
| **S-04** | **개인정보 보호** | 카드 정보 마스킹 저장, 민감 데이터 암호화 전송 (HTTPS) |

---

## 4. 모니터링 및 운영 (Observability - OBS-xx)

| 코드 | 구분 | 도구 및 방식 |
|:---:|:---:|:---|
| **O-01** | **에러 트래킹** | Sentry (FE/BE 통합 에러 수집 및 알림) |
| **O-02** | **로그 관리** | Spring Boot Actuator + JSON 구조화 로그 |
| **O-03** | **성능 분석** | Vercel Analytics (Web Vitals), Supabase 성능 리포트 |
| **O-04** | **운영 대시보드** | 커스텀 OPS 대시보드 (Port 4173)를 통한 AI 에이전트 모니터링 |

---

## 5. 접근성 및 국제화 (i18n & Web Standard)

- **i18n**: KRW 기본 통화 + 10개 주요국 통화(USD, JPY 등) 환율 연동 지원.
- **Accessibility**: WCAG 2.1 AA 레벨 준수, 다크 모드/라이트 모드 테마 일관성 유지. [DOC-04-01](../04-design/design-system.md) 참조.

---

## 🔗 연관 문서 (Related Docs)

- **[DOC-01-01] [functional-requirements.md](functional-requirements.md)**: 기능 요구사항 명세
- **[DOC-03-02] [application-architecture.md](../03-architecture/application-architecture.md)**: 전체 시스템 설계서
- **[DOC-05-02] [observability.md](../05-implementation/observability.md)**: 운영 모니터링 상세 전략
