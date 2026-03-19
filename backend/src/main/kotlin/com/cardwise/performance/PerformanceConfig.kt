package com.cardwise.performance

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import java.time.Clock
import java.time.ZoneId

@Configuration
class PerformanceConfig {
    @Bean
    fun performanceClock(): Clock = Clock.system(ZoneId.of("Asia/Seoul"))
}
