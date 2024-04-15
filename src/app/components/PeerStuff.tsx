// const PeerStuff = () => {
//     const socket = io('http://localhost:5000', {
//         transports: ['websocket', 'polling', 'flashsocket'],
//         withCredentials: true
//     });

//     socket.emit("join", {
//         room: "1234",
//         // name: user.username,
//     });
//     const peerConnection = new RTCPeerConnection();

//     const channel = peerConnection.createDataChannel("sendChannel");

//     socket.on("room_users", (data) => {
//         console.log("join:" + data);
//         createOffer()
//     });

//     const createOffer = () => {
//         console.log("create offer");
//         peerConnection
//             .createOffer()
//             .then(sdp => {
//                 console.log(`sdp => => => ${sdp}`)
//                 peerConnection.setLocalDescription(sdp);
//                 socket.emit("offer", sdp);
//             })
//             .catch(error => {
//                 console.log(error);
//             });
//     };

//     socket.on("getOffer", (sdp) => {
//         console.log("get offer:" + sdp);
//         createAnswer(sdp);
//     });

//     const createAnswer = (sdp: any) => {
//         peerConnection.setRemoteDescription(sdp).then(() => {
//             console.log("answer set remote description success");
//             peerConnection
//                 .createAnswer()
//                 .then(sdp1 => {
//                     console.log("create answer");
//                     peerConnection.setLocalDescription(sdp1);
//                     socket.emit("answer", sdp1);
//                 })
//                 .catch(error => {
//                     console.log(error);
//                 });
//         });

//     };

//     socket.on("getAnswer", (sdp) => {
//         console.log("get answer:" + sdp);
//         peerConnection.setRemoteDescription(sdp);
//     });

//     peerConnection.onicecandidate = e => {
//         if (e.candidate) {
//             console.log("onicecandidate");
//             socket.emit("candidate", e.candidate);
//         }
//     };
//     peerConnection.oniceconnectionstatechange = e => {
//         console.log(e);
//     };

//     peerConnection.onconnectionstatechange = e => {
//     }

//     socket.on("getCandidate", (candidate) => {
//         peerConnection.addIceCandidate(new RTCIceCandidate(candidate)).then(() => {
//             console.log("candidate add success");
//         });

//     });

// }


