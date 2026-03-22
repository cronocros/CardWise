# CardWise 리스크 관리부 (DOC-01-04)

> **상태**: v3.7 현행화 완료 (시스템 안정성 및 리소스 한도 리스크 반영)

본 문서는 CardWise 프로젝트의 잠재적 리스크를 식별하고, 이에 대한 대응 전략을 수립하여 관리하는 문서입니다.

---

## 1. 리스크 평가 기준 (Evaluation Criteria)

| 등급 | 발생 가능성 | 영향도 (Impact) | 우선순위 산정 |
|:---:|:---|:---|:---|
| **H** | > 50% 가능성 | 서비스 중단 또는 심각한 데이터 손실 | 발생가능성 × 영향도 |
| **M** | 10~50% 가능성 | 일부 기능 저하 또는 사용자 불편 | (HH > HM > MH > MM ...) |
| **L** | < 10% 가능성 | 경미한 UI 결함 또는 무시 가능 수준 | |

---

## 2. 기술 및 시스템 리스크 (Risk-T-xx)

| ID | 리스크 (Risk Description) | 가능성 | 영향도 | 대응 전략 |
|:---:|:---|:---:|:---:|:---|
| **T-01** | Supabase Free 플랜 커넥션 한도 초과 | M | H | PgBouncer 활성화 및 Pro 플랜 업그레이드 검토 |
| **T-02** | Cloud Run Cold Start 지연 (JVM 기반) | M | M | 최소 인스턴스(Min Instances) 1개 유지 |
| **T-03** | Upstash Redis API 요청 한도 초과 | L | M | 캐시 TTL 최적화 및 불필요한 조회 최소화 |
| **T-04** | 서비스 Secret 및 API Key 노출 | L | H | CI/CD 시 비밀 값 로테이션 및 환경 변수 격리 |
| **T-05** | 외부 API (LLM 등) 비용 급증 | M | M | 일괄 호출 제한(Rate Limit) 및 결과 캐싱 적용 |

---

## 3. 비즈니스 및 운영 리스크 (Risk-B/O-xx)

| ID | 리스크 (Risk Description) | 가능성 | 영향도 | 대응 전략 |
|:---:|:---|:---:|:---:|:---|
| **B-01** | 카드사 혜택 및 실적 정책 변경 | H | H | 혜택 규칙의 DB화(Hard-coding 금지) 및 공지 추적 |
| **B-02** | 사용자 금융 데이터 정합성 오류 | L | H | 트랜잭션 보장 및 수치 계산 단위 테스트 100% |
| **O-01** | 인프라 장애 (Supabase/Vercel) | L | H | 모니터링 알림 설정 및 읽기 전용 Fallback 모드 고려 |
| **O-02** | 배포 실패 및 빌드 오류 | M | M | PR Preview 환경 검증 및 즉각적인 롤백 절차 수립 |

---

## 4. 리스크 대응 상세 제언

- **혜택 정합성 (B-01)**: `card_benefit_template` 테이블을 통해 변경 사항을 상시 업데이트하며, UI에 데이터 최종 갱신일을 표시하여 신뢰도를 확보함. [DOC-03-03](schema-design.md) 참조.
- **성능 유지 (T-01~03)**: Redis 캐시를 활용하여 DB 부하를 분산하고, 주요 쿼리의 p95 응답 속도를 200ms 이하로 유지함. [DOC-01-02](non-functional-requirements.md) 참조.

---

## 🔗 연관 문서 (Related Docs)

- **[DOC-01-01] [functional-requirements.md](functional-requirements.md)**: 요구사항 정의서
- **[DOC-01-02] [non-functional-requirements.md](non-functional-requirements.md)**: 성능 및 품질 요건
- **[DOC-02-01] [TASKS.md](../02-planning/TASKS.md)**: 리스크 대응 태스크 포함
