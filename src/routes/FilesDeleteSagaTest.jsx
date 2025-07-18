import React, {useEffect, useState} from "react";
import {Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow} from "@mui/material";
import { DataGrid } from '@mui/x-data-grid';


export function FilesDeleteSagaTest() {

    const [data, setData] = useState({
        filesToDelete:[], fileIdempotentProcesses:[], fileDeletingCompensationTransactions:[]
    });

    const url = "/api/test/delete/files";








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

    return <div>
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



    </div>
}