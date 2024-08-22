import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Typography, Grid } from '@mui/material';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import api from '../api';

const SchedulePage = ({ showDetail, onScheduleSubmit, hallId }) => {
  const [selectedDateTime, setSelectedDateTime] = useState(new Date());
  const [runtime, setRuntime] = useState(''); // 런타임은 서버로 보내지 않음
  const [schedules, setSchedules] = useState([]);
  const [existingSchedules, setExistingSchedules] = useState([]);

  useEffect(() => {
    if (hallId) {
      const fetchSchedules = async () => {
        try {
          const response = await api.get(`/vm/schedules/hall/${hallId}`);
          setExistingSchedules(response.data);
        } catch (error) {
          console.error('Error fetching schedules:', error);
        }
      };
      fetchSchedules();
    }
  }, [hallId]);

  const checkForConflict = (dateTime) => {
    const selectedDateTime = new Date(dateTime);

    return existingSchedules.some((schedule) => {
      const existingDateTime = new Date(schedule.show_schedule_date_time);
      return selectedDateTime.getTime() === existingDateTime.getTime();
    });
  };

  const handleAddSchedule = () => {
    const combinedDateTime = new Date(selectedDateTime);

    if (isNaN(combinedDateTime.getTime())) {
      console.error('Invalid DateTime:', combinedDateTime);
      alert('유효하지 않은 날짜 또는 시간입니다.');
      return;
    }

    if (checkForConflict(combinedDateTime)) {
      alert('스케줄이 이미 존재합니다.');
      return;
    }

    setSchedules([
      ...schedules,
      {
        show_schedule_date_time: combinedDateTime.toISOString(), // 런타임은 보내지 않음
        show_detail_id: showDetail.show_detail_id,
      },
    ]);
  };

  const handleSubmit = () => {
    onScheduleSubmit(schedules); // 런타임을 제외하고 스케줄 데이터를 서버로 전달
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        p={3}
      >
        <Typography variant="h4" gutterBottom>
          스케줄 설정
        </Typography>
        {hallId ? (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <DateTimePicker
                label="날짜 및 시간 선택"
                value={selectedDateTime}
                onChange={(newDateTime) => setSelectedDateTime(newDateTime)}
                renderInput={(params) => <TextField {...params} fullWidth />}
              />
              <TextField
                fullWidth
                label="런타임 (예: 2시간 5분)"
                value={runtime}
                onChange={(e) => setRuntime(e.target.value)} // 런타임은 UI에서만 사용
                sx={{ mt: 2 }}
              />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" onClick={handleAddSchedule} fullWidth>
                스케줄 추가
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6">추가된 스케줄</Typography>
              <Box>
                {schedules.map((schedule, index) => (
                  <Typography key={index}>
                    {new Date(schedule.show_schedule_date_time).toLocaleString()}
                  </Typography>
                ))}
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Button variant="outlined" onClick={handleSubmit} fullWidth>
                모든 스케줄 제출
              </Button>
            </Grid>
          </Grid>
        ) : (
          <Typography variant="h6">홀 ID가 제공되지 않았습니다. 이전 단계로 돌아가 홀을 선택해주세요.</Typography>
        )}
      </Box>
    </LocalizationProvider>
  );
};

export default SchedulePage;
