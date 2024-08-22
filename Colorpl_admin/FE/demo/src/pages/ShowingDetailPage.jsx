import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, Typography, CircularProgress, Grid, Paper, Table, TableBody, TableCell,
  TableHead, TableRow
} from '@mui/material';
import api from '../api';

const ShowingDetailPage = () => {
  const { show_detail_id } = useParams();
  const [showDetail, setShowDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchShowDetail = async () => {
      try {
        const response = await api.get(`/vm/register/show_detail/${show_detail_id}`);
        setShowDetail(response.data);
      } catch (error) {
        console.error('Error fetching show detail:', error);
        setError('공연 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchShowDetail();
  }, [show_detail_id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Typography variant="h6">{error}</Typography>
      </Box>
    );
  }

  const generateSeatGrid = (seats) => {
    const rows = 10;  // 좌석 배치도의 행 수
    const cols = 16;  // 좌석 배치도의 열 수

    // 빈 그리드 초기화
    const seatGrid = Array.from({ length: rows }, () => Array(cols).fill(null));

    // 좌석 배치
    seats.forEach((seat) => {
      const row = seat.seat_row; // 행 번호는 0 기반
      const col = seat.seat_col; // 열 번호는 0 기반

      // 유효한 범위 내에서만 좌석을 배치
      if (row >= 0 && row < rows && col >= 0 && col < cols) {
        seatGrid[row][col] = (
          <Box
            key={`seat-${seat.seat_id}`}
            sx={{
              backgroundColor: seatColors[seatClassMap[seat.seat_class]],
              width: '30px',
              height: '30px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              margin: '2px',
              borderRadius: '4px',
              color: '#fff',
              fontWeight: 'bold',
            }}
          >
            {seatClassMap[seat.seat_class]}
          </Box>
        );
      }
    });

    // 그리드를 렌더링
    return seatGrid.map((row, rowIndex) => (
      <Box key={`row-${rowIndex}`} sx={{ display: 'flex', justifyContent: 'center' }}>
        {row.map((seat, colIndex) => (
          <Box key={`col-${colIndex}`} sx={{ margin: '2px' }}>
            {seat || (
              <Box
                sx={{
                  width: '30px',
                  height: '30px',
                  display: 'inline-block',
                  backgroundColor: '#f0f0f0',
                  borderRadius: '4px',
                }}
              />
            )}
          </Box>
        ))}
      </Box>
    ));
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        {showDetail.show_detail.show_detail_name}
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Paper elevation={3}>
            <Box p={2} sx={{ display: 'flex', justifyContent: 'center' }}>
              <img
                src={showDetail.show_detail.show_detail_poster_image_path}
                alt={showDetail.show_detail.show_detail_name}
                style={{ width: '100%', height: 'auto', maxHeight: '500px', objectFit: 'contain' }}
              />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Typography variant="h6">상세 정보</Typography>
          <Typography>장소: {showDetail.theater.theater_name} - {showDetail.hall.hall_name}</Typography>
          <Typography>지역: {showDetail.show_detail.show_detail_area}</Typography>
          <Typography>장르: {showDetail.show_detail.show_detail_category}</Typography>
          <Typography>출연진: {showDetail.show_detail.show_detail_cast}</Typography>
          <Typography>상태: {showDetail.show_detail.show_detail_state}</Typography>
          <Typography>런타임: {showDetail.show_detail.show_detail_runtime}</Typography>
        </Grid>
      </Grid>
      <Box mt={4}>
        <Typography variant="h6">가격 정보</Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>좌석 등급</TableCell>
              <TableCell>가격 (원)</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {showDetail.prices.map((price, index) => (
              <TableRow key={index}>
                <TableCell>{price.price_by_seat_class_seat_class}</TableCell>
                <TableCell>{price.price_by_seat_class_price.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
      <Box mt={4}>
        <Typography variant="h6">좌석 배치도</Typography>
        <Paper elevation={3} sx={{ padding: 2, overflow: 'auto' }}>
          <Box>
            {generateSeatGrid(showDetail.seats)}
          </Box>
        </Paper>
      </Box>
      <Box mt={4}>
        <Typography variant="h6">스케줄 정보</Typography>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>일정</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {showDetail.schedules.map((schedule, index) => (
              <TableRow key={index}>
                <TableCell>{new Date(schedule.show_schedule_date_time).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
};

// 좌석 등급을 위한 색상 매핑
const seatColors = {
  B: '#FFFF00', // B - 노랑
  A: '#0000FF', // A - 파랑
  S: '#009000', // S - 초록
  R: '#FF0000', // R - 빨강
};

// 좌석 등급 번호를 좌석 등급 문자로 매핑
const seatClassMap = {
  0: 'B',
  1: 'A',
  2: 'S',
  3: 'R',
};

export default ShowingDetailPage;
