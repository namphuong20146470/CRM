import React from 'react';
import {rooms} from "./Rooms";

export const ToaTrungTam = `${process.env.PUBLIC_URL}/image/ToaTrungTam.jpg`;
export const Sanbong = `${process.env.PUBLIC_URL}/image/Sanbong.jpg`;
export const KhuD = `${process.env.PUBLIC_URL}/image/KhuD.jpg`;
export const KhuE = `${process.env.PUBLIC_URL}/image/KhuE.jpg`;
// export const BalconyRoom = `${process.env.PUBLIC_URL}/image/balcony_room.jpg`;

export const roomList = rooms;

export const imageRoom = new Map();
imageRoom.set('ToaTrungTam', ToaTrungTam);
imageRoom.set('Sanbong',Sanbong);
imageRoom.set('KhuD',KhuD);
imageRoom.set('KhuE',KhuE);
// imageRoom.set('BalconyRoom', BalconyRoom);