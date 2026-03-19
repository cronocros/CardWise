package com.cardwise.common.web

import com.cardwise.common.exception.ForbiddenException
import java.util.UUID
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken
import org.springframework.stereotype.Component

@Component
class RequestAccountIdResolver {

    /**
     * JWT가 활성화된 경우 SecurityContext에서 Supabase JWT subject(= UUID)를 추출합니다.
     * 인증 없는 요청은 403을 반환합니다.
     * 로컬 개발 편의용: SUPABASE_JWT_ISSUER 환경변수가 없으면 헤더 기반 fallback 허용.
     */
    fun resolve(headerValue: String?): UUID {
        val auth = SecurityContextHolder.getContext().authentication

        if (auth is JwtAuthenticationToken) {
            val sub = auth.token.subject
            return try {
                UUID.fromString(sub)
            } catch (e: IllegalArgumentException) {
                throw ForbiddenException("JWT subject가 유효한 UUID가 아닙니다: $sub")
            }
        }

        // JWT 미적용 환경(로컬 개발, SUPABASE_JWT_ISSUER 미설정)에서만 헤더 fallback 허용
        // 운영에서는 이 경로에 도달하지 않음 (anyRequest().authenticated()에 의해 차단됨)
        return headerValue
            ?.takeIf { it.isNotBlank() }
            ?.let {
                try {
                    UUID.fromString(it)
                } catch (e: IllegalArgumentException) {
                    throw ForbiddenException("X-Account-Id 헤더가 유효한 UUID가 아닙니다.")
                }
            }
            ?: throw ForbiddenException("인증 정보가 없습니다. JWT 토큰 또는 X-Account-Id 헤더가 필요합니다.")
    }
}
