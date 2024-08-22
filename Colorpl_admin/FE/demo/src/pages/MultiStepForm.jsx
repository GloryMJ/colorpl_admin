import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import TheaterSearchPage from './TheaterSearchPage';
import ShowDetailPage from './ShowDetailPage';
import PriceBySeatClassPage from './PriceBySeatClassPage';
import SeatLayoutPage from './SeatLayoutPage';
import ShowSchedulePage from './ShowSchedulePage';
import api from '../api';
import { Box, Button, Typography, List, ListItem, ListItemText, Paper } from '@mui/material';

const MultiStepForm = () => {
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    selectedHallId: null,
    showDetail: null,
    priceDetails: [],
    seatLayout: [],
    schedule: [], 
  });

  const navigate = useNavigate(); 

  const steps = ['극장 선택', '공연 정보', '가격 설정', '좌석 배치', '스케줄 설정', '요약'];

  const handleNextStep = () => {
    setStep((prevStep) => prevStep + 1);
  };

  const handlePrevStep = () => {
    setStep((prevStep) => prevStep - 1);
  };

  const handleTheaterSelect = (hallId) => {
    setFormData((prev) => ({ ...prev, selectedHallId: hallId }));
    handleNextStep();
  };

  const handleShowDetailSubmit = (detail) => {
    setFormData((prev) => ({ ...prev, showDetail: detail }));
    handleNextStep();
  };

  const handlePricesSubmit = (prices) => {
    setFormData((prev) => ({ ...prev, priceDetails: prices }));
    handleNextStep();
  };

  const handleSeatLayoutSubmit = (layout) => {
    setFormData((prev) => ({ ...prev, seatLayout: layout }));
    handleNextStep();
  };

  const handleScheduleSubmit = (scheduleData) => {
    setFormData((prev) => ({ ...prev, schedule: scheduleData }));
    handleNextStep();
  };

  const handleFinalSubmit = async () => {
    try {
        const showDetailId = formData.showDetail?.show_detail_id;

        const finalData = {
            show_detail: formData.showDetail,
            prices: formData.priceDetails.map(price => ({
                ...price,
                show_detail_id: showDetailId,  // show_detail_id 추가
            })),
            seats: formData.seatLayout.map(seat => ({
                ...seat,
                show_detail_id: showDetailId,  // show_detail_id 추가
            })),
            schedules: formData.schedule.map(schedule => ({
                ...schedule,
                show_detail_id: showDetailId,  // show_detail_id 추가
            })),
        };

        console.log('Final data being submitted:', JSON.stringify(finalData, null, 2));

        const response = await api.post('/vm/register_show', finalData);
        alert('공연 등록이 완료되었습니다.');
        
        navigate('/success'); // 성공 페이지로 이동
    } catch (error) {
        console.error('Error during final submission:', error);
        if (error.response) {
            console.error('Response data:', error.response.data);
        }
        alert('공연 등록 중 오류가 발생했습니다.');
    }
  };

  const renderSummary = () => (
    <Box>
      <Typography variant="h5" gutterBottom>공연 등록 요약</Typography>
      <Paper elevation={3} sx={{ padding: '16px', marginBottom: '16px' }}>
        <Typography variant="h6">공연 정보</Typography>
        <List>
          <ListItem>
            <ListItemText primary="공연 이름" secondary={formData.showDetail?.show_detail_name} />
          </ListItem>
          <ListItem>
            <ListItemText primary="공연 카테고리" secondary={formData.showDetail?.show_detail_category} />
          </ListItem>
          <ListItem>
            <ListItemText primary="공연 지역" secondary={formData.showDetail?.show_detail_area} />
          </ListItem>
          <ListItem>
            <ListItemText primary="출연진" secondary={formData.showDetail?.show_detail_cast} />
          </ListItem>
        </List>
      </Paper>
      
      <Paper elevation={3} sx={{ padding: '16px', marginBottom: '16px' }}>
        <Typography variant="h6">가격 정보</Typography>
        <List>
          {formData.priceDetails.map((price, index) => (
            <ListItem key={index}>
              <ListItemText primary={`등급: ${price.price_by_seat_class_seat_class}`} secondary={`가격: ${price.price_by_seat_class_price}원`} />
            </ListItem>
          ))}
        </List>
      </Paper>

      <Paper elevation={3} sx={{ padding: '16px', marginBottom: '16px' }}>
        <Typography variant="h6">스케줄 정보</Typography>
        <List>
          {formData.schedule.map((schedule, index) => (
            <ListItem key={index}>
              <ListItemText primary={`날짜 및 시간: ${new Date(schedule.show_schedule_date_time).toLocaleString()}`} />
            </ListItem>
          ))}
        </List>
      </Paper>
      
      <Button variant="contained" color="primary" onClick={handleFinalSubmit}>
        최종 제출
      </Button>
    </Box>
  );

  const renderStep = () => {
    switch (step) {
      case 0:
        return <TheaterSearchPage onHallSelect={handleTheaterSelect} />;
      case 1:
        return <ShowDetailPage selectedHallId={formData.selectedHallId} onShowDetailSubmit={handleShowDetailSubmit} />;
      case 2:
        return <PriceBySeatClassPage showDetail={formData.showDetail} onPricesSubmit={handlePricesSubmit} />;
      case 3:
        return <SeatLayoutPage showDetail={formData.showDetail} priceBySeatClass={formData.priceDetails} onSeatLayoutSubmit={handleSeatLayoutSubmit} />;
      case 4:
        return <ShowSchedulePage showDetail={formData.showDetail} hallId={formData.selectedHallId} onScheduleSubmit={handleScheduleSubmit} />;
      case 5:
        return renderSummary();
      default:
        return <div>단계를 찾을 수 없습니다.</div>;
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <Typography variant="h3" gutterBottom>공연 등록</Typography>
      <div>{renderStep()}</div>
      <div style={{ marginTop: '20px' }}>
        {step > 0 && (
          <Button variant="outlined" onClick={handlePrevStep} style={{ marginRight: '10px' }}>
            이전
          </Button>
        )}
        {step < steps.length - 1 && (
          <Button variant="contained" onClick={handleNextStep}>
            다음
          </Button>
        )}
      </div>
    </div>
  );
};

export default MultiStepForm;
