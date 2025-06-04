import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, Typography, Grid } from '@mui/material';

import './AqiBoard.css';
const AqiBoard = ({ city }) => {
    const [aqiData, setAqiData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchAqiData = async () => {
            try {
                const response = await axios.get(`/api/aqi`);
                setAqiData(response.data.data);
                setLoading(false);
            } catch (error) {
                setError(error);
                setLoading(false);
            }
        };

        fetchAqiData();
    }, [city]);

    if (loading) return <div style={{ textAlign: 'center', marginTop: '20px', minHeight: '300px', maxHeight: '400px' }}>Loading...</div>;
    if (error) return <div style={{ textAlign: 'center', marginTop: '20px', minHeight: '300px', maxHeight: '400px' }}>Error: {error.message}</div>;

    return (
        <Grid container justifyContent="center" style={{ marginTop: '20px', marginBottom: '20px' ,minHeight: '300px', maxHeight: '400px'}}>
        <Card style={{ width: '100%', borderRadius: '10px'}}>
            <CardContent>
                <Typography variant="h5" component="div">
                    Air Quality Index
                </Typography>
                <Typography variant="h6" component="div">
                    Ho Chi Minh City
                </Typography>
                <Typography variant="body2" style={{ marginTop: '10px' }}>
                    AQI: {aqiData && aqiData.aqi}
                </Typography>
                <Typography variant="body2">
                    Dominant Pollutant: {aqiData && aqiData.dominentpol}
                </Typography>
                <div>
                    <Typography variant="body2">
                        PM 2.5: {aqiData && aqiData.iaqi && aqiData.iaqi.pm25 && aqiData.iaqi.pm25.v}
                    </Typography>
                </div>
            </CardContent>
        </Card>
    </Grid>
    );
};

export default AqiBoard;