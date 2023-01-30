const { exec } = require("child_process");

let SPEEDTEST_IS_RUNNING = false;
let EULA_IS_ACCEPTED = false;

module.exports = {
    acceptEulaSpeedtest() {
        if (process.env.NODE_ENV === "development") {
            EULA_IS_ACCEPTED = true;
            return;
        }
        console.log("Accepting EULA");
        exec("speedtest --accept-license --accept-gdpr", (error, stdout, stderr) => {
            if (error || stderr)
                console.error(error?.message || stderr);
            EULA_IS_ACCEPTED = true;
            console.log("EULA accepted");
        })
    },
    startSpeedtest(serverIds = []) {
        return new Promise((resolve, reject) => {
            if (!EULA_IS_ACCEPTED)
                reject("EULA not accepted");
            if (SPEEDTEST_IS_RUNNING)
                reject("Speedtest is already running");
            let serverIdString = ""
            if (serverIds.length)
                serverIdString = " --server-id " + serverIds[Math.floor(Math.random() * serverIds.length)];
            SPEEDTEST_IS_RUNNING = true;
            exec("speedtest --selection-details -f json" + serverIdString, (error, stdout, stderr) => {
                SPEEDTEST_IS_RUNNING = false;
                if (error || stderr)
                    reject(error?.message || stderr);
                resolve(JSON.parse(stdout));
            });
        });
    },
    EULA_IS_ACCEPTED: () => EULA_IS_ACCEPTED
}