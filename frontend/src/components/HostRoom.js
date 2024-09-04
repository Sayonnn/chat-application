import React, { useEffect, useState } from 'react';
import s from '../css/style.module.css';
import layout from '../css/layout.module.css';
import { icons } from '../utilities/icons';

function HostRoom({ userName, roomName, closePage, io }) {
  const [participants, setParticipants] = useState([]);
  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState([]);
  const [isIoOpen, setIsIoOpen] = useState(false);
  const [values, setValues] = useState({
    message: "",
    user: userName,
    room: roomName,
  });

  useEffect(() => {
    const handleParticipants = (data) => {
      setParticipants(data);
    };

    const handleUserJoined = (user) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        `${user} Joined the Room`,
      ]);
    };

    const handleUserLeft = (user) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        `${user} Left the Room`,
      ]);
    };

    const handleMessageSent = (datas) => {
      console.log(datas);
      setChats((prevChats) => [...prevChats, datas]);
    };

    io.on("participants", handleParticipants);
    io.on("userJoined", handleUserJoined);
    io.on("userLeft", handleUserLeft);
    io.on("messageSent", handleMessageSent);

    // Cleanup listener on component unmount
    return () => {
      io.off("participants", handleParticipants);
      io.off("userJoined", handleUserJoined);
      io.off("userLeft", handleUserLeft);
      io.off("messageSent", handleMessageSent);
    };
  }, [io]);

  // handle the host leaving the room
  const handleLeave = () => {
    const datas = { user: userName, room: roomName };
    io.emit("leftRoom", datas);
    closePage();
  };

  // toggler of notification
  const showIo = () => {
    setIsIoOpen(!isIoOpen);
  };

  // handle message sending
  const handleSend = () => {
    const { message, user, room } = values;
    if (!message || !user || !room) {
      return;
    }

    io.emit("sendMessage", values);
    setValues({ ...values, message: "" }); // Clear the input
  };

  // handling text input message change
  const handleChange = (e) => {
    const { value, name } = e.target;
    setValues({ ...values, [name]: value });
  };



  return (
    <span>
      <h3>
        {roomName + "\t\t"}
        <button onClick={handleLeave} className={s.backButton}>Leave</button>
        <span onClick={showIo}>{icons.infoFill}</span>
      </h3>
      <section className={layout.main}>
        {isIoOpen ? (
          <div className={layout.ioPanel}>
            {messages.map((message, index) => (
              <span key={index}>{message}</span>
            ))}
          </div>
        ) : ("")}
        <div className={layout.chatPanel}>
          {/* top chat panel */}
          <div className={layout.chatPanelTop}>
            {chats.map((chat, index) => (
              <div className={layout.chatBox} key={index}>
                <div src=''></div>
                <div>
                  <p>👤{chat.user === values.user? "You": chat.user}</p>
                  <p>{chat.message}</p>
                </div>
              </div>
            ))}
          </div>
          {/* bottom */}
          <div className={layout.chatPanelBottom}>
            <input
              type='text'
              name="message"
              value={values.message}
              onChange={handleChange}
            />
            <button type='button' onClick={handleSend}>
              send
              {icons.sendFill}
            </button>
          </div>
        </div>
      </section>
    </span>
  );
}

export default HostRoom;
