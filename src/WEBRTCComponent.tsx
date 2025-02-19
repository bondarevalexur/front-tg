import { useCallback, useEffect, useRef, useState } from "react";

const WebRTCComponent = () => {
  const localVideoRef = useRef<any>(null);
  const remoteVideoRef = useRef<any>(null);
  const testRef = useRef<any>(null);
  const [peerConnection, setPeerConnection] = useState<any>();
  const [signalingServer1, setSignalingServer2] = useState<any>();

  useEffect(() => {
    if (testRef.current) return;

    testRef.current = "q2";

    const signalingServer = new WebSocket("ws://localhost:3000");
    setSignalingServer2(signalingServer);

    const peerConnection = new RTCPeerConnection();
    setPeerConnection(peerConnection);

    signalingServer.onopen = () => {
      console.log("Connected to signaling server");
    };

    signalingServer.onmessage = async (message) => {
      const blob = message.data; // Получаем данные как Blob
      const reader = new FileReader();
      reader.readAsArrayBuffer(blob);

      const text: string = await new Promise((resolve) => {
        reader.onloadend = () => {
          const arrayBuffer = reader.result as ArrayBuffer; // Получаем ArrayBuffer
          const decoder = new TextDecoder("utf-8");
          const message = decoder.decode(arrayBuffer);

          resolve(message);
        };
      });

      let data: any;
      try {
        data = JSON.parse(message.data);
      } catch (e) {
        data = JSON.parse(text);
      }

      switch (data.type) {
        case "offer": {
          console.log("пришел ОФЕР");

          peerConnection.onicecandidate = (event: any) => {
            if (event.candidate) {
              signalingServer.send(
                JSON.stringify({
                  type: "ice-candidate",
                  candidate: event.candidate,
                }),
              );
            }
          };

          peerConnection.ontrack = (event: any) => {
            console.log(event);
            remoteVideoRef.current.srcObject = event.streams[0];
          };

          await peerConnection.setRemoteDescription(
            new RTCSessionDescription(data.offer),
          );
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);

          console.log("отправил ОТВЕТ");
          signalingServer.send(
            JSON.stringify({
              type: "answer",
              answer: peerConnection.localDescription,
            }),
          );

          break;
        }
        case "answer": {
          if (peerConnection) {
            console.log("пришел ОТВЕТ");
            peerConnection.ontrack = (event: any) => {
              console.log(event);
              remoteVideoRef.current.srcObject = event.streams[0];
            };
            await peerConnection.setRemoteDescription(
              new RTCSessionDescription(data.answer),
            );
          }
          break;
        }
        case "ice-candidate": {
          if (peerConnection) {
            await peerConnection.addIceCandidate(
              new RTCIceCandidate(data.candidate),
            );
          }
          break;
        }
        default:
          console.error("Unknown message type:", data.type);
      }
    };

    const getLocalMediaStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localVideoRef.current.srcObject = stream;
        if (peerConnection) {
          stream
            .getTracks()
            .forEach((track) => peerConnection.addTrack(track, stream));
        }
      } catch (error) {
        console.error("Error accessing media devices.", error);
      }
    };

    getLocalMediaStream();

    signalingServer.onclose = () => {
      console.log("Disconnected from signaling server");
    };
  }, []);

  const a = useCallback(() => {
    const createOfferAndSend = async () => {
      if (peerConnection) {
        console.log("отправил ОФЕР");
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        signalingServer1.send(
          JSON.stringify({
            type: "offer",
            offer: peerConnection.localDescription,
          }),
        );
      }
    };

    createOfferAndSend();
  }, [signalingServer1]);

  const b = useCallback(() => {
    const createAnswerAndSend = async () => {
      if (peerConnection) {
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);

        signalingServer1.send(
          JSON.stringify({
            type: "answer",
            offer: peerConnection.localDescription,
          }),
        );
      }
    };

    createAnswerAndSend();
  }, [signalingServer1]);

  return (
    <div>
      <h2>WebRTC Example</h2>
      <video ref={localVideoRef} autoPlay muted style={{ width: "300px" }} />
      <video
        ref={remoteVideoRef}
        autoPlay
        style={{ width: "350px", border: "1px solid blue" }}
      />
      <button onClick={a}>Start Call</button>
      <button onClick={b}>otvet</button>
    </div>
  );
};

export default WebRTCComponent;
