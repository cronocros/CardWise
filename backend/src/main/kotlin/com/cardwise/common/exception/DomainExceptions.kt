package com.cardwise.common.exception

class NotFoundException(message: String) : RuntimeException(message)

class ForbiddenException(message: String) : RuntimeException(message)

class BadRequestException(message: String) : RuntimeException(message)
