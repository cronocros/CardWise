# CardWise 테스트 전략 (DOC-06-01)

> 최종 갱신: 2026-03-18

---

## 1. 테스트 철학

- **"깨지는 테스트가 없다면 리팩토링하지 마라"** — 테스트는 설계 품질의 지표
- 빠른 피드백: 단위 테스트는 10초 이내, CI 전체 5분 이내
- 실제 환경과 격리: 외부 의존성은 Testcontainers 또는 WireMock으로 대체
- 금융 도메인 특성: 실적 계산, 혜택 적용, 금액 계산 로직은 반드시 단위 테스트

---

## 2. 테스트 피라미드

```
         /\
        /E2E\          10% — Playwright (FE), RestAssured (API)
       /------\
      /  통합  \         20% — @SpringBootTest + Testcontainers
     /----------\
    /   단위     \       70% — JUnit5 + Mockk (BE), Vitest + Testing Library (FE)
   /--------------\
```

---

## 3. 백엔드 테스트 전략 (Spring Boot Kotlin)

### 3.1 도메인 단위 테스트 (70% 목표)

대상: Entity, Value Object, Domain Service, Domain Event

```kotlin
// 예시: 실적 구간 계산 단위 테스트
class PerformanceTierTest {
    @Test
    fun `실적 82만원이면 50만 구간 달성, 100만 미달성`() {
        val performance = MonthlyPerformance(amount = Money(820_000, Currency.KRW))

        assertThat(performance.achievedTier(Tier.T300K)).isTrue()
        assertThat(performance.achievedTier(Tier.T500K)).isTrue()
        assertThat(performance.achievedTier(Tier.T1M)).isFalse()
    }
}
```

**중점 테스트 대상 (Bounded Context별)**:

| Bounded Context | 핵심 테스트 |
|----------------|------------|
| Card | 카드 발급일 기준 연간 실적 계산 |
| UserCard | 실적 구간 달성 판정, 혜택 활성화 |
| Ledger | Payment → PaymentItem 집계, 카테고리 분류 |
| Benefit | 혜택 적용 우선순위, 중복 혜택 처리 |
| EmailParser | 이메일 파싱 정확도 (Bank별 템플릿) |
| Notification | 알림 조건 판단, 발송 스케줄 |
| Analytics | 지출 통계 집계 정확성 |

### 3.2 유스케이스 단위 테스트

Port를 Mockk으로 목킹, 비즈니스 로직만 검증:

```kotlin
@ExtendWith(MockKExtension::class)
class RegisterCardUseCaseTest {
    @MockK private lateinit var cardRepository: CardPort
    @MockK private lateinit var eventPublisher: EventPort

    private lateinit var useCase: RegisterCardUseCase

    @BeforeEach
    fun setUp() {
        useCase = RegisterCardUseCase(cardRepository, eventPublisher)
    }

    @Test
    fun `카드 등록 성공 시 CardRegisteredEvent 발행`() {
        // given
        every { cardRepository.save(any()) } returns mockCard()
        every { eventPublisher.publish(any()) } just runs

        // when
        useCase.execute(RegisterCardCommand(...))

        // then
        verify { eventPublisher.publish(ofType<CardRegisteredEvent>()) }
    }
}
```

### 3.3 어댑터 통합 테스트

**JPA 어댑터**: `@DataJpaTest` + Testcontainers PostgreSQL

```kotlin
@DataJpaTest
@AutoConfigureTestDatabase(replace = NONE)
@Testcontainers
class CardJpaAdapterTest {
    companion object {
        @Container
        val postgres = PostgreSQLContainer("postgres:15-alpine")
            .withDatabaseName("cardwise_test")
    }
}
```

**Redis 어댑터**: Testcontainers Redis

```kotlin
@SpringBootTest(classes = [RedisConfig::class])
@Testcontainers
class RateLimitAdapterTest {
    @Container
    val redis = GenericContainer("redis:7-alpine").withExposedPorts(6379)
}
```

**외부 API (카드사)**: WireMock

```kotlin
@WireMockTest
class CardIssuerApiAdapterTest {
    @Test
    fun `카드사 API 응답 실패 시 fallback 처리`() {
        stubFor(get("/card-benefits").willReturn(serverError()))
        // fallback 로직 검증
    }
}
```

### 3.4 API 통합 테스트

```kotlin
@SpringBootTest(webEnvironment = RANDOM_PORT)
class CardControllerTest {
    @Test
    fun `GET cards - 인증 없으면 401`() {
        given().`when`().get("/api/v1/cards")
            .then().statusCode(401)
    }

    @Test
    fun `POST cards - 카드 등록 성공`() {
        val jwt = generateTestJwt(userId = "test-user")
        given()
            .header("Authorization", "Bearer $jwt")
            .body(RegisterCardRequest(...))
            .`when`().post("/api/v1/cards")
            .then().statusCode(201)
    }
}
```

---

## 4. 프론트엔드 테스트 전략 (Next.js TypeScript)

### 4.1 컴포넌트 단위 테스트 (Vitest + Testing Library)

```typescript
// CardThumbnail 컴포넌트 테스트
describe('CardThumbnail', () => {
  it('카드 번호를 마스킹하여 표시한다', () => {
    render(<CardThumbnail cardNumber="1234567890123456" />)
    expect(screen.getByText('•••• •••• •••• 3456')).toBeInTheDocument()
  })

  it('실적 달성 시 배지를 표시한다', () => {
    render(<CardThumbnail performanceAchieved={true} />)
    expect(screen.getByRole('badge')).toHaveTextContent('달성')
  })
})
```

