package com.cardwise.ledger.adapter.`in`.web

import com.cardwise.common.api.ApiResponse
import com.cardwise.ledger.adapter.out.persistence.entity.CategoryEntity
import com.cardwise.ledger.adapter.out.persistence.repository.CategoryRepository
import org.springframework.stereotype.Service
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

data class CategoryResponse(
    val categoryId: Long,
    val categoryName: String,
    val depth: Int,
)

@Service
class CategoryService(
    private val categoryRepository: CategoryRepository,
) {
    fun listRootCategories(): List<CategoryResponse> {
        return categoryRepository.findAllByParentIdIsNullOrderByCategoryNameAsc().map {
            CategoryResponse(
                categoryId = it.categoryId!!,
                categoryName = it.categoryName!!,
                depth = it.depth
            )
        }
    }
}

@RestController
@RequestMapping("/api/v1/ledger/categories")
class CategoryController(
    private val categoryService: CategoryService,
) {
    @GetMapping
    fun listCategories(): ApiResponse<List<CategoryResponse>> {
        return ApiResponse(data = categoryService.listRootCategories())
    }
}