import React, { useState } from 'react'
import s from '../css/modal.module.css'
function AddRoom({ handleHost }) {
    const [values, setValues] = useState({
        room_password: "",
        room_state: "unsecured",
        host_name: "",
        room_name: "",
    })
    const [isLocked, setIsLocked] = useState(false);

    const handleChange = e => {
        const { name, value } = e.target;
        setValues({ ...values, [name]: value })
    }

    const handleCheckChange = e => {
        if (e.target.checked) {
            setValues({ ...values, room_state: "secured" })
            setIsLocked(true)
        } else {

            setValues({ ...values, room_state: "unsecured", room_password: "" })
            setIsLocked(false)
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        const { host_name, room_name, room_password, room_state } = values;
        console.log(values);
        if (!host_name || !room_name) {
            return;
        }

        handleHost(host_name, room_name, room_password || "", room_state)
    }
    return (
        <div className={s.modalContainer}>
            <div className={s.headerContainer}>
                <h3 className={s.title}>Create Room</h3>
                <label>
                    <input type='checkbox' name='status' onChange={handleCheckChange}></input>
                    Locked
                </label>
            </div>
            <form onSubmit={handleSubmit}>
                <label for="host_name">Host Name:</label>
                <input type='text' name='host_name' onChange={handleChange} value={values.host_name}></input>
                <label for="host_name">Room Details:</label>
                <input type='text' name='room_name' placeholder='Enter room name' onChange={handleChange} value={values.room_name}></input>
                {isLocked && (
                    <input type='password' name='room_password' placeholder="Enter room password" onChange={handleChange} value={values.room_password} required></input>
                )}
                <div className={s.buttonsContainer}>
                    <button type='submit' className={s.button}>Create Room</button>
                </div>
            </form>
        </div>
    )
}

export default AddRoom