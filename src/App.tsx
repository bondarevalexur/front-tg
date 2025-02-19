import { useCallback, useState } from "react";
import "./App.css";
import WebRTCComponent from "./WEBRTCComponent.tsx";

function App() {
  const [value, setValue] = useState("");

  let socket: any;
  // useEffect(() => {
  //   socket = socket ?? new WebSocket("ws://localhost:3000");
  //
  //   // Обработчик для получения сообщений от сервера
  //   socket.onmessage = (event: any) => {
  //     const blob = event.data; // Получаем данные как Blob
  //     const reader = new FileReader();
  //     reader.onloadend = () => {
  //       const arrayBuffer = reader.result as ArrayBuffer; // Получаем ArrayBuffer
  //       const decoder = new TextDecoder("utf-8");
  //       const message = decoder.decode(arrayBuffer);
  //       console.log("Received message:", message); // Текстовое сообщение
  //     };
  //
  //     reader.readAsArrayBuffer(blob);
  //   };
  // }, []);

  const handelSend = useCallback(
    (value: string) => {
      console.log(value);
      socket.send(JSON.stringify(value));
    },
    [socket],
  );

  return (
    <>
      <h1>Vite + React</h1>
      <WebRTCComponent />
      <div className="card">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button onClick={() => handelSend(value)}>Send</button>
      </div>
    </>
  );
}

export default App;
