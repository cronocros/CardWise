package com.cardwise.ledger.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.GeneratedValue
import jakarta.persistence.GenerationType
import jakarta.persistence.Id
import jakarta.persistence.Table

@Entity
@Table(name = "category")
open class CategoryEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "category_id")
    var categoryId: Long? = null

    @Column(name = "parent_id")
    var parentId: Long? = null

    @Column(name = "category_name", nullable = false)
    var categoryName: String? = null

    @Column(name = "depth", nullable = false)
    var depth: Int = 0
}
