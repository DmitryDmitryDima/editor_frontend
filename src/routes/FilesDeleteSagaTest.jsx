import React, {useEffect, useState} from "react";
import {Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material";
import { DataGrid } from '@mui/x-data-grid';


export function FilesDeleteSagaTest() {

    const [data, setData] = useState({
        filesToDelete:[], fileIdempotentProcesses:[], fileDeletingCompensationTransactions:[]
    });

    const [consoleData, setConsoleData] = useState(null);
    const [socket, setSocket] = useState(null);


    const url = "/api/test/delete/files";




    // подписка на вебсокет
    useEffect(() => {
        // 1. Создаем WebSocket-соединение
        const ws = new WebSocket('ws://localhost:8080/logging');

        // 2. Обработчики событий
        ws.onopen = () => {
            console.log('WebSocket connected');
        };

        ws.onmessage = (event) => {
            const newMessage = event.data;
            setConsoleData(newMessage);
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        ws.onclose = () => {
            console.log('WebSocket disconnected');
        };

        setSocket(ws);

        // 3. Функция очистки (закрытие соединения при размонтировании)
        return () => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        };
    }, []); // Пустой массив зависимостей = запуск только при монтировании





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
        <p>Файлы к удалению</p>
        <TableContainer component={Paper} sx={{ border: "2px solid red" }}>
            <Table  aria-label="simple table">
                <TableHead >
                    <TableRow>
                        <TableCell>Index</TableCell>
                        <TableCell align="right">Name</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.filesToDelete.map((row) => (

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

        <p>Процессы блокировщики</p>
        <TableContainer component={Paper} sx={{ border: "2px solid green" }}>
            <Table  aria-label="simple table">
                <TableHead >
                    <TableRow>
                        <TableCell>Id</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.fileIdempotentProcesses.map((row) => (

                        <TableRow
                            key={row.id}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell component="th" scope="row">
                                {row.id}
                            </TableCell>



                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>

        <p>Компенсационные транзакции</p>
        <TableContainer component={Paper} sx={{ border: "2px solid blue" }}>
            <Table  aria-label="simple table">
                <TableHead >
                    <TableRow>
                        <TableCell>Id</TableCell>
                        <TableCell align="right">File id</TableCell>
                        <TableCell align="right">Step</TableCell>
                        <TableCell align="right">Attempts</TableCell>

                    </TableRow>
                </TableHead>
                <TableBody>
                    {data.fileDeletingCompensationTransactions.map((row) => (

                        <TableRow
                            key={row.id}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell component="th" scope="row">
                                {row.id}
                            </TableCell>
                            <TableCell
                                align='right'>
                                {row.file_id}
                            </TableCell>

                            <TableCell
                                align='right'>
                                {row.step}
                            </TableCell>

                            <TableCell
                                align='right'>
                                {row.attempts}
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