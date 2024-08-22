import React, { useState } from 'react';

// 좌석 등급을 위한 색상 매핑
const seatColors = {
  '-1': '#CCCCCC', // 빈 좌석 - 회색
  'B': '#FFFF00',  // B - 노랑
  'A': '#0000FF',  // A - 파랑
  'S': '#009000',  // S - 녹색
  'R': '#FF0000',  // R - 빨강
};

// 좌석 등급 번호를 좌석 등급 문자로 매핑
const seatClassMap = {
  0: 'B',
  1: 'A',
  2: 'S',
  3: 'R',
};

const SeatLayoutPage = ({ showDetail, onSeatLayoutSubmit, priceBySeatClass }) => {
  const initialSeatLayout = [...Array(160).fill(-1)];
  const [seatLayout, setSeatLayout] = useState(initialSeatLayout);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedSeatClass, setSelectedSeatClass] = useState('B');

  const handleSeatClick = (index) => {
    const newLayout = [...seatLayout];
    newLayout[index] = selectedSeatClass;
    setSeatLayout(newLayout);
  };

  const handleMouseDown = (index) => {
    setIsDragging(true);
    handleSeatClick(index);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseEnter = (index) => {
    if (isDragging) {
      handleSeatClick(index);
    }
  };

  const handleSeatClassChange = (seatClass) => {
    setSelectedSeatClass(seatClass);
  };

  const handleSubmit = () => {
    const seats = seatLayout.map((seat_class, index) => ({
      seat_col: index % 16,
      seat_row: Math.floor(index / 16),
      seat_class: Object.keys(seatClassMap).find(key => seatClassMap[key] === seat_class),
      show_detail_id: showDetail.show_detail_id,
    }));
    onSeatLayoutSubmit(seats);
  };

  const handleReset = () => {
    setSeatLayout(initialSeatLayout);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>좌석 배치 설정</h2>
      <div style={styles.priceInfoContainer}>
        {priceBySeatClass.map((price) => {
          const seatClass = seatClassMap[price.price_by_seat_class_seat_class];
          return (
            <div
              key={seatClass}
              style={{
                ...styles.seatClass,
                backgroundColor: seatColors[seatClass],
              }}
              onClick={() => handleSeatClassChange(seatClass)}
            >
              {`등급: ${seatClass}, 가격: ${price.price_by_seat_class_price}원`}
            </div>
          );
        })}
      </div>
      <div
        style={styles.seatGrid}
        onMouseLeave={handleMouseUp}
      >
        {seatLayout.map((seat, index) => (
          <div
            key={index}
            onMouseDown={() => handleMouseDown(index)}
            onMouseUp={handleMouseUp}
            onMouseEnter={() => handleMouseEnter(index)}
            style={{
              ...styles.seat,
              backgroundColor: seatColors[seat],
            }}
          ></div>
        ))}
      </div>
      <div style={styles.buttonContainer}>
        <button onClick={handleSubmit} style={styles.submitButton}>
          좌석 배치 제출
        </button>
        <button onClick={handleReset} style={styles.resetButton}>
          초기화
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f0f0f0',
    padding: '20px',
  },
  heading: {
    marginBottom: '20px',
    fontSize: '24px',
    color: '#333',
  },
  priceInfoContainer: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
  },
  seatClass: {
    padding: '10px 20px',
    cursor: 'pointer',
    color: '#fff',
    borderRadius: '5px',
  },
  seatGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(16, 30px)',
    gap: '5px',
    marginBottom: '20px',
  },
  seat: {
    width: '30px',
    height: '30px',
    border: '1px solid black',
    cursor: 'pointer',
  },
  buttonContainer: {
    display: 'flex',
    gap: '10px',
  },
  submitButton: {
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  resetButton: {
    padding: '10px 20px',
    fontSize: '16px',
    backgroundColor: '#ff0000',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default SeatLayoutPage;
