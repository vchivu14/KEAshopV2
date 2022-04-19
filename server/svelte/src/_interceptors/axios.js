import axios from "axios";

let refresh = false;

axios.interceptors.response.use(resp => resp, async error => {
    if (error.response.status === 401 && !refresh) {
        refresh = true;
        const response = await axios.post("accounts/refresh-token", {}, {withCredentials: true});

        if (response.status === 200) {
            return axios(error.config);
        }
    }
    refresh = false;
    return error;
})