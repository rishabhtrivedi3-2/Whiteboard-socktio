import React, { useEffect, useRef, useState } from "react";
import { Line, Stage, Layer, Text, Rect, Circle, Arrow } from "react-konva";

import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import socketIOClient from 'socket.io-client';



import { RxBorderWidth } from "react-icons/rx";
import { PiExportBold } from "react-icons/pi";
import { FaEraser, FaPen } from "react-icons/fa";
import { RiShapeLine, RiDragMove2Fill } from "react-icons/ri";
import { FaRegCircle } from "react-icons/fa";
import { BiText } from "react-icons/bi";
import Room from "./frontend/Room"
const ENDPOINT = 'http://localhost:5000';

function Whiteboard() {
  const [tool, setTool] = useState("pen");
  const [lines, setLines] = useState([]);
  const [color, setColor] = useState("#df4b26");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [arrowDirection, setArrowDirection] = useState("right");
  const [stageWidth, setStageWidth] = useState(window.innerWidth);
  const [stageHeight, setStageHeight] = useState(window.innerHeight);
  const [redo, setRedo] = useState([]);
  const [textInput, setTextInput] = useState("");
  const [temp, setTemp] = useState([]);
  const isDrawing = useRef(false);
  const StageRef = useRef(null);
  const socket = socketIOClient(ENDPOINT);
  const [roomid, setid] = useState(0);
  const [userId, setUserId] = useState(''); // Store user ID

  useEffect(() => {
    const handleResize = () => {
      setStageWidth(window.innerWidth);
      setStageHeight(window.innerHeight);
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };

  }, []);
  useEffect(() => {
    socket.on('connect', () => {

      socket.emit('createroom', roomid); // Join the specified room
      socket.emit('drawing_event', lines);
    });
    
    socket.on('drawing_event', (data) => {
      console.log(data);
      setLines( data);

    },[lines]);
    
    socket.on('createroom', (data) => {
      // setUserId(data); // Store user ID
      
    });
    
    // socket.on('disconnect', () => {
    //   console.log('Disconnected from server');
    // });

    // return () => {
    //   socket.disconnect();
    // };
  }, []);



  // setLines([...lines, temp]);
  // Emit drawing data to the server when lines change
  useEffect(() => {
    // socket.on("drawing_event", (data) => {
    //       console.log(lines)

    // })

  }, []);

  // useEffect(() => {
  //     socket.emit('drawing_event', (lines));

  // }, [lines])

  //  setLines([...lines]);

  const handleExportImage = (e) => {
    const fileName = window.prompt("Save As ");
    if (fileName) {
      const link = e.currentTarget;
      link.setAttribute("download", `${fileName}.png`);
      const image = StageRef.current.toDataURL();
      link.setAttribute("href", image);
    }
  };

  const handleExportPDF = (e) => {
    const fileName = window.prompt("Save As ");
    if (fileName) {
      const imgData = StageRef.current.toDataURL();
      const pdf = new jsPDF();
      pdf.addImage(imgData, "JPEG", 0, 0);
      pdf.save(`${fileName}.pdf`);
    }
  };

  const ClickUndo = () => {
    if (lines.length === 0) return;
    const lastLine = lines.pop();
    setRedo([...redo, lastLine])
    setLines([...lines]);
  };

  const ClickRedo = () => {
    if (redo.length === 0) return;
    const lastRedo = redo.pop();
    setLines([...lines, lastRedo]);
  };

  const handleMouseDown = (e) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    switch (tool) {
      case "rectangle":
        setLines([...lines, { tool, x: pos.x, y: pos.y, width: 0, height: 0, color, strokeWidth }]);
        break;
      case "circle":
        setLines([...lines, { tool, x: pos.x, y: pos.y, radius: 0, color, strokeWidth }]);
        break;
      case "arrow":
        setLines([...lines, { tool, points: [pos.x, pos.y, pos.x, pos.y], color, strokeWidth, pointerLength: 10, pointerWidth: 10, direction: arrowDirection }]);
        break;
      case "text":
        setLines([...lines, { tool, text: textInput, x: pos.x, y: pos.y, color, fontSize: strokeWidth * 5 }]);
        break;
      default:
        setLines([...lines, { tool, points: [pos.x, pos.y], color, strokeWidth }]);

        socket.emit("whiteboard_event", (lines))

    }
  };
  // socket.emit("drawing_event", (lines));
  const handleMouseMove = (e) => {
    if (!isDrawing.current) return;
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    const lastLine = lines[lines.length - 1];
    if (!lastLine) return;

    switch (tool) {
      case "rectangle":
        lastLine.width = point.x - lastLine.x;
        lastLine.height = point.y - lastLine.y;
        break;
      case "circle":
        lastLine.radius = Math.sqrt(Math.pow(point.x - lastLine.x, 2) + Math.pow(point.y - lastLine.y, 2));
        break;
      case "arrow":
        lastLine.points = [lastLine.points[0], lastLine.points[1], point.x, point.y];
        lastLine.direction = arrowDirection;
        break;
      case "pen":
      case "eraser":
        lastLine.points = lastLine.points.concat([point.x, point.y]);
        break;
      default:
        break;
    }
    setLines([...lines]);
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };
  socket.on("connect_room", function (data) {
    console.log(data)

    // setid(data);
  })

  return (
    <>
      <Room />
      <div>
        <p>user:          {roomid && roomid}
        </p>

      </div>


      <div className="container mx-auto md:text-4xl">
        <div className="border-1 border-black flex flex-wrap justify-evenly shadow-md rounded-md items-center w-auto">
          <div className="flex flex-row justify-between">
            <input
              type="color"
              className="rounded-lg form-control-color"
              onChange={(e) => setColor(e.target.value)}
            />
            <select
              aria-label="Default select example"
              onChange={(e) => setStrokeWidth(Number(e.target.value))}
            >
              <option value="1.25">1.25</option>
              <option value="2.5">2.5</option>
              <option value="3.75">3.75</option>
              <option value="5">5</option>
              <option value="8">8</option>
              <option value="10">10</option>
            </select>
          </div>
          <div className="flex flex-row justify-center space-x-3">
            <button
              className={`${tool === "circle" ? "bg-slate-400" : ""} border px-2 py-2 rounded-md`}
              onClick={() => setTool("circle")}
            >
              <FaRegCircle />
            </button>
            <button onClick={() => setTool("drag")}>
              <RiDragMove2Fill />
            </button>
            <button
              className="border bg-slate-600/90 rounded-2xl ring-1 py-1 px-2 text-white"
              onClick={ClickUndo}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="currentColor"
                className="bi bi-arrow-counterclockwise"
                viewBox="0 0 16 16"
              >
                <path
                  fillRule="evenodd"
                  d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2z"
                />
                <path d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466" />
              </svg>
            </button>
            <button
              className="border bg-slate-600/90 rounded-2xl ring-1 py-1 px-2 text-white"
              onClick={ClickRedo}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                fill="currentColor"
                className="bi bi-arrow-clockwise"
                viewBox="0 0 16 16"
              >
                <path
                  fillRule="evenodd"
                  d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2z"
                />
                <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466" />
              </svg>
            </button>
            <div className="text-3xl">
              <a
                className="w-5"
                data-bs-toggle="dropdown"
                href="#"
                role="button"
                aria-expanded="false"
              >
                <PiExportBold />
              </a>
              <ul className="dropdown-menu">
                <li>
                  <a
                    className="dropdown-item"
                    href="download_link"
                    onClick={handleExportImage}
                  >
                    JPG
                  </a>
                </li>
                <li>
                  <a
                    className="dropdown-item"
                    href="download_link"
                    onClick={handleExportPDF}
                  >
                    PDF
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <button
            className={`${tool === "pen" ? "bg-slate-400" : ""} border px-1 py-1 rounded-md`}
            onClick={() => setTool("pen")}
          >
            <FaPen />
          </button>
          <button
            className={`${tool === "eraser" ? "bg-slate-400" : ""} border px-1 py-1 rounded-md`}
            onClick={() => setTool("eraser")}
          >
            <FaEraser />
          </button>
          <button
            className={`${tool === "rectangle" ? "bg-slate-400" : ""} border px-1 py-1 rounded-md`}
            onClick={() => setTool("rectangle")}
          >
            <RiShapeLine />
          </button>
          <button
            className={`${tool === "arrow" ? "bg-slate-400" : ""} border px-1 py-1 rounded-md`}
            onClick={() => setTool("arrow")}
          >
            arrow
          </button>
          <button
            className={`${tool === "text" ? "bg-slate-400" : ""} border px-1 py-1 rounded-md`}
            onClick={() => setTool("text")}
          >
            <BiText />
          </button>
          {tool === "text" && (
            <input
              type="text"
              value={textInput}
              className="border rounded-md px-2 py-1"
              onChange={(e) => setTextInput(e.target.value)}
            />
          )}
        </div>
        <div className="w-full overflow-hidden h-auto">
          <Stage
            ref={StageRef}
            width={stageWidth}
            height={stageHeight}
            onMouseDown={handleMouseDown}
            onMousemove={handleMouseMove}
            onMouseup={handleMouseUp}
            className="bg-slate-500 shadow-2xl"
          >
            <Layer>
              {lines.map((line, i) => {
                switch (line.tool) {
                  case "pen":
                  case "eraser":
                    return (
                      <Line
                        key={i}
                        points={line.points}
                        stroke={line.color}
                        strokeWidth={line.strokeWidth}
                        tension={0.5}
                        lineCap="round"
                        globalCompositeOperation={
                          line.tool === "eraser" ? "destination-out" : "source-over"
                        }
                      />
                    );
                  case "rectangle":
                    return (
                      <Rect
                        key={i}
                        x={line.x}
                        y={line.y}
                        width={line.width}
                        height={line.height}
                        stroke={line.color}
                        strokeWidth={line.strokeWidth}
                        fill="transparent"
                      />
                    );
                  case "circle":
                    return (
                      <Circle
                        key={i}
                        x={line.x}
                        y={line.y}
                        radius={line.radius}
                        stroke={line.color}
                        strokeWidth={line.strokeWidth}
                      />
                    );
                  case "arrow":
                    return (
                      <Arrow
                        key={i}
                        points={line.points}
                        stroke={line.color}
                        strokeWidth={line.strokeWidth}
                        pointerLength={line.pointerLength}
                        pointerWidth={line.pointerWidth}
                      />
                    );
                  case "text":
                    return (
                      <Text
                        key={i}
                        x={line.x}
                        y={line.y}
                        text={line.text}
                        fontSize={line.fontSize}
                        fill={line.color}
                      />
                    );
                  default:
                    return null;
                }
              })}
            </Layer>
          </Stage>

        </div>
      </div>
    </>
  );
}

export default Whiteboard;
