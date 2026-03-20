package com.cardwise.community.entity

import com.cardwise.common.persistence.JsonNodeConverter
import com.fasterxml.jackson.databind.JsonNode
import jakarta.persistence.Column
import jakarta.persistence.Convert
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.OffsetDateTime
import java.util.UUID

@Entity
@Table(name = "community_post")
open class CommunityPostEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "post_id")
    var postId: Long? = null

    @Column(name = "account_id", nullable = false)
    var accountId: UUID? = null

    @Column(name = "category", nullable = false)
    var category: String? = null

    @Column(name = "title", nullable = false)
    var title: String? = null

    @Column(name = "content", nullable = false)
    var content: String? = null

    @Column(name = "image_url")
    var imageUrl: String? = null

    @Column(name = "tags")
    @Convert(converter = JsonNodeConverter::class)
    var tags: JsonNode? = null

    @Column(name = "view_count", nullable = false)
    var viewCount: Int = 0

    @Column(name = "created_at")
    var createdAt: OffsetDateTime? = null

    @Column(name = "updated_at")
    var updatedAt: OffsetDateTime? = null

    @Column(name = "deleted_at")
    var deletedAt: OffsetDateTime? = null
}
