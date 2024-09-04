import React, { useEffect, useState } from 'react';
import layout from './css/layout.module.css';
import s from './css/style.module.css';
import socket from 'socket.io-client';
import RoomList from './components/RoomList';
import HostRoom from './components/HostRoom';
import { icons } from './utilities/icons';
import AddRoom from './components/AddRoom';

// Initialize socket connection once
const io = socket("http://localhost:1024");

function App() {
  const [isPageOpen, setIsPageOpen] = useState(false);
  const [pageComponent, setPageComponent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // handle room creation
  const handleHost = (host_name, room_name, room_password, room_state) => {
    console.log(room_state)
    setIsPageOpen(false);
    setIsModalOpen(!isModalOpen);
    setPageComponent(null);
    if (!room_name || !host_name) {
      return;
    }

    const datas = { room:room_name, user:host_name,pass:room_password,state:room_state };
    const createRoom  = io.emit("hostRoom", datas);
    if(createRoom){
      alert("Room Created Successfully");
      setIsModalOpen(false);
      setPageComponent(
        <HostRoom
          userName={host_name}
          roomName={room_name}
          closePage={() => setIsPageOpen(false)}
          io={io}
        />
      );
      setIsPageOpen(true);
    }

  };



  return (
    <>
      <div className={layout.parent}>
        <span className={layout.header}>
          <h1 className={layout.title}>Chat App</h1>
        </span>
        <div className={layout.buttonContainer}>
          <button type='button' onClick={handleHost} className={s.button}>
            Host Room
          </button>
        </div>
        {isPageOpen ? (
          pageComponent
        ) : (
          <RoomList
            setIsPageOpen={setIsPageOpen}
            setPageComponent={setPageComponent}
            io={io}
          />
        )}
      </div>

      {isModalOpen && (
        <AddRoom  handleHost={handleHost} setIsPageOpen={setIsPageOpen}/>
      )}
    </>
  );
}

export default App;
