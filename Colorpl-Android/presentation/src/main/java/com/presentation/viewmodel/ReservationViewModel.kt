package com.presentation.viewmodel

import androidx.lifecycle.ViewModel
import com.domain.model.Seat
import com.domain.model.TimeTable
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import javax.inject.Inject

@HiltViewModel
class ReservationViewModel @Inject constructor(

) : ViewModel() {
    private val _reservationImg = MutableStateFlow("")
    val reservationImg: StateFlow<String> = _reservationImg
    private val _reservationTitle = MutableStateFlow("")
    val reservationTitle: StateFlow<String> = _reservationTitle
    private val _reservationDate = MutableStateFlow("")
    val reservationDate: StateFlow<String> = _reservationDate
    private val _reservationPlace = MutableStateFlow("")
    val reservationPlace: StateFlow<String> = _reservationPlace
    private val _reservationTheater = MutableStateFlow("")
    val reservationTheater: StateFlow<String> = _reservationTheater
    private val _reservationTimeTable =
        MutableStateFlow<TimeTable>(TimeTable(1, "10:00", "12:00", 50))
    val reservationTimeTable: StateFlow<TimeTable> = _reservationTimeTable
    private val _reservationSeat = MutableStateFlow<List<Seat>>(listOf())
    val reservationSeat: StateFlow<List<Seat>> = _reservationSeat

    fun setReservationImg(img: String) {
        _reservationImg.value = img
    }

    fun setReservationTitle(title: String) {
        _reservationTitle.value = title
    }

    fun setReservationDate(date: String) {
        _reservationDate.value = date
    }

    fun setReservationPlace(place: String) {
        _reservationPlace.value = place
    }

    fun setReservationTheater(theater: String) {
        _reservationTheater.value = theater
    }

    fun setReservationTimeTable(timeTable: TimeTable) {
        _reservationTimeTable.value = timeTable
    }

    fun setReservationSeat(seatList: List<Seat>) {
        _reservationSeat.value = seatList
    }


}