package com.cardwise.common.config

import io.swagger.v3.oas.models.OpenAPI
import io.swagger.v3.oas.models.info.Info
import io.swagger.v3.oas.models.servers.Server
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

@Configuration
class SwaggerConfig {
    @Bean
    fun openAPI(): OpenAPI {
        return OpenAPI()
            .info(
                Info()
                    .title("CardWise API Docs")
                    .description("카드와이즈 백엔드 API 명세서입니다.")
                    .version("v1.0.0")
            )
            .addServersItem(Server().url("http://localhost:8080").description("Local Server"))
    }
}
