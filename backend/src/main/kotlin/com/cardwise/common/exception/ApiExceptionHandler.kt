package com.cardwise.common.exception

import jakarta.servlet.http.HttpServletRequest
import jakarta.validation.ConstraintViolationException
import org.springframework.http.HttpStatus
import org.springframework.http.ProblemDetail
import org.springframework.web.bind.MethodArgumentNotValidException
import org.springframework.web.bind.annotation.ExceptionHandler
import org.springframework.web.bind.annotation.RestControllerAdvice

@RestControllerAdvice
class ApiExceptionHandler {
    @ExceptionHandler(NotFoundException::class)
    fun handleNotFound(ex: NotFoundException, request: HttpServletRequest): ProblemDetail {
        return problem(HttpStatus.NOT_FOUND, ex.message ?: "Resource not found", request.requestURI)
    }

    @ExceptionHandler(ForbiddenException::class)
    fun handleForbidden(ex: ForbiddenException, request: HttpServletRequest): ProblemDetail {
        return problem(HttpStatus.FORBIDDEN, ex.message ?: "Forbidden", request.requestURI)
    }

    @ExceptionHandler(BadRequestException::class)
    fun handleBadRequest(ex: BadRequestException, request: HttpServletRequest): ProblemDetail {
        return problem(HttpStatus.BAD_REQUEST, ex.message ?: "Bad request", request.requestURI)
    }

    @ExceptionHandler(MethodArgumentNotValidException::class)
    fun handleValidation(ex: MethodArgumentNotValidException, request: HttpServletRequest): ProblemDetail {
        val detail = ex.bindingResult.fieldErrors.joinToString("; ") { "${it.field}: ${it.defaultMessage}" }
        return problem(HttpStatus.BAD_REQUEST, detail.ifBlank { "Validation failed" }, request.requestURI)
    }

    @ExceptionHandler(ConstraintViolationException::class)
    fun handleConstraintViolation(ex: ConstraintViolationException, request: HttpServletRequest): ProblemDetail {
        return problem(HttpStatus.BAD_REQUEST, ex.message ?: "Constraint violation", request.requestURI)
    }

    @ExceptionHandler(IllegalArgumentException::class)
    fun handleIllegalArgument(ex: IllegalArgumentException, request: HttpServletRequest): ProblemDetail {
        return problem(HttpStatus.BAD_REQUEST, ex.message ?: "Invalid argument", request.requestURI)
    }

    @ExceptionHandler(Exception::class)
    fun handleUnexpected(ex: Exception, request: HttpServletRequest): ProblemDetail {
        return problem(HttpStatus.INTERNAL_SERVER_ERROR, ex.message ?: "Unexpected server error", request.requestURI)
    }

    private fun problem(status: HttpStatus, detail: String, instance: String): ProblemDetail {
        return ProblemDetail.forStatusAndDetail(status, detail).apply {
            title = status.reasonPhrase
            setProperty("instance", instance)
        }
    }
}
