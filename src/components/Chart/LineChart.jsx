import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import axios from '../../api/axios';
import { Chart, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { format } from 'date-fns';
import { Select, MenuItem, FormControl, InputLabel, Box } from '@mui/material';

Chart.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const LineChart = () => {
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('62616bb00aa850983c21b11b');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/v1/statistic?filter=${filter}`);
        const apiData = response.data.data;
        const pm25Data = apiData.map(item => item.avgPm25);
        const mq135Data = apiData.map(item => item.avgMq135);
        // const coData = apiData.map(item => item.avgCO); 
        const temperatureData = apiData.map(item => item.avgTemperature);
        const humidityData = apiData.map(item => item.avgHumidityAir);

        // Định nghĩa các màu cho từng dataset
        const colors = ['#006400', '#A52A2A', '#8A2BE2', '#7FFF00', '#00FFFF'];
        const dates = Array.from({ length: 7 }, (_, i) => new Date(Date.now() - i * 24 * 60 * 60 * 1000));

        // Định dạng lại các ngày dưới dạng "DD/MM/YYYY"
        const formattedLabels = dates.map(date => format(date, 'dd/MM/yyyy')).reverse();

        // Tạo dữ liệu cho biểu đồ
        const data = {
          labels: formattedLabels, // Đảo ngược mảng để labels hiển thị từ cũ đến mới
          datasets: [
            {
              label: 'PM 2.5',
              data: pm25Data,
              fill: false,
              borderColor: colors[0],
              tension: 0.1,
            },
            {
              label: 'MQ135',
              data: mq135Data,
              fill: false,
              borderColor: colors[1],
              tension: 0.1,
            },
            // {
            //   label: 'CO',
            //   data: coData,
            //   fill: false,
            //   borderColor: colors[2],
            //   tension: 0.1,
            // },
            {
              label: 'Temperature',
              data: temperatureData,
              fill: false,
              borderColor: colors[3],
              tension: 0.1,
            },
            {
              label: 'Humidity',
              data: humidityData,
              fill: false,
              borderColor: colors[4],
              tension: 0.1,
            },
          ],
        };

        setChartData(data);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    fetchData();
  }, [filter]);

  const options = {
    plugins: {
      title: {
        display: true,
        text: 'Data History',
        font: {
          size: 16,
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Days',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Value',
        },
      },
    },
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <Box sx={{ p: 3, backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
      <FormControl sx={{ mb: 2, minWidth: 120 }}>
        <InputLabel id="filter-select-label" sx={{ color: 'black' }}>Filter</InputLabel>
        <Select
          labelId="filter-select-label"
          id="filter-select"
          value={filter}
          label="Filter"
          onChange={(e) => setFilter(e.target.value)}
          sx={{
            backgroundColor: 'white',
            borderRadius: '4px',
            '.MuiOutlinedInput-notchedOutline': {
              borderColor: 'transparent',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'transparent',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: 'transparent',
            },
          }}
        >
          <MenuItem value="62616bb00aa850983c21b11b">Tòa Trung Tâm</MenuItem>
          <MenuItem value="62616bcfadb8c6e0f01e49dc">Sân Vận Động</MenuItem>
          <MenuItem value="62618a2af73fe211513926c8">Khu D</MenuItem>
          <MenuItem value="62a9dc30092f09dc52362d94">Khu E</MenuItem>
        </Select>
      </FormControl>
      {chartData && <Line data={chartData} options={options} />}
    </Box>
  );
};

export default LineChart;