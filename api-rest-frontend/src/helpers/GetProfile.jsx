import React from 'react'
import { Global } from '../helpers/Global';

export const GetProfile = async (userId, setState) => {
    const token = localStorage.getItem("token");
    const request = await fetch(Global.url + "user/profile/" + userId, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": token
        }
    })
    const data = await request.json();
    if (data.status == "success") {
        setState(data.user);
    }
    return data;
}
