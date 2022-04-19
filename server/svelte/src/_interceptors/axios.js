import axios from "axios";

axios.defaults.baseURL = __myapp["env"].BASE_URL;

let refresh = false;

axios.interceptors.response.use(resp => resp, async error => {
    if (error.response.status === 401 && !refresh) {
        refresh = true;
        const response = await axios.post("accounts/refresh-token", {}, {withCredentials: true});

        if (response.status === 200) {
            console.log(response.status)
            axios.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;
            return axios(error.config);
        }
    }
    refresh = false;
    return error;
})

// axios.interceptors.request.use(
//     function(config) {
//         const token = localStorage.getItem("user").token;
//         if (token) {
//             config.headers["Authorization"] = 'Bearer ' + token;
//         }
//         return config;
//     },
//     function (error) {
//         return Promise.reject(error);
//     }
// )