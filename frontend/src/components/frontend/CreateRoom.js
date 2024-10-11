import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import socketIOClient from 'socket.io-client';
import Whiteboard from '../Whiteboard';

const ENDPOINT = 'http://localhost:5000';
const CreateRoom = () => {
  const [id, setId] = useState('');
  const [roomData, setData] = useState({
    username: "",
    userId: "",
  });
  const socket = socketIOClient(ENDPOINT);
  const navigate = useNavigate();


  useEffect(() => {
    const newUuid = ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
      (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16)
    );
    setId(newUuid);

  }, [roomData])
  const handleCreate = () => {
    // if (!roomData.username ) {
    //   alert("c");
    //   return
    // }
    
      const updatedRoomData = { username: roomData.username, userId: id };
      setData(updatedRoomData);
      const lent = { ...{ roomData } }
      window.open(`/newRoom/${id}`, '_blank')

      socket.emit("createroom", (lent))
      console.log(Object.keys(lent.roomData).length)
    
  }

  return (
    <div>
      <input
        type="text"

        placeholder="Generate code"
        className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-400"
        onChange={(e) => setData({ ...roomData, username: e.target.value, userId: id })}

      />

      {/* {!roomData.username && roomData.userId ? alert("fill") :

} */}
      <button className='bg-primary rounded-md text-grey-100'
        onClick={handleCreate}

      >createroom</button>
    </div>
  );

}

export default CreateRoom;