### 4.2 서버 컴포넌트 테스트

Next.js 16 App Router의 Server Component는 통합 테스트로:
- Playwright 기반 실제 렌더링 검증
- MSW(Mock Service Worker)로 API 응답 모킹

### 4.3 E2E 테스트 (Playwright)

**주요 흐름별 시나리오**:

```typescript
// 카드 등록 플로우
test('카드 등록 후 대시보드에 표시', async ({ page }) => {
  await page.goto('/cards')
  await page.click('[data-testid="add-card-btn"]')
  await page.fill('[name="cardNumber"]', '4111111111111111')
  await page.click('[data-testid="submit-btn"]')
  await expect(page.locator('.card-thumbnail')).toBeVisible()
})

// 혜택 검색 플로우
test('스타벅스 검색 시 최적 카드 추천', async ({ page }) => {
  await page.goto('/benefits')
  await page.fill('[placeholder*="스타벅스"]', '스타벅스')
  await expect(page.locator('.ai-recommendation')).toBeVisible()
  await expect(page.locator('.saving-amount')).toContainText('₩')
})
```

---

## 5. 성능 테스트

### 5.1 k6 부하 테스트

```javascript
// 목표: 동시 100명 사용자, P95 < 500ms
import http from 'k6/http'
import { check } from 'k6'

export let options = {
  stages: [
    { duration: '1m', target: 50 },   // 워밍업
    { duration: '3m', target: 100 },  // 피크
    { duration: '1m', target: 0 },    // 쿨다운
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500'],
    'http_req_failed': ['rate<0.01'],
  },
}
```

**테스트 대상 엔드포인트**:

| 엔드포인트 | 목표 TPS | P95 목표 |
|-----------|---------|---------|
| GET /api/v1/dashboard | 50 | 200ms |
| GET /api/v1/cards | 100 | 150ms |
| POST /api/v1/recommendations | 10 | 2000ms (Claude API 포함) |
| POST /api/v1/payments | 30 | 300ms |

### 5.2 Lighthouse (프론트엔드)

| 메트릭 | 목표 |
|--------|------|
| LCP (Largest Contentful Paint) | < 2.5s |
| FID / INP | < 100ms |
| CLS | < 0.1 |
| Lighthouse Score | > 90 |

---

## 6. 보안 테스트

### 6.1 자동 스캔

- **OWASP ZAP**: CI 파이프라인에 통합, 주요 API 엔드포인트 스캔
- **Snyk**: 의존성 취약점 자동 감지 (GitHub Actions)
- **Trivy**: Docker 이미지 취약점 스캔

### 6.2 수동 체크리스트

| 항목 | 점검 내용 |
|------|----------|
| SQL Injection | JPA 파라미터 바인딩 확인, 동적 쿼리 금지 |
| XSS | 사용자 입력 Zod 검증, React 자동 이스케이핑 |
| CSRF | SameSite=Strict 쿠키 설정 확인 |
| 인증 우회 | Supabase RLS 각 테이블별 정책 검증 |
| JWT 변조 | HS256 서명 검증, exp 만료 확인 |
| 카드번호 노출 | 로그 마스킹, 응답 마스킹 확인 |
| PIPA 준수 | 개인정보 저장 최소화, 암호화 적용 |

---

## 7. 테스트 환경

### 7.1 CI 파이프라인 (GitHub Actions)

```yaml
# .github/workflows/test.yml
jobs:
  backend-test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15-alpine
      redis:
        image: redis:7-alpine
    steps:
      - run: ./gradlew test jacocoTestReport
      - uses: codecov/codecov-action@v3

  frontend-test:
    runs-on: ubuntu-latest
    steps:
      - run: bun test --coverage
      - run: bun run playwright test  # develop 브랜치만
```

### 7.2 커버리지 목표

| 레이어 | 목표 | 도구 |
|--------|------|------|
| 백엔드 도메인/유스케이스 | 90% | JaCoCo |
| 백엔드 어댑터 | 70% | JaCoCo |
| 프론트엔드 컴포넌트 | 70% | Vitest coverage |
| E2E 주요 흐름 | 100% (8개 흐름) | Playwright |

---

## 8. 테스트 데이터 전략

### 8.1 Fixture (Kotlin Builder Pattern)

```kotlin
object CardFixture {
    fun aCard(
        id: CardId = CardId("card-001"),
        name: String = "신한 딥드림",
        issuer: Issuer = Issuer.SHINHAN,
        issueDate: LocalDate = LocalDate.of(2024, 1, 15)
    ) = Card(id, name, issuer, issueDate)
}
```

### 8.2 테스트 격리

- **단위 테스트**: 완전 인메모리, 격리 보장
- **통합 테스트**: `@Transactional` 롤백 또는 Testcontainers 재시작
- **E2E 테스트**: 전용 테스트 DB 사용, 각 테스트 전 시드 데이터 주입

### 8.3 시드 데이터

`/cardwise-seed` 스킬로 생성:
- 사용자 3명 (일반, 카드 다수 보유, 초기 사용자)
- 카드 6개 (Rose, Ocean, Violet, Forest, Gold, Slate 그라디언트)
- 거래 100건 (최근 3개월)
- 혜택/바우처 다수
