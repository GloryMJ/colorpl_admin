package com.data.model.request

data class RequestTicketCreate(
    val name: String,
    val location: String,
    val dateTime: String,
    val seat: String,
    val category: String,
    val latitude: Double,
    val longitude: Double
)