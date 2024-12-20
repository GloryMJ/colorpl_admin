package com.colorpl.schedule.service;

import com.colorpl.global.common.exception.MemberNotFoundException;
import com.colorpl.global.common.exception.ReservationNotFoundException;
import com.colorpl.global.storage.StorageService;
import com.colorpl.member.Member;
import com.colorpl.member.repository.MemberRepository;
import com.colorpl.member.service.MemberService;
import com.colorpl.reservation.domain.Reservation;
import com.colorpl.reservation.repository.ReservationRepository;
import com.colorpl.schedule.domain.ReservationSchedule;
import com.colorpl.schedule.repository.ScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
@Transactional
public class CreateReservationScheduleService {

    private final MemberRepository memberRepository;
    private final MemberService memberService;
    private final ReservationRepository reservationRepository;
    private final ScheduleRepository scheduleRepository;
    private final StorageService storageService;

    public Long create(Long reservationId) {

        Integer memberId = memberService.getCurrentMemberId();

        Member member = memberRepository.findById(memberId)
            .orElseThrow(MemberNotFoundException::new);

        Reservation reservation = reservationRepository.findById(reservationId).orElseThrow(
            ReservationNotFoundException::new);

        ReservationSchedule reservationSchedule = ReservationSchedule.builder()
            .member(member)
            .reservation(reservation)
            .build();
        scheduleRepository.save(reservationSchedule);

        return reservationSchedule.getId();
    }

}
