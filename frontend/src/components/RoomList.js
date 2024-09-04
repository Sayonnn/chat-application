import React, { useEffect, useState } from 'react';
import layout from '../css/layout.module.css';
import s from '../css/style.module.css';
import ParticipantRoom from './ParticipantRoom';
import JoinRoom from './JoinRoom';

function RoomList({ setIsPageOpen, setPageComponent,io }) {
  const [rooms, setRooms] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [roomDetails, setRoomDetails] = useState(null);
  // handle room joining

  const openModal = (r) => {
    setIsModalOpen(!isModalOpen);
    console.log(r);
    setRoomDetails(r)
  }

  useEffect(() => {
    io.on("rooms", (datas) => {
      setRooms(datas);
    });

    return () => {
      io.off("rooms");
    };
  }, []);

  return (
    <div className={layout.roomsContainer}>
      {/* <h3 className={layout.title}>Room List</h3> */}
      {isModalOpen && (
        <JoinRoom roomDetails={roomDetails} setPageComponent={setPageComponent} setIsPageOpen={setIsPageOpen} io={io}/>
      )}
      <div className={s.card}>
        <table>
          <thead>
            <tr><th>Host</th><th>Room</th><th></th></tr>
          </thead>
          <tbody>
            {rooms.map((r, i) => (
              <tr key={i}>
                <td>{r.host_name}</td>
                <td>{r.room_name}</td>
                <td>
                  <button
                    className={s.joinButton}
                    type='button'
                    onClick={() => openModal(r)}
                  >
                    Join Room
                  {r.room_state === "secured" && "🔒"}

                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default RoomList;
