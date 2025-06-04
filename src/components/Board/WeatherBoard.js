import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, Typography, CircularProgress, Grid } from '@mui/material';
import { WiDaySunny, WiCloud, WiRain, WiSnow, WiFog, WiDaySunnyOvercast} from 'react-icons/wi';

const WeatherDashboard = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const response = await axios.get('/api/weather');
        setWeatherData(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, []);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{`Error: ${error.message}`}</Typography>;

  const renderWeatherIcon = (condition) => {
    switch (condition) {
      case 'Sunny':
        return <WiDaySunny size={50} color='#FFD700'/>;
      case 'clear sky':
        return <WiCloud size={50} color='#00FFFF'/>;
      case 'Partly cloudy':
      case 'Clouds':
        return <WiCloud size={50} color='#00FFFF'/>;
      case 'Rain':
      case 'Light rain':
      case 'Moderate rain':
      case 'Light rain shower':
        return <WiRain size={50} color='blue'/>;
      case 'Snow':
      case 'Light snow':
        return <WiSnow size={50} color='#FFF8DC'/>;
      case 'Fog':
      case 'Overcast':
        return <WiDaySunnyOvercast size={50} color='yellow' />
      case 'Mist':
        return <WiFog size={50} color='#FFD700'/>;
      default:
        return <WiCloud size={50} color='#00FFFF'/>;
    }
  };

  return (
    <Grid container justifyContent="center" style={{ marginTop: '20px', marginBottom: '20px', borderRadius: '10px', minHeight: '300px', maxHeight: '400px'}}>
      <Card style={{ width: '100%', borderRadius: '10px' }}>
        <CardContent>
          <Typography variant="h5" component="div">
            Weather Dashboard
          </Typography>
          {weatherData && (
            <div style={{ display: 'flex', flexDirection: 'column',  }}>
              <Typography variant="h6">{weatherData.name}</Typography>
              {renderWeatherIcon(weatherData.weather[0].main)}
              <Typography variant="body2">
                Temperature: {(weatherData.main.temp / 10).toFixed(1)}°C
              </Typography>
              <Typography variant="body2">
                Humidity: {weatherData.main.humidity}%
              </Typography>
              <Typography variant="body2">
                Condition: {weatherData.weather[0].description}
              </Typography>
            </div>
          )}
        </CardContent>
      </Card>
    </Grid>
  );
};

export default WeatherDashboard;
