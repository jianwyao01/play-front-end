let isScheduled = false;
const jobs = [];

export function enqueueJob(job) {
    jobs.push(job);
    scheduleUpdate();
}

export function nextTick() {
    scheduleUpdate()
    return flushPromises()
}

function flushPromises() {
    return new Promise(resolve => setTimeout(resolve))
}

function scheduleUpdate() {
    if (isScheduled) {
        return;
    }

    isScheduled = true;
    queueMicrotask(processJobs);
}

function processJobs() {
    while (jobs.length > 0) {
        const job = jobs.shift();
        const result = job();
        Promise.resolve(result)
            .then(() => {

            }, (err) => {
                console.error(`[scheduler] Uncaught error in job: ${err.message}`);
            })
    }

    isScheduled = false;
}
