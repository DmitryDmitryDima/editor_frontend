import React, {useEffect, useRef, useState} from "react";
import {useLocation} from "react-router-dom";
import {Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material";
import { DataGrid } from '@mui/x-data-grid';


export function AppDashboard() {

    const [data, setData] = useState({
        files:[]
    });

    const [consoleData, setConsoleData] = useState(null);
    const  socketRef = useRef(null);

    const location=  useLocation();


    const url = "/api/test/dashboard";




    // подписка на вебсокет
    useEffect(() => {
        // закрываем прошлое соединение
        if (socketRef.current) {
            socketRef.current.close();
        }
        // 1. Создаем WebSocket-соединение
        const ws = new WebSocket('/logging');

        // 2. Обработчики событий
        ws.onopen = () => {
            console.log('WebSocket connected');
        };

        ws.onmessage = (event) => {
            console.log(event);
            const newMessage = event.data;
            setConsoleData(newMessage);
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        ws.onclose = () => {
            console.log('WebSocket disconnected');
        };

        socketRef.current = ws;

        // 3. Функция очистки (закрытие соединения при размонтировании)
        return () => {
            if (ws.readyState !== WebSocket.CLOSED) {

                ws.close();
            }

        };
    }, [location.pathname]); // зависимость от location





    // содержимое таблиц


    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(url);

                // Проверяем, успешен ли ответ
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                // Дожидаемся преобразования ответа в JSON
                const result = await response.json();

                setData(result);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        // Initial fetch on component mount
        fetchData();



        const intervalId = setInterval(fetchData, 500); // Fetch every 5 seconds

        // Cleanup function to clear the interval
        return () => clearInterval(intervalId);
    }, []); // Empty dependency array to run effect only once on mount

    return <div >
        <p>Файлы проекта</p>
        <TableContainer component={Paper} sx={{ border: "2px solid red" }}>
            <Table  aria-label="simple table">
                <TableHead >
                    <TableRow>
                        <TableCell>Index</TableCell>
                        <TableCell align="right">Name</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.files.map((row) => (

                        <TableRow
                            key={row.index}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell component="th" scope="row">
                                {row.index}
                            </TableCell>
                            <TableCell
                                align='right'>
                                {row.data}
                            </TableCell>


                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>



        <p>Последнее действие в консоли</p>
        <p>{consoleData}</p>


    </div>
}