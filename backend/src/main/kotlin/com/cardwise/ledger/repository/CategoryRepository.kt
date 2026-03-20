package com.cardwise.ledger.repository

import com.cardwise.ledger.entity.CategoryEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface CategoryRepository : JpaRepository<CategoryEntity, Long> {
    fun findAllByParentIdIsNullOrderByCategoryNameAsc(): List<CategoryEntity>
}
