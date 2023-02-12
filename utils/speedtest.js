const { exec } = require("child_process");

let SPEEDTEST_IS_RUNNING = false;
let EULA_IS_ACCEPTED = false;

const acceptEulaSpeedtest = async () => {
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
}

const startSpeedtest = async (serverIds = [], excludeServerIds = []) => {
    return new Promise(async (resolve, reject) => {
        if (!EULA_IS_ACCEPTED)
            reject("EULA not accepted");
        if (SPEEDTEST_IS_RUNNING)
            reject("Speedtest is already running");
        sIds = getValidateServerIds(serverIds) || getValidateServerIds(process.env.SERVER_IDS?.split(','));
        eIds = getValidateServerIds(excludeServerIds) || getValidateServerIds(process.env.EXCLUDE_SERVER_IDS?.split(','));
        let serverIdString = "";
        if (sIds || eIds) {
            const serverId = await getRandomServerId(sIds, eIds)
            if (serverId)
                serverIdString = " --server-id " +serverId;
        }
        SPEEDTEST_IS_RUNNING = true;
        exec("speedtest --selection-details -f json" + serverIdString, (error, stdout, stderr) => {
            SPEEDTEST_IS_RUNNING = false;
            if (error || stderr)
                reject(error?.message || stderr);
            try {
                resolve(JSON.parse(stdout));
            } catch (error) {
                reject('Error starting speedtest')
            }
        });
    });
}

const getRandomServerId = async (serverIds = [], excludeServerIds = []) => {
    if (!serverIds.length)
        serverIds = await new Promise((resolve, reject) => {
            exec("speedtest -L -f json", (error, stdout, stderr) => {
                if (error || stderr)
                    console.error(error?.message || stderr);
                try {
                    const { servers } = JSON.parse(stdout);
                    if (!servers?.length) {
                        console.error("No servers found");
                        resolve([]);
                    }
                    resolve(servers.map(server => server.id));
                } catch (error) {
                    console.error(error);
                    reject('Error getting server ids');
                }
            });
        });
    serverIds = serverIds.filter(serverId => !excludeServerIds.includes(serverId));
    return serverIds[Math.floor(Math.random() * serverIds.length)];
}

const getValidateServerIds = (serverIds) => {
    return serverIds?.length && serverIds
}

module.exports = {
    acceptEulaSpeedtest,
    startSpeedtest,
    EULA_IS_ACCEPTED: () => EULA_IS_ACCEPTED
}