package com.cardwise.common.persistence

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import jakarta.persistence.AttributeConverter
import jakarta.persistence.Converter

@Converter
class JsonNodeConverter : AttributeConverter<JsonNode, String> {
    private val mapper = ObjectMapper().findAndRegisterModules()

    override fun convertToDatabaseColumn(attribute: JsonNode?): String? {
        return attribute?.let(mapper::writeValueAsString)
    }

    override fun convertToEntityAttribute(dbData: String?): JsonNode? {
        return dbData?.takeIf { it.isNotBlank() }?.let(mapper::readTree)
    }
}
