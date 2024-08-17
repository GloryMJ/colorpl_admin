package com.colorpl.show.service;

import com.colorpl.show.domain.Area;
import com.colorpl.show.domain.Category;
import com.colorpl.show.dto.GetShowsByConditionResponse;
import com.colorpl.show.repository.ShowDetailRepository;

import java.time.LocalDate;
import java.util.List;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class GetShowService {

    private final ShowDetailRepository showDetailRepository;

    public List<GetShowsByConditionResponse> getShowsByCondition(LocalDate date, String keyword, List<Area> area, Category category, Integer cursorId, Long limit) {
        return showDetailRepository.getShowsByCondition(date, keyword, area, category, cursorId, limit).stream().map(GetShowsByConditionResponse::from).toList();
    }
}
