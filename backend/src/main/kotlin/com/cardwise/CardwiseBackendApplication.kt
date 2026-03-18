package com.cardwise

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class CardwiseBackendApplication

fun main(args: Array<String>) {
    runApplication<CardwiseBackendApplication>(*args)
}
