import { useState } from "react";

const useFetchCanvasData = () => {
  const [rectangles, setRectangles] = useState([]);
  const [dbRectangles, setDbRectangles] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(1000);

  const fetchDbData = () => {
    console.log("Fetching DB data...");
    fetch(`http://localhost:3000/api/canvas?page=${page}&pageSize=${pageSize}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Fetched DB data:", data);
        setDbRectangles(data);
      })
      .catch((error) => console.error("Error fetching canvas data: ", error));
  };

  return { rectangles, setRectangles, dbRectangles, fetchDbData, setPage };
};

export default useFetchCanvasData;
