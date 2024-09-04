import React, { useState } from 'react'
import s from '../css/modal.module.css'
import ParticipantRoom from './ParticipantRoom';

function JoinRoom({ setPageComponent, setIsPageOpen, io, roomDetails }) {
    const [wrongPasswordOpen, setWrongPasswordOpen] = useState(false);
    const [values, setValues] = useState({
        room_password: "",
        user_name: "",
    })

    const handleChange = e => {
        const { name, value } = e.target;
        setValues({ ...values, [name]: value })
        if (name === "room_password") {
            setWrongPasswordOpen(false);
        }
    }

    // handle room joining
    const handleJoin = (e) => {
        e.preventDefault();
        setPageComponent(null)
        const { room_name, host_name, room_pass, room_state } = roomDetails;
        const { room_password, user_name } = values;
        if (room_state === "secured") {
            if (room_pass === room_password) {
                goJoinMethod(room_name, user_name, host_name)
            } else {
                setWrongPasswordOpen(true);
            }
        } else {
            goJoinMethod(room_name,user_name,host_name)
        }
    }

    // clean methods calling
    const goJoinMethod = (room_name, user_name, host_name) => {
        io.emit("joinRoom", { room: room_name, user: user_name });
        const infos = { host_name, room_name, user_name };
        setPageComponent(<ParticipantRoom infos={infos} setIsPageOpen={setIsPageOpen} setPageComponent={setPageComponent} io={io} />)
        setIsPageOpen(true)
        // reset input fields
        setValues({ ...values, room_password: "", user_name: "" })
    }

    return (
        <div className={s.modalContainer}>
            <div className={s.headerContainer}>
                <h3 className={s.title}>Join Room</h3>
            </div>
            <form onSubmit={handleJoin}>
                <label for="user_name">User Name:</label>
                <input type='text' name='user_name' placeholder='Enter Username' onChange={handleChange} value={values.user_name}></input>
                {roomDetails.room_state === "secured" && (
                    <>
                        <label for="host_name">Room Password:</label>
                        <input type='password' name='room_password' placeholder='Enter room password' onChange={handleChange} value={values.room_password}></input>
                        {wrongPasswordOpen && <p className={s.wrongPassword}>Wrong Password please try again</p>}
                    </>
                )}
                <div className={s.buttonsContainer}>
                    <button type='submit' className={s.button}>Join Room</button>
                </div>
            </form>
        </div>
    )
}

export default JoinRoom