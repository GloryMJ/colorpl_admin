package com.presentation.reservation

import android.view.ViewTreeObserver
import androidx.recyclerview.widget.GridLayoutManager
import com.colorpl.presentation.R
import com.colorpl.presentation.databinding.DialogSeatPersonBinding
import com.colorpl.presentation.databinding.FragmentReservationSeatBinding
import com.domain.model.Seat
import com.google.android.material.bottomsheet.BottomSheetDialog
import com.presentation.base.BaseFragment
import com.presentation.component.adapter.reservation.SeatAdapter
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class ReservationSeatFragment :
    BaseFragment<FragmentReservationSeatBinding>(R.layout.fragment_reservation_seat) {

    private val seatAdapter by lazy {
        SeatAdapter(onSeatSelected = { seat ->
            updateSeatSelection(seat)
        })
    }
    private var peopleCount = 1
    private val selectedSeats = mutableListOf<Seat>()

    override fun initView() {
        binding.apply {
            showPeopleCountBottomSheet()
            initUi()
        }
    }

    private fun initUi() {
        binding.apply {
            rvSeats.apply {
                adapter = seatAdapter
                itemAnimator = null
                layoutManager = GridLayoutManager(requireContext(), COL_SIZE)
            }

            binding.tvPersonChange.setOnClickListener {
                showPeopleCountBottomSheet()
            }
        }

        binding.apply {
            tvGradeA.apply {
                this.tvGrade.text = "A"
                this.tvGrade.setBackgroundResource(R.drawable.rectangle_blue_8_stroke_4_blue)
                this.tvGradeCnt.text = getString(R.string.reservation_seat_cnt, 0)
                this.tvGradePrice.text = getString (R.string.reservation_seat_price, 0)
            }

            tvGradeB.apply {
                this.tvGrade.text = "B"
                this.tvGrade.setBackgroundResource(R.drawable.rectangle_purple_8_stroke_4_purple)
                this.tvGradeCnt.text = getString(R.string.reservation_seat_cnt, 0)
                this.tvGradePrice.text = getString (R.string.reservation_seat_price, 0)
            }

            tvGradeR.apply {
                this.tvGrade.text = "R"
                this.tvGrade.setBackgroundResource(R.drawable.rectangle_imperial_red_8_stroke_4_imperial_red)
                this.tvGradeCnt.text = getString(R.string.reservation_seat_cnt, 0)
                this.tvGradePrice.text = getString (R.string.reservation_seat_price, 0)
            }

            tvGradeS.apply {
                this.tvGrade.text = "S"
                this.tvGrade.setBackgroundResource(R.drawable.rectangle_green_8_stroke_4_green)
                this.tvGradeCnt.text = getString(R.string.reservation_seat_cnt, 0)
                this.tvGradePrice.text = getString (R.string.reservation_seat_price, 0)
            }
        }

    }

    private fun showPeopleCountBottomSheet() {
        val bottomSheetDialog = BottomSheetDialog(requireContext())
        val bottomSheetBinding = DialogSeatPersonBinding.inflate(layoutInflater)

        bottomSheetDialog.setContentView(bottomSheetBinding.root)
        bottomSheetDialog.setCancelable(false)
        bottomSheetBinding.apply {
            tvCount.text = peopleCount.toString()

            tvDecrease.setOnClickListener {
                if (peopleCount > 1) {
                    peopleCount--
                    tvCount.text = peopleCount.toString()
                }
            }

            tvIncrease.setOnClickListener {
                if (peopleCount < 8) {
                    peopleCount++
                    tvCount.text = peopleCount.toString()
                }
            }
            tvConfirmPersonCount.setOnClickListener {
                // 여기서 좌석 선택에 필요한 데이터 넘기기
                selectedSeats.clear()
                seatAdapter.submitList(createSeats(ROW_SIZE, COL_SIZE))
                findCenterPosition()
                binding.tvPrice.text = "${selectedSeats.sumOf { it.price }}원"
                bottomSheetDialog.dismiss()
            }
        }

        bottomSheetDialog.show()
    }

    private fun createSeats(rowSize: Int, colSize: Int): List<Seat> {
        return List(rowSize * colSize) { index ->
            Seat(
                row = index / colSize,
                column = index % colSize,
                price = 15000,
                grade = (1..5).random(),
                isSelected = false
            )
        }
    }

    private fun updateSeatSelection(seat: Seat) {
        val currentList = seatAdapter.currentList.toMutableList()
        val index = currentList.indexOfFirst { it.row == seat.row && it.column == seat.column }
        if (index != -1) {
            if (selectedSeats.size < peopleCount) {
                val updatedSeat = seat.copy(isSelected = !seat.isSelected)
                currentList[index] = updatedSeat
                seatAdapter.submitList(currentList)

                if (updatedSeat.isSelected) {
                    selectedSeats.add(updatedSeat)
                } else {
                    selectedSeats.removeAll { it.row == updatedSeat.row && it.column == updatedSeat.column }
                }
            } else {
                if (seat.isSelected) {
                    val updatedSeat = seat.copy(isSelected = false)
                    currentList[index] = updatedSeat
                    seatAdapter.submitList(currentList)
                    selectedSeats.removeAll { it.row == updatedSeat.row && it.column == updatedSeat.column }
                }
            }
            val gradeCount = selectedSeats.groupingBy { it.grade }.eachCount()
            binding.apply {
                tvGradeB.apply {
                    gradeCount[1]?.let { b ->
                        this.tvGradeCnt.text = getString(R.string.reservation_seat_cnt,b)
                        this.tvGradePrice.text = getString (R.string.reservation_seat_price, b*10000)
                    }
                }
                tvGradeA.apply {
                    gradeCount[2]?.let { a ->
                        this.tvGradeCnt.text = getString(R.string.reservation_seat_cnt, a)
                        this.tvGradePrice.text = getString (R.string.reservation_seat_price, a*12000)
                    }
                }

                tvGradeS.apply {
                    gradeCount[3]?.let { s ->
                        this.tvGradeCnt.text = getString(R.string.reservation_seat_cnt, s)
                        this.tvGradePrice.text = getString (R.string.reservation_seat_price, s*15000)
                    }
                }

                tvGradeR.apply {
                    gradeCount[4]?.let { r ->
                        this.tvGradeCnt.text = getString(R.string.reservation_seat_cnt, r)
                        this.tvGradePrice.text = getString (R.string.reservation_seat_price, r*20000)
                    }
                }


            }
            binding.tvPrice.text = getString (R.string.reservation_seat_price, selectedSeats.sumOf { it.price })

            updateConfirmState()
        }
    }

    private fun updateConfirmState() {
        binding.tvNext.isSelected = if (selectedSeats.size == peopleCount) {
            binding.tvNext.text = "선택완료"
            true
        } else {
            binding.tvNext.text = "선택(${selectedSeats.size}/$peopleCount)"
            false
        }
    }

    private fun findCenterPosition() {
        binding.hsSeat.viewTreeObserver.addOnGlobalLayoutListener(object :
            ViewTreeObserver.OnGlobalLayoutListener {
            override fun onGlobalLayout() {
                binding.hsSeat.viewTreeObserver.removeOnGlobalLayoutListener(this)
                val totalWidth = binding.rvSeats.width
                val visibleWidth = binding.hsSeat.width
                binding.hsSeat.scrollTo((totalWidth - visibleWidth) / 2, 0)
            }
        })
    }

    companion object {
        const val COL_SIZE = 16
        const val ROW_SIZE = 10
    }
}