import React, { useEffect, useState } from 'react';
import s from '../css/style.module.css';
import layout from '../css/layout.module.css';
import { icons } from '../utilities/icons';
function ParticipantRoom({ infos, setIsPageOpen, setPageComponent, io }) {
  const [participants, setParticipants] = useState([]);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]); // New state to manage messages
  const [chat, setChat] = useState([]);
  const [isIoOpen, setIsIoOpen] = useState(false);
  const [values, setValues] = useState({
    message: "",
    user_name: infos.user_name || "",
    room_name: infos.room_name || "",
    host_name: infos.host_name || ""
  })


  useEffect(() => {

    io.emit("getParticipants", { room: values.room_name });

    io.on("participants", (datas) => {
      console.log(datas);
      setParticipants(datas);
    });

    io.on("userJoined", (user) => {
      setMessages(prev => [
        ...prev,
        `${user} Joined the room`
      ])
    });

    io.on("userLeft", (user) => {
      setMessages(prev => [
        ...prev,
        `${user} Left the room`
      ])
    });

    const handleMessageSent = (datas) => {
      console.log(datas);
      setChats((prevChats) => [...prevChats, datas]);
    };

    io.on("messageSent", handleMessageSent)

    // Cleanup listener on component unmount
    return () => {
      io.off("participants");
      io.off("userJoined");
      io.off("userLeft");
      io.off("messageSent", handleMessageSent);
    };
  }, []);


  const handleLeave = () => {
    const datas = { user: values.user_name, room: values.room_name };
    io.emit("leftRoom", datas);
    setIsPageOpen(false);
    setPageComponent(null)
  };

  const showIo = () => {
    setIsIoOpen(!isIoOpen);
  }

  // handle message sending
  const handleSend = () => {
    const { message, user_name, room_name } = values;
    if (!message || !user_name || !room_name) {
      return;
    }
    // reformat datas to be send
    const datas = { message: message, user: user_name, room: room_name }
    io.emit("sendMessage", datas)
    setValues({ ...values, message: "" })
  }

  const handleChange = (e) => {
    const { value, name } = e.target;
    setValues({ ...values, [name]: value })
  }

  return (
    <>
      <span className={s.header}>
        <h3 className={s.top}>
          {values.room_name + "\t\t"}
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
                    <p>{values.host_name ? "👮": "👤"}{chat.user === values.user_name ? "You": chat.user}</p>
                    <p>{chat.message}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* bottom */}
            <div className={layout.chatPanelBottom}>
              <input type='text' name="message" value={values.message} onChange={handleChange}></input>
              <button type='button' onClick={handleSend}>
                send
                {icons.sendFill}
              </button>
            </div>
          </div>
        </section>
      </span>
    </>
  );
}

export default ParticipantRoom;
