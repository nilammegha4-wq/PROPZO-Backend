import axios from 'axios';

async function testLogin() {
    try {
        const res = await axios.post("http://localhost:5000/api/auth/login", {
            email: "admin@gmail.com",
            password: "admin123",
            role: "admin"
        });
        console.log("Success! Response:");
        console.log(res.data);
    } catch (error) {
        console.log("Failed. Status:", error.response?.status);
        console.log("Response:", error.response?.data);
    }
}

testLogin();
