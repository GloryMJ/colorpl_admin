import React, { useState } from 'react';
import { Box, Typography, Grid, Button, TextField, MenuItem, Select, FormControl, InputLabel } from '@mui/material';

const PriceBySeatClassPage = ({ showDetail, onPricesSubmit }) => {
  const [prices, setPrices] = useState([{ price_by_seat_class_seat_class: 0, price_by_seat_class_price: 10000 }]); // 기본 B 클래스

  const handleAddPrice = () => {
    if (prices.length < 5) {
      setPrices([...prices, { price_by_seat_class_seat_class: 0, price_by_seat_class_price: 0 }]);
    } else {
      alert('최대 5개의 가격만 설정할 수 있습니다.');
    }
  };

  const handleSeatClassChange = (index, value) => {
    const updatedPrices = prices.map((price, i) =>
      i === index ? { ...price, price_by_seat_class_seat_class: Number(value) } : price
    );
    setPrices(updatedPrices);
  };

  const handlePriceChange = (index, value) => {
    const updatedPrices = prices.map((price, i) =>
      i === index ? { ...price, price_by_seat_class_price: Number(value) } : price
    );
    setPrices(updatedPrices);
  };

  const handleRemovePrice = (index) => {
    const updatedPrices = prices.filter((_, i) => i !== index);
    setPrices(updatedPrices);
  };

  const handleSubmit = () => {
    // 가격 정보를 상위 컴포넌트로 전달
    onPricesSubmit(prices);
  };

  return (
    <Box sx={styles.container}>
      <Typography variant="h4" gutterBottom>
        좌석 등급별 가격 설정
      </Typography>
      {prices.map((price, index) => (
        <Grid container spacing={2} key={index} sx={styles.priceRow}>
          <Grid item xs={4}>
            <FormControl fullWidth>
              <InputLabel>좌석 등급</InputLabel>
              <Select
                value={price.price_by_seat_class_seat_class}
                onChange={(e) => handleSeatClassChange(index, e.target.value)}
              >
                <MenuItem value={0}>B</MenuItem>
                <MenuItem value={1}>A</MenuItem>
                <MenuItem value={2}>S</MenuItem>
                <MenuItem value={3}>R</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="가격"
              type="number"
              value={price.price_by_seat_class_price}
              onChange={(e) => handlePriceChange(index, e.target.value)}
              fullWidth
            />
          </Grid>
          <Grid item xs={2}>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => handleRemovePrice(index)}
              fullWidth
            >
              삭제
            </Button>
          </Grid>
        </Grid>
      ))}
      <Box sx={styles.buttonContainer}>
        <Button variant="outlined" onClick={handleAddPrice} disabled={prices.length >= 5}>
          가격 추가
        </Button>
        <Button variant="contained" onClick={handleSubmit}>
          가격 제출
        </Button>
      </Box>
    </Box>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f9f9f9',
    padding: '20px',
  },
  priceRow: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '10px',
  },
  buttonContainer: {
    marginTop: '20px',
    display: 'flex',
    gap: '10px',
  },
};

export default PriceBySeatClassPage;
