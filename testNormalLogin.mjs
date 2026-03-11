import axios from 'axios';

async function testNormalLogin() {
    try {
        console.log("Testing normal login...");
        const res = await axios.post("http://localhost:5000/api/auth/login", {
            email: "nilammegha4@gmail.com",
            password: "password123", // whatever it is, just to hit the endpoint
            role: "user"
        });
        console.log("Success! Response:", res.data);
    } catch (error) {
        console.log("Failed. Status:", error.response?.status);
        console.log("Response:", error.response?.data);
    }
}

testNormalLogin();
